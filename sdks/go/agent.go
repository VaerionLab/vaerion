// Client — the five-line Vaerion experience in Go (python Agent parity,
// sdks/python/src/vaerion/agent.py):
//
//	cwd, _ := os.MkdirTemp("", "vaerion-")
//	agent, _ := vae.NewClient(vae.WithCwd(cwd))
//	defer agent.Close()
//	result, _ := agent.Run("summarize the project")
//	fmt.Println(result.Receipt["journal"].(map[string]any)["head_hash"])
//	report, _ := agent.Verify(result.RunID)
//
// By default Client SPAWNS its own `vae serve --port <free> --host
// 127.0.0.1` with VAE_TRUST pre-provisioning the pairing token (the token
// is generated from crypto/rand and NEVER printed or logged), waits for
// /health to turn ok, and stops the daemon on Close. Pass WithBase/WithToken
// to attach to a daemon you run yourself. Verify executes the CLI of record
// against the journal bytes on disk — verification trusts bytes, not
// processes.
package vae

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

const (
	// defaultServeTimeout bounds the spawned daemon's path to a healthy /health.
	defaultServeTimeout = 20 * time.Second
	// defaultRunTimeout bounds Run/Workflow waits (python: 120s).
	defaultRunTimeout = 120 * time.Second
	// pairingTokenBytes matches python secrets.token_urlsafe(24).
	pairingTokenBytes = 24
)

// Client is a verified agent handle: run goals against the brokered loop,
// read receipts, verify journals. Bind it to exactly one workspace.
type Client struct {
	cwd          string
	client       *DaemonClient
	cmd          *exec.Cmd
	waitCh       chan error
	spawned      bool
	serveTimeout time.Duration
	closeOnce    sync.Once

	// attach-mode configuration (set by WithBase/WithToken before spawn decision)
	baseSet    bool
	baseURL    string
	tokenValue string
}

// ClientOption configures NewClient. Options that error fail construction
// loudly (loopback law, bad cwd) — never silently approximated.
type ClientOption func(*Client) error

// WithBase attaches to an existing loopback daemon instead of spawning one.
func WithBase(url string) ClientOption {
	return func(c *Client) error {
		c.base(url)
		return nil
	}
}

// WithToken sets the pairing token (attach mode, or for a daemon you spawn
// and provision yourself).
func WithToken(t string) ClientOption {
	return func(c *Client) error {
		c.token(t)
		return nil
	}
}

// WithCwd binds the client to one workspace directory (default: process cwd).
// The spawned daemon serves this directory and Verify runs the CLI here.
func WithCwd(dir string) ClientOption {
	return func(c *Client) error {
		abs, err := filepath.Abs(dir)
		if err != nil {
			return &VaerionError{Code: "E1900", Message: "cannot resolve the workspace directory: " + err.Error()}
		}
		if info, err := os.Stat(abs); err != nil || !info.IsDir() {
			return &VaerionError{Code: "E1900", Message: fmt.Sprintf("workspace directory %q is not a directory", abs)}
		}
		c.cwd = abs
		return nil
	}
}

// WithServeTimeout bounds how long NewClient waits for a spawned daemon
// to become healthy (default 20s, python parity).
func WithServeTimeout(d time.Duration) ClientOption {
	return func(c *Client) error {
		if d <= 0 {
			return &VaerionError{Code: "E1900", Message: "serve timeout must be positive"}
		}
		c.serveTimeout = d
		return nil
	}
}

// NewClient builds the five-line experience. Without WithBase it spawns
// its own loopback daemon (`vae serve --port <free> --host 127.0.0.1`,
// VAE_TRUST pre-provisioned) and waits for /health; with WithBase it
// attaches to a daemon you run yourself. The pairing token is never
// printed, logged, or persisted beyond the process (standard §11).
func NewClient(opts ...ClientOption) (*Client, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, &VaerionError{Code: "E1900", Message: "cannot determine the process working directory: " + err.Error()}
	}
	c := &Client{cwd: cwd, serveTimeout: defaultServeTimeout}
	for _, opt := range opts {
		if err := opt(c); err != nil {
			return nil, err
		}
	}
	if c.baseSet {
		dc, err := NewDaemonClient(c.baseURL, c.tokenValue)
		if err != nil {
			return nil, err
		}
		c.client = dc
		return c, nil
	}
	return c.spawn()
}

