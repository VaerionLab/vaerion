package vae

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
)

// ── helpers ─────────────────────────────────────────────────────────────

type recordingAuth struct {
	mu     sync.Mutex
	auth   map[string][]string // path → Authorization headers seen
	bodies map[string]map[string]any
}

func newRecordingAuth(handler http.HandlerFunc) (*httptest.Server, *recordingAuth) {
	rec := &recordingAuth{auth: map[string][]string{}, bodies: map[string]map[string]any{}}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rec.mu.Lock()
		if auth := r.Header.Get("Authorization"); auth != "" {
			rec.auth[r.URL.Path] = append(rec.auth[r.URL.Path], auth)
		}
		if r.Body != nil {
			var m map[string]any
			if json.NewDecoder(r.Body).Decode(&m) == nil {
				rec.bodies[r.URL.Path] = m
			}
		}
		rec.mu.Unlock()
		if handler != nil {
			handler(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if r.Method == http.MethodPost && r.URL.Path == "/runs" {
			_, _ = w.Write([]byte(`{"run_id":"crn_run_STUB000000000000000000","trace_id":"trc_stub","kind":"agent"}`))
			return
		}
		_, _ = w.Write([]byte(`{}`))
	}))
	return srv, rec
}

func (rec *recordingAuth) seenAuth(t *testing.T, path string) string {
	t.Helper()
	rec.mu.Lock()
	defer rec.mu.Unlock()
	v := rec.auth[path]
	if len(v) == 0 {
		return "<absent>"
	}
	return v[len(v)-1]
}

func (rec *recordingAuth) seenBody(t *testing.T, path string) map[string]any {
	t.Helper()
	rec.mu.Lock()
	defer rec.mu.Unlock()
	return rec.bodies[path]
}

// ── auth header law ─────────────────────────────────────────────────────

func TestOpenPathsNeverCarryTheToken(t *testing.T) {
	srv, rec := newRecordingAuth(nil)
	defer srv.Close()
	c, err := NewDaemonClient(srv.URL, "secret-token")
	if err != nil {
		t.Fatalf("NewDaemonClient: %v", err)
	}
	if _, err := c.Health(); err != nil {
		t.Fatalf("Health: %v", err)
	}
	if _, err := c.Version(); err != nil {
		t.Fatalf("Version: %v", err)
	}
	if _, err := c.OpenAPI(); err != nil {
		t.Fatalf("OpenAPI: %v", err)
	}
	for _, p := range []string{"/health", "/version", "/openapi.json"} {
		if got := rec.seenAuth(t, p); got != "<absent>" {
			t.Fatalf("open path %s carried %q — token must never leave on metadata routes", p, got)
		}
	}
	// A protected path must carry the Bearer token.
	if _, err := c.GetRun("crn_run_AUTHCHECK00000000000000"); err != nil {
		t.Fatalf("GetRun: %v", err)
	}
	if got := rec.seenAuth(t, "/runs/crn_run_AUTHCHECK00000000000000"); got != "Bearer secret-token" {
		t.Fatalf("protected path Authorization = %q, want Bearer secret-token", got)
	}
}

// ── loopback law: refused in code before any byte is sent ───────────────

type countingTransport struct {
	mu     sync.Mutex
	called int
}

func (tr *countingTransport) RoundTrip(*http.Request) (*http.Response, error) {
	tr.mu.Lock()
	tr.called++
	tr.mu.Unlock()
	return nil, &VaerionError{Code: "E9999", Message: "transport must never be reached"}
}

func (tr *countingTransport) count() int {
	tr.mu.Lock()
	defer tr.mu.Unlock()
	return tr.called
}

func TestNonLoopbackBaseIsRefusedAtConstruction(t *testing.T) {
	for _, base := range []string{"http://10.0.0.7:8787", "http://192.168.1.4:1234", "http://example.com:80", "not a url"} {
		c, err := NewDaemonClient(base, "t")
		if err == nil {
			t.Fatalf("base %q must be refused", base)
		}
		ve, ok := err.(*VaerionError)
		if !ok || ve.Code != "E2006" {
			t.Fatalf("base %q: got %#v, want E2006", base, err)
		}
		if c != nil {
			t.Fatalf("refused construction must not return a client")
		}
	}
}

func TestLoopbackRefusalHappensBeforeAnyDial(t *testing.T) {
	tr := &countingTransport{}
	c := &DaemonClient{Base: "http://10.0.0.7:8787", Token: "t", HTTP: &http.Client{Transport: tr}}
	_, err := c.Health()
	ve, ok := err.(*VaerionError)
	if !ok || ve.Code != "E2006" {
		t.Fatalf("Health on non-loopback base: got %#v, want E2006", err)
	}
	if tr.count() != 0 {
		t.Fatalf("the transport was reached %d times — refusal must precede any dial", tr.count())
	}
}

