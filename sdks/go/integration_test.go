package vae

import (
	"os"
	"regexp"
	"strings"
	"testing"
	"time"
)

// Integration layer (VAERION_SDK_STANDARD §18): a REAL spawned daemon, a
// REAL brokered run, a REAL receipt, a REAL verification through the CLI
// of record. Skipped (never faked) when no vae runtime exists — the skip
// is the honest gate, a fake would be a lie.
//
// Note: the receipt certifies the chain UP TO its fold; the terminal
// receipt record itself is appended afterwards — so the verified head is
// the receipt record's hash, one link beyond receipt.journal.head_hash.

const noVAERuntime = "no vae runtime on this machine — integration layer skipped, never faked"

func requireVAE(t *testing.T) {
	t.Helper()
	if !vaeAvailable() {
		t.Skip(noVAERuntime)
	}
}

func newSpawnedClient(t *testing.T) *Client {
	t.Helper()
	c, err := NewClient(WithCwd(t.TempDir()), WithServeTimeout(30*time.Second))
	if err != nil {
		t.Fatalf("spawn daemon: %v", err)
	}
	t.Cleanup(func() { _ = c.Close() })
	return c
}

var headHashRE = regexp.MustCompile(`^[0-9a-f]{64}$`)

func TestIntegrationSpawnRunReceiptVerify(t *testing.T) {
	requireVAE(t)
	c := newSpawnedClient(t)

	// The daemon is up and honest about its version.
	health, err := c.client.Health()
	if err != nil {
		t.Fatalf("Health: %v", err)
	}
	if !health.OK || health.EngineVersion == "" {
		t.Fatalf("health not ok: %#v", health)
	}
	version, err := c.client.Version()
	if err != nil {
		t.Fatalf("Version: %v", err)
	}
	if _, ok := version["engine_version"]; !ok {
		t.Fatalf("version payload lacks engine_version: %#v", version)
	}

	// One brokered, journaled run with the declared note plan.
	result, err := c.Run("summarize the project from the journal")
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	if result.Kind != "agent" {
		t.Fatalf("kind = %q, want agent", result.Kind)
	}
	if !strings.HasPrefix(result.RunID, "crn_run_") {
		t.Fatalf("run_id must be a crn_run_ ULID, got %q", result.RunID)
	}
	if !result.JournalOK {
		t.Fatalf("journal_ok = false on a closed run")
	}
	if result.Receipt == nil {
		t.Fatalf("a closed run carries its receipt")
	}
	journal, ok := result.Receipt["journal"].(map[string]any)
	if !ok {
		t.Fatalf("receipt.journal missing: %#v", result.Receipt)
	}
	headHash, _ := journal["head_hash"].(string)
	if !headHashRE.MatchString(headHash) {
		t.Fatalf("receipt.journal.head_hash must be 64-hex, got %q", headHash)
	}
	records, _ := journal["records"].(float64)
	if records <= 0 {
		t.Fatalf("receipt.journal.records must be > 0, got %v", journal["records"])
	}

	// The status fold agrees with the terminal state.
	status, err := c.Status(result.RunID)
	if err != nil {
		t.Fatalf("Status: %v", err)
	}
	if status.RunID != result.RunID || status.Receipt == nil {
		t.Fatalf("status disagrees: %#v vs run %s", status, result.RunID)
	}

	// Verification through the CLI of record: chain recomputed, green.
	report, err := c.Verify(result.RunID)
	if err != nil {
		t.Fatalf("Verify: %v", err)
	}
	if !report.OK {
		t.Fatalf("verify not ok: %#v", report)
	}
	if report.Torn {
		t.Fatalf("verify reports a torn tail: %#v", report)
	}
	if report.Records < int(records) {
		t.Fatalf("verified records %d < receipt records %d", report.Records, int(records))
	}
	if !headHashRE.MatchString(report.HeadHash) {
		t.Fatalf("verified head_hash must be 64-hex, got %q", report.HeadHash)
	}
	t.Logf("run %s: %d journal records, receipt head %s…, verified head %s… (%d records)",
		result.RunID, int(records), headHash[:12], report.HeadHash[:12], report.Records)
}

func TestIntegrationEventsStreamReplaysTheRun(t *testing.T) {
	requireVAE(t)
	c := newSpawnedClient(t)
	result, err := c.Run("event stream probe")
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	var count int
	seenOpened := false
	for ev := range c.Events(result.RunID) {
		count++
		if ev["type"] == "run.opened" {
			seenOpened = true
		}
		if count > 10_000 {
			t.Fatalf("runaway event stream")
		}
	}
	if count == 0 {
		t.Fatalf("event stream yielded nothing")
	}
	if !seenOpened {
		t.Fatalf("event stream must contain run.opened")
	}
}