// The attach-mode fields live unexported so With* stay simple setters.
func (c *Client) base(url string) { c.baseURL = strings.TrimRight(url, "/"); c.baseSet = true }
func (c *Client) token(t string)  { c.tokenValue = t }

// RunOptions tune one Run/Workflow call.
type RunOptions struct {
	// Steps is the declared plan (inline planner). Nil + inline planner
	// ⇒ the honest default: a single declared note step.
	Steps []map[string]any
	// Planner is "inline" (default) or "model".
	Planner string
	// MaxSteps overrides the step ceiling (0 = engine default).
	MaxSteps int
	// Timeout bounds the wait for the run to close (default 120s).
	Timeout time.Duration
}

// RunOption mutates RunOptions.
type RunOption func(*RunOptions)

// WithSteps scripts the declared plan (tool or note steps).
func WithSteps(steps []map[string]any) RunOption { return func(o *RunOptions) { o.Steps = steps } }

// WithPlanner selects the planner ("inline" or "model").
func WithPlanner(p string) RunOption { return func(o *RunOptions) { o.Planner = p } }

// WithMaxSteps overrides the agent step ceiling.
func WithMaxSteps(n int) RunOption { return func(o *RunOptions) { o.MaxSteps = n } }

// WithRunTimeout bounds this run's wait.
func WithRunTimeout(d time.Duration) RunOption { return func(o *RunOptions) { o.Timeout = d } }

// Run executes one brokered, journaled agent run and waits for it to
// close, returning the final status view (receipt present once closed).
// Inline planning is DECLARED: with no steps the honest default is a
// single journaled note step — deterministic, no model calls, no fake
// intelligence. A failed step does NOT error: the run closes with a
// receipt and the agent fold carries outcome="failed" (evidence, not an
// exception — fail-closed fidelity, standard §0 law 3).
func (c *Client) Run(goal string, opts ...RunOption) (RunStatus, error) {
	o := RunOptions{Timeout: defaultRunTimeout}
	for _, f := range opts {
		f(&o)
	}
	steps := o.Steps
	planner := o.Planner
	if planner == "" {
		planner = "inline"
	}
	if planner == "inline" && steps == nil {
		steps = []map[string]any{{"kind": "note", "text": "goal: " + goal}}
	}
	started, err := c.client.StartAgentRun(goal, steps, planner, o.MaxSteps)
	if err != nil {
		return RunStatus{}, err
	}
	return c.client.WaitForRun(started.RunID, o.Timeout)
}

// Workflow executes one deterministic workflow DAG run on the journal and
// waits for it to close.
func (c *Client) Workflow(dag map[string]any, opts ...RunOption) (RunStatus, error) {
	o := RunOptions{Timeout: defaultRunTimeout}
	for _, f := range opts {
		f(&o)
	}
	started, err := c.client.StartWorkflowRun(dag)
	if err != nil {
		return RunStatus{}, err
	}
	return c.client.WaitForRun(started.RunID, o.Timeout)
}

// Status is the folded status view without waiting.
func (c *Client) Status(runID string) (RunStatus, error) { return c.client.GetRun(runID) }

// Events is the live SSE event stream for a run as a range-over-func
// iterator over parsed payloads (replay + follow; ends at the seal).
func (c *Client) Events(runID string) func(yield func(map[string]any) bool) {
	return c.client.Events(runID)
}

// EventStream opens the run's event stream with the dial error observable
// (Events cannot surface one). Callers must Close it.
func (c *Client) EventStream(runID string) (*EventStream, error) { return c.client.OpenEvents(runID) }

// DaemonClient exposes the underlying wire client (metadata routes,
// AnswerGate, Shutdown, WaitForRun with custom timeouts).
func (c *Client) DaemonClient() *DaemonClient { return c.client }