func TestLoopbackAcceptsLoopbackForms(t *testing.T) {
	for _, base := range []string{"http://127.0.0.1:8787", "http://localhost:8787", "http://127.9.9.9:1", "http://[::1]:8787"} {
		if _, err := NewDaemonClient(base, "t"); err != nil {
			t.Fatalf("base %q must be accepted: %v", base, err)
		}
	}
}

// ── error payload contract over the wire ────────────────────────────────

func TestWireErrorBecomesVaerionError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(`{"error":{"code":"E2003","name":"not_found","message":"unknown run","fix":"check GET /runs","detail":{"run_id":"crn_run_MISSING0000000000"}}}`))
	}))
	defer srv.Close()
	c, err := NewDaemonClient(srv.URL, "t")
	if err != nil {
		t.Fatalf("NewDaemonClient: %v", err)
	}
	_, err = c.GetRun("crn_run_MISSING0000000000")
	ve, ok := err.(*VaerionError)
	if !ok {
		t.Fatalf("want *VaerionError, got %#v", err)
	}
	if ve.Code != "E2003" || ve.Message != "unknown run" || ve.Fix != "check GET /runs" {
		t.Fatalf("error contract broken: %#v", ve)
	}
	if ve.Status != http.StatusNotFound {
		t.Fatalf("wire status not attached: %d", ve.Status)
	}
	detail, ok := ve.Detail.(map[string]any)
	if !ok || detail["run_id"] != "crn_run_MISSING0000000000" {
		t.Fatalf("detail not carried: %#v", ve.Detail)
	}
	if ve.Error() != "E2003 unknown run (Fix: check GET /runs)" {
		t.Fatalf("rendering = %q", ve.Error())
	}
}

func TestUnreadableErrorBodyIsE1900(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("<html>boom</html>"))
	}))
	defer srv.Close()
	c, err := NewDaemonClient(srv.URL, "t")
	if err != nil {
		t.Fatalf("NewDaemonClient: %v", err)
	}
	_, err = c.Health()
	ve, ok := err.(*VaerionError)
	if !ok || ve.Code != "E1900" || !strings.Contains(ve.Message, "unreadable body") {
		t.Fatalf("want E1900 unreadable body, got %#v", err)
	}
}

func TestUnreachableDaemonIsE1601WithAFix(t *testing.T) {
	c, err := NewDaemonClient("http://127.0.0.1:1", "t")
	if err != nil {
		t.Fatalf("NewDaemonClient: %v", err)
	}
	_, err = c.GetRun("crn_run_UNKNOWNUNKNOWNUNKNOWNUNKNO")
	ve, ok := err.(*VaerionError)
	if !ok || ve.Code != "E1601" {
		t.Fatalf("want E1601, got %#v", err)
	}
	if ve.Fix == "" {
		t.Fatalf("E1601 must carry a Fix line")
	}
}

// ── run start body contract ─────────────────────────────────────────────

func TestStartAgentRunBodyContract(t *testing.T) {
	srv, rec := newRecordingAuth(nil)
	defer srv.Close()
	c, _ := NewDaemonClient(srv.URL, "t")
	if _, err := c.StartAgentRun("do the thing", []map[string]any{{"kind": "note"}}, "", 3); err != nil {
		t.Fatalf("StartAgentRun: %v", err)
	}
	body := rec.seenBody(t, "/runs")
	if body["kind"] != "agent" || body["goal"] != "do the thing" {
		t.Fatalf("kind/goal wrong: %#v", body)
	}
	if body["planner"] != "inline" {
		t.Fatalf("empty planner must default to inline, got %#v", body["planner"])
	}
	steps, ok := body["steps"].([]any)
	if !ok || len(steps) != 1 || steps[0].(map[string]any)["kind"] != "note" {
		t.Fatalf("steps wrong: %#v", body["steps"])
	}
	if body["max_steps"] != float64(3) {
		t.Fatalf("max_steps wrong: %#v", body["max_steps"])
	}
}

func TestStartAgentRunOmitsUnsetKeys(t *testing.T) {
	srv, rec := newRecordingAuth(nil)
	defer srv.Close()
	c, _ := NewDaemonClient(srv.URL, "t")
	if _, err := c.StartAgentRun("g", nil, "model", 0); err != nil {
		t.Fatalf("StartAgentRun: %v", err)
	}
	body := rec.seenBody(t, "/runs")
	if _, ok := body["steps"]; ok {
		t.Fatalf("nil steps must omit the key: %#v", body)
	}
	if _, ok := body["max_steps"]; ok {
		t.Fatalf("maxSteps 0 must omit the key: %#v", body)
	}
	if body["planner"] != "model" {
		t.Fatalf("explicit planner must pass through: %#v", body["planner"])
	}
}