func TestIntegrationUndeclaredToolStepFailsClosedWithEvidence(t *testing.T) {
	// The daemon's ad-hoc config declares NO tools → the undeclared tool
	// step fails CLOSED at the tool gate (fail-closed law). The run still
	// closes WITH a receipt — the refusal is evidence on the chain, not an
	// exception to hide. The SDK returns the truth; the caller reads it.
	requireVAE(t)
	c := newSpawnedClient(t)
	result, err := c.Run("undeclared tool call", WithSteps([]map[string]any{
		{"kind": "tool", "tool": "echo", "args": map[string]any{"value": "hi"}},
	}))
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	if result.Status != "closed" {
		t.Fatalf("status = %q, want closed", result.Status)
	}
	if outcome, _ := result.Agent["outcome"].(string); outcome != "failed" {
		t.Fatalf("agent.outcome = %v, want failed", result.Agent["outcome"])
	}
	if result.Receipt == nil {
		t.Fatalf("even a failed run leaves a receipt")
	}
	// …and the journal STILL verifies: the evidence trail is intact.
	report, err := c.Verify(result.RunID)
	if err != nil {
		t.Fatalf("Verify: %v", err)
	}
	if !report.OK {
		t.Fatalf("failed run's journal must still verify (evidence law): %#v", report)
	}
}

func TestIntegrationWorkflowRunClosesWithReceipt(t *testing.T) {
	requireVAE(t)
	c := newSpawnedClient(t)
	dag := map[string]any{
		"id": "go-sdk-dag",
		"nodes": []any{
			map[string]any{"id": "a", "deps": []any{}, "step": map[string]any{"kind": "note", "text": "first node"}},
			map[string]any{"id": "b", "deps": []any{"a"}, "step": map[string]any{"kind": "note", "text": "second node"}},
		},
	}
	result, err := c.Workflow(dag)
	if err != nil {
		t.Fatalf("Workflow: %v", err)
	}
	if result.Kind != "workflow" || result.Status != "closed" {
		t.Fatalf("workflow fold wrong: kind=%q status=%q", result.Kind, result.Status)
	}
	if result.Receipt == nil {
		t.Fatalf("closed workflow must carry its receipt")
	}
	if report, err := c.Verify(result.RunID); err != nil || !report.OK {
		t.Fatalf("workflow journal must verify: %#v %v", report, err)
	}
}

func TestIntegrationAttachModeSharesTheDaemon(t *testing.T) {
	requireVAE(t)
	spawned := newSpawnedClient(t)
	dc := spawned.DaemonClient()

	attachCwd := t.TempDir()
	attached, err := NewClient(WithBase(dc.Base), WithToken(dc.Token), WithCwd(attachCwd))
	if err != nil {
		t.Fatalf("attach: %v", err)
	}
	t.Cleanup(func() { _ = attached.Close() }) // no-op for attached clients

	// The attached client reaches the SAME daemon and runs in its workspace.
	result, err := attached.Run("attach mode probe")
	if err != nil {
		t.Fatalf("attached Run: %v", err)
	}
	if !strings.HasPrefix(result.RunID, "crn_run_") || result.Receipt == nil {
		t.Fatalf("attached run wrong: %#v", result)
	}

	// attached.Close() is a no-op (it spawned nothing): the daemon lives on.
	if err := attached.Close(); err != nil {
		t.Fatalf("attached Close: %v", err)
	}
	if _, err := spawned.client.Health(); err != nil {
		t.Fatalf("daemon died after an attached client closed: %v", err)
	}
}

func TestIntegrationCloseStopsTheSpawnedDaemon(t *testing.T) {
	requireVAE(t)
	dir := t.TempDir()
	c, err := NewClient(WithCwd(dir), WithServeTimeout(30*time.Second))
	if err != nil {
		t.Fatalf("spawn: %v", err)
	}
	base := c.DaemonClient().Base
	if err := c.Close(); err != nil {
		t.Fatalf("Close: %v", err)
	}
	// Second Close is a no-op (sync.Once) and must not panic.
	if err := c.Close(); err != nil {
		t.Fatalf("second Close: %v", err)
	}
	dc, err := NewDaemonClient(base, "irrelevant")
	if err != nil {
		t.Fatalf("rebuild client: %v", err)
	}
	if _, err := dc.Health(); err == nil {
		t.Fatalf("daemon at %s still answers after Close", base)
	}
}

// The spawned client must never leak the token into the process
// environment of the TEST (VAE_TRUST belongs to the daemon child only).
func TestIntegrationTokenNeverInTestEnvironment(t *testing.T) {
	requireVAE(t)
	c := newSpawnedClient(t)
	for _, env := range os.Environ() {
		if strings.HasPrefix(env, "VAE_TRUST=") {
			t.Fatalf("VAE_TRUST leaked into the SDK process environment")
		}
	}
	if _, err := c.client.Health(); err != nil {
		t.Fatalf("daemon unhealthy: %v", err)
	}
}