// AnswerGate resolves a pending durable human gate.
func (c *Client) AnswerGate(runID, gateID string, answer map[string]any) (map[string]any, error) {
	return c.client.AnswerGate(runID, gateID, answer)
}

// Close stops a daemon this Client spawned (token-echo shutdown, then
// wait → terminate → kill, python close() parity). A no-op for attached
// daemons. Safe to call multiple times.
func (c *Client) Close() error {
	c.closeOnce.Do(func() {
		if !c.spawned || c.cmd == nil || c.waitCh == nil {
			return
		}
		// The echo guard makes accidental shutdowns impossible; a failed
		// shutdown must not block process reaping (python swallows too).
		_ = c.client.Shutdown()
		select {
		case <-c.waitCh: // exited on the shutdown signal
		case <-time.After(10 * time.Second):
			_ = c.cmd.Process.Signal(syscall.SIGTERM)
			select {
			case <-c.waitCh:
			case <-time.After(5 * time.Second):
				_ = c.cmd.Process.Kill()
				select {
				case <-c.waitCh:
				case <-time.After(5 * time.Second):
				}
			}
		}
		c.spawned = false
	})
	return nil
}

// spawn is the default binding: own daemon on a free loopback port.
func (c *Client) spawn() (*Client, error) {
	argv, err := vaeCommand()
	if err != nil {
		return nil, err
	}
	port, err := freePort()
	if err != nil {
		return nil, &VaerionError{Code: "E1601", Message: "cannot allocate a free loopback port: " + err.Error()}
	}
	token, err := newPairingToken()
	if err != nil {
		return nil, &VaerionError{Code: "E1900", Message: "cannot generate the pairing token: " + err.Error()}
	}
	args := append(append([]string{}, argv...), "serve", "--port", strconv.Itoa(port), "--host", "127.0.0.1")
	cmd := exec.Command(args[0], args[1:]...)
	cmd.Dir = c.cwd
	// VAE_TRUST pre-provisions the token headlessly — the daemon then
	// prints no token; stdout/stderr are discarded entirely so nothing
	// sensitive can leak through this SDK.
	cmd.Env = append(os.Environ(), "VAE_TRUST="+token)
	cmd.Stdout = io.Discard
	cmd.Stderr = io.Discard
	if err := cmd.Start(); err != nil {
		return nil, &VaerionError{
			Code:    "E1601",
			Message: "cannot spawn `vae serve`: " + err.Error(),
			Fix:     "run `vae serve` manually to see the startup error",
		}
	}
	c.cmd = cmd
	c.spawned = true
	waitCh := make(chan error, 1)
	c.waitCh = waitCh
	go func() { waitCh <- cmd.Wait() }()

	c.baseURL = fmt.Sprintf("http://127.0.0.1:%d", port)
	c.tokenValue = token
	dc, err := NewDaemonClient(c.baseURL, token)
	if err != nil {
		_ = cmd.Process.Kill()
		return nil, err
	}
	c.client = dc

	deadline := time.Now().Add(c.serveTimeout)
	for time.Now().Before(deadline) {
		select {
		case werr := <-waitCh:
			return nil, &VaerionError{
				Code:    "E1601",
				Message: "the spawned vae serve process exited before becoming healthy",
				Fix:     "run `vae serve` manually to see the startup error",
				Detail:  errorString(werr),
			}
		default:
		}
		if health, err := dc.Health(); err == nil && health.OK {
			return c, nil
		}
		time.Sleep(150 * time.Millisecond)
	}
	_ = cmd.Process.Kill()
	return nil, &VaerionError{
		Code:    "E1601",
		Message: fmt.Sprintf("the daemon did not become healthy within %s", c.serveTimeout),
		Fix:     "check that port allocation is allowed and no security software blocks loopback",
	}
}

func freePort() (int, error) {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return 0, err
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port, nil
}

// newPairingToken generates the pairing token from the platform CSPRNG
// (crypto/rand), python secrets.token_urlsafe(24) equivalent.
func newPairingToken() (string, error) {
	buf := make([]byte, pairingTokenBytes)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func errorString(err error) any {
	if err == nil {
		return nil
	}
	return err.Error()
}
