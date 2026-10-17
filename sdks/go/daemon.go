// VaeDaemonClient — the wire client for the local Vaerion daemon.
//
// The daemon (`vae serve`) is loopback-only with a first-run pairing token
// (ADR-0010). This client speaks exactly the published contract
// (`/openapi.json`, generated from the same route table that dispatches —
// packages/vaerion/src/api/routes.ts):
//
//      GET  /health, /version, /openapi.json   (open metadata routes)
//      POST /runs                              start an agent|workflow run
//      GET  /runs/{id}                         folded status + terminal receipt
//      GET  /runs/{id}/events                  SSE event stream (cursor replay)
//      POST /runs/{id}/answer                  resolve a durable human gate
//      POST /shutdown                          token-echo guarded shutdown
//
// Auth: `Authorization: Bearer <token>` on every route except the metadata
// trio. Errors arrive as `{"error": {code, message, fix, detail}}` and are
// raised as *VaerionError with the E-code intact. Loopback law (standard
// §11): a non-loopback base is refused IN CODE (E2006) before any byte is
// sent. Standard library only.
package vae

import (
        "bytes"
        "encoding/json"
        "fmt"
        "io"
        "net"
        "net/http"
        "net/url"
        "strings"
        "time"
)

// DefaultDaemonBase is the daemon default the CLI binds (port 7897 is the
// `vae serve` default; this constant mirrors the Python reference's base).
const DefaultDaemonBase = "http://127.0.0.1:7897"

const defaultRequestTimeout = 30 * time.Second

// DaemonClient is a thin, honest client over the daemon wire. Nothing is
// invented here: every method maps 1:1 to a route in the published
// OpenAPI surface (VAERION_SDK_STANDARD §0 law 4: thin).
type DaemonClient struct {
        // Base is the loopback daemon origin (no trailing slash).
        Base string
        // Token is the pairing token; sent as Bearer on non-open paths only.
        Token string
        // HTTP is the transport for request/response calls (not streams).
        HTTP *http.Client
}

// NewDaemonClient creates a wire client. The base MUST be loopback — a
// non-loopback base is refused here (E2006) before any byte is sent, and
// re-checked on every request in case the field is mutated afterwards.
func NewDaemonClient(base, token string) (*DaemonClient, error) {
        if base == "" {
                base = DefaultDaemonBase
        }
        base = strings.TrimRight(base, "/")
        if err := assertLoopbackBase(base); err != nil {
                return nil, err
        }
        return &DaemonClient{
                Base:  base,
                Token: token,
                HTTP:  &http.Client{Timeout: defaultRequestTimeout},
        }, nil
}

// assertLoopbackBase is the client-side half of the loopback law (E2006,
// catalog: daemon_nonloopback_refused). Hosts accepted: localhost, ::1,
// and 127.0.0.0/8 — the same set the daemon itself accepts server-side.
func assertLoopbackBase(base string) error {
        u, err := url.Parse(base)
        if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
                return &VaerionError{
                        Code:    "E2006",
                        Message: fmt.Sprintf("the SDK refuses the daemon base %q: it is not a usable loopback http(s) URL", base),
                        Fix:     "Attach the SDK client to 127.0.0.1, localhost or [::1] only; remote daemon attachment requires a ratified transport-security ADR.",
                }
        }
        host := u.Hostname() // strips brackets from [::1]
        ip := net.ParseIP(host)
        if host != "localhost" && (ip == nil || !ip.IsLoopback()) {
                return &VaerionError{
                        Code:    "E2006",
                        Message: fmt.Sprintf("the SDK refuses the daemon base %q: %s is not loopback", base, host),
                        Fix:     "Attach the SDK client to 127.0.0.1, localhost or [::1] only; remote daemon attachment requires a ratified transport-security ADR.",
                }
        }
        return nil
}

// Health is the liveness probe: ok, engine version, daemon uptime (no token).
func (c *DaemonClient) Health() (Health, error) {
        var out Health
        err := c.request("GET", "/health", nil, &out)
        return out, err
}

// Version is the engine version of record: substrate, envelope version,
// and the published contract counts (no token).
func (c *DaemonClient) Version() (map[string]any, error) {
        var out map[string]any
        err := c.request("GET", "/version", nil, &out)
        return out, err
}

// OpenAPI is the generated OpenAPI contract — every route, described (no token).
func (c *DaemonClient) OpenAPI() (map[string]any, error) {
        var out map[string]any
        err := c.request("GET", "/openapi.json", nil, &out)
        return out, err
}

// StartAgentRun starts the supervised agent loop (background, serial per
// workspace). Returns the run coordinates; poll GetRun or stream Events.
// planner "" means "inline" (the daemon default); steps nil omits the key;
// maxSteps <= 0 omits the ceiling override.
func (c *DaemonClient) StartAgentRun(goal string, steps []map[string]any, planner string, maxSteps int) (RunStarted, error) {
        if planner == "" {
                planner = "inline"
        }
        body := map[string]any{"kind": "agent", "goal": goal, "planner": planner}
        if steps != nil {
                body["steps"] = steps
        }
        if maxSteps > 0 {
                body["max_steps"] = maxSteps
        }
        var out RunStarted
        err := c.request("POST", "/runs", body, &out)
        if err != nil {
                return out, err
        }
        if out.RunID == "" {
                return out, &VaerionError{Code: "E1900", Message: "daemon accepted the run but returned no run_id", Status: 201}
        }
        return out, nil
}