func TestStartRunWithoutRunIDIsE1900(t *testing.T) {
	srv, _ := newRecordingAuth(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{}`)) // 201-shaped acceptance with no run_id
	})
	defer srv.Close()
	c, _ := NewDaemonClient(srv.URL, "t")
	_, err := c.StartAgentRun("g", nil, "", 0)
	ve, ok := err.(*VaerionError)
	if !ok || ve.Code != "E1900" {
		t.Fatalf("want E1900 for missing run_id, got %#v", err)
	}
}

// ── WaitForRun terminal detection + timeout ─────────────────────────────

func TestWaitForRunClosesOnReceipt(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"run_id":"crn_run_X","status":"closed","journal_ok":true,"receipt":{"run_id":"crn_run_X","journal":{"records":9,"head_hash":"abcd"}}}`))
	}))
	defer srv.Close()
	c, _ := NewDaemonClient(srv.URL, "t")
	status, err := c.WaitForRun("crn_run_X", 2*time.Second)
	if err != nil {
		t.Fatalf("closed run must return: %v", err)
	}
	if status.Status != "closed" || !status.JournalOK {
		t.Fatalf("status fold wrong: %#v", status)
	}
	if status.Receipt == nil {
		t.Fatalf("receipt must decode into the RunStatus view")
	}
}

func TestWaitForRunTimesOutOnOpenRun(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"run_id":"crn_run_X","status":"open","receipt":null}`))
	}))
	defer srv.Close()
	c, _ := NewDaemonClient(srv.URL, "t")
	start := time.Now()
	_, err := c.WaitForRun("crn_run_X", 400*time.Millisecond)
	ve, ok := err.(*VaerionError)
	if !ok || ve.Code != "E1602" {
		t.Fatalf("open run must time out with E1602, got %#v", err)
	}
	if elapsed := time.Since(start); elapsed < 300*time.Millisecond {
		t.Fatalf("wait returned too early: %s", elapsed)
	}
}

func TestWaitForRunTerminalStatusWithoutReceipt(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"run_id":"crn_run_X","status":"awaiting_gate","receipt":null}`))
	}))
	defer srv.Close()
	c, _ := NewDaemonClient(srv.URL, "t")
	status, err := c.WaitForRun("crn_run_X", 2*time.Second)
	if err != nil {
		t.Fatalf("awaiting_gate must be terminal: %v", err)
	}
	if status.Status != "awaiting_gate" {
		t.Fatalf("status = %q", status.Status)
	}
}

// ── SSE over the wire ───────────────────────────────────────────────────

func TestEventsIteratorParsesFrames(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		flusher := w.(http.Flusher)
		_, _ = w.Write([]byte(": keep-alive\n"))
		_, _ = w.Write([]byte("data: {\"seq\":1,\"type\":\"run.opened\"}\n\n"))
		flusher.Flush()
		_, _ = w.Write([]byte("data: hello-not-json\n\n")) // non-dict → skipped
		_, _ = w.Write([]byte("data: {\"seq\":2,\"type\":\"step.note\"}\n\n"))
		flusher.Flush()
		_, _ = w.Write([]byte("event: end\ndata: {\"run_id\":\"crn_run_X\"}\n\n"))
	}))
	defer srv.Close()
	c, _ := NewDaemonClient(srv.URL, "t")
	var got []map[string]any
	for ev := range c.Events("crn_run_X") {
		got = append(got, ev)
	}
	if len(got) != 3 {
		t.Fatalf("want 3 dict payloads (incl. the end frame's data), got %d: %#v", len(got), got)
	}
	if got[0]["type"] != "run.opened" {
		t.Fatalf("first payload wrong: %#v", got[0])
	}
	if got[1]["seq"] != float64(2) {
		t.Fatalf("second payload wrong: %#v", got[1])
	}
	if got[2]["run_id"] != "crn_run_X" {
		t.Fatalf("end frame data must be yielded like any dict payload: %#v", got[2])
	}
}

func TestOpenEventsReportsDialError(t *testing.T) {
	c, _ := NewDaemonClient("http://127.0.0.1:1", "t")
	_, err := c.OpenEvents("crn_run_X")
	ve, ok := err.(*VaerionError)
	if !ok || ve.Code != "E1601" {
		t.Fatalf("OpenEvents must surface the dial error, got %#v", err)
	}
}

// ── shutdown echo guard ─────────────────────────────────────────────────

func TestShutdownRequiresToken(t *testing.T) {
	c, err := NewDaemonClient("http://127.0.0.1:8787", "")
	if err != nil {
		t.Fatalf("NewDaemonClient: %v", err)
	}
	err = c.Shutdown()
	ve, ok := err.(*VaerionError)
	if !ok || ve.Code != "E2000" {
		t.Fatalf("tokenless shutdown must be E2000, got %#v", err)
	}
}

func TestShutdownEchoesTheTokenInTheBody(t *testing.T) {
	srv, rec := newRecordingAuth(nil)
	defer srv.Close()
	c, _ := NewDaemonClient(srv.URL, "secret-token")
	if err := c.Shutdown(); err != nil {
		t.Fatalf("Shutdown: %v", err)
	}
	body := rec.seenBody(t, "/shutdown")
	if body["token"] != "secret-token" {
		t.Fatalf("echo guard broken: %#v", body)
	}
	if got := rec.seenAuth(t, "/shutdown"); got != "Bearer secret-token" {
		t.Fatalf("shutdown Authorization = %q", got)
	}
}