// StartWorkflowRun starts a deterministic workflow DAG execution (background).
func (c *DaemonClient) StartWorkflowRun(dag map[string]any) (RunStarted, error) {
        var out RunStarted
        err := c.request("POST", "/runs", map[string]any{"kind": "workflow", "dag": dag}, &out)
        if err != nil {
                return out, err
        }
        if out.RunID == "" {
                return out, &VaerionError{Code: "E1900", Message: "daemon accepted the run but returned no run_id", Status: 201}
        }
        return out, nil
}

// GetRun is the folded status: verification result, decisions, gates,
// receipt when closed (nothing is cached — the journal is the truth).
func (c *DaemonClient) GetRun(runID string) (RunStatus, error) {
        var out RunStatus
        err := c.request("GET", "/runs/"+url.PathEscape(runID), nil, &out)
        return out, err
}

// AnswerGate is human authority over a paused run — the durable gate
// resolution (`vae resume RUN_ID --answer JSON` over the wire). A nil
// answer lets the daemon apply its default ({"approved":true}).
func (c *DaemonClient) AnswerGate(runID, gateID string, answer map[string]any) (map[string]any, error) {
        body := map[string]any{"gate_id": gateID}
        if answer != nil {
                body["answer"] = answer
        }
        var out map[string]any
        err := c.request("POST", "/runs/"+url.PathEscape(runID)+"/answer", body, &out)
        return out, err
}

// WaitForRun polls GetRun until the run closes. Terminal = a receipt exists
// or the status leaves "open". On timeout it returns E1602 (with the last
// observed status for diagnosis). Poll interval: 100ms (python parity).
func (c *DaemonClient) WaitForRun(runID string, timeout time.Duration) (RunStatus, error) {
        deadline := time.Now().Add(timeout)
        var last RunStatus
        for time.Now().Before(deadline) {
                status, err := c.GetRun(runID)
                if err != nil {
                        return last, err
                }
                last = status
                if status.Receipt != nil || (status.Status != "" && status.Status != "open") {
                        return last, nil
                }
                time.Sleep(100 * time.Millisecond)
        }
        return last, &VaerionError{
                Code:    "E1602",
                Message: fmt.Sprintf("run %s did not close within %s", runID, timeout),
                Fix:     "inspect GET /runs/{id} and GET /runs/{id}/events for where it is paused",
        }
}

// Shutdown stops the daemon gracefully (token-echo guarded: the body must
// echo the pairing token, mismatch is 403 E2004).
func (c *DaemonClient) Shutdown() error {
        if c.Token == "" {
                return &VaerionError{Code: "E2000", Message: "shutdown requires the pairing token (echo guard)"}
        }
        var out map[string]any
        return c.request("POST", "/shutdown", map[string]any{"token": c.Token}, &out)
}

// request performs one authenticated JSON round trip. Non-2xx bodies are
// `{"error":{code,message,fix,detail}}` → *VaerionError (E1900 when the
// body is unreadable); connection failures are E1601 with a Fix line.
func (c *DaemonClient) request(method, path string, body any, out any) error {
        if err := assertLoopbackBase(c.Base); err != nil {
                return err // loopback law re-asserted before ANY byte is sent
        }
        var rdr io.Reader
        if body != nil {
                raw, err := json.Marshal(body)
                if err != nil {
                        return &VaerionError{Code: "E1900", Message: "request body is not encodable: " + err.Error()}
                }
                rdr = bytes.NewReader(raw)
        }
        req, err := http.NewRequest(method, c.Base+path, rdr)
        if err != nil {
                return &VaerionError{Code: "E1900", Message: "cannot build request: " + err.Error()}
        }
        req.Header.Set("Accept", "application/json")
        if body != nil {
                req.Header.Set("Content-Type", "application/json")
        }
        if c.Token != "" && !isOpenPath(path) {
                req.Header.Set("Authorization", "Bearer "+c.Token)
        }
        resp, err := c.HTTP.Do(req)
        if err != nil {
                return &VaerionError{
                        Code:    "E1601",
                        Message: fmt.Sprintf("cannot reach the daemon at %s: %v", c.Base, err),
                        Fix:     "start it with `vae serve` (loopback only) and pass the pairing token",
                }
        }
        defer resp.Body.Close()
        raw, err := io.ReadAll(resp.Body)
        if err != nil {
                return &VaerionError{Code: "E1900", Message: "cannot read the daemon response: " + err.Error(), Status: resp.StatusCode}
        }
        if resp.StatusCode < 200 || resp.StatusCode >= 300 {
                var payload map[string]any
                if json.Unmarshal(raw, &payload) == nil && payload != nil {
                        ve := ErrorFromPayload(payload)
                        ve.Status = resp.StatusCode
                        return ve
                }
                detail := any(nil)
                if len(raw) > 0 {
                        detail = string(raw)
                }
                return &VaerionError{
                        Code:    "E1900",
                        Message: fmt.Sprintf("daemon returned HTTP %d with an unreadable body", resp.StatusCode),
                        Detail:  detail,
                        Status:  resp.StatusCode,
                }
        }
        if out == nil || len(bytes.TrimSpace(raw)) == 0 {
                return nil
        }
        if err := json.Unmarshal(raw, out); err != nil {
                return &VaerionError{Code: "E1900", Message: "daemon returned an unreadable JSON body: " + err.Error(), Status: resp.StatusCode}
        }
        return nil
}
