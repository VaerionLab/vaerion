// Verification through the CLI of record (VAERION_SDK_STANDARD §4).
//
// Verification is the recomputation of a journal's blake3 chain from the
// bytes on disk — it trusts bytes, not processes. This engine version has
// no standalone daemon verify route (§17 honest gap), so the SDK executes
// the CLI of record as a subprocess in the workspace cwd:
//
//	vae verify --json                  (latest run — flat result shape)
//	vae journal verify RUN --json      (one run — report-wrapped shape)
//
// The two output faces are normalized into ONE VerifyReport:
//
//	flat:   {command:"verify", run_id, ok, records, events, head_hash, torn, issues}
//	wrapped:{command:"journal", sub:"verify", run_id, report:{ok, records,
//	        events, maxSeq, headHash, torn, issues}}   (camelCase headHash)
//
// Exit 0 = verified; exit 5 = failed chain (E1001 carrying the report as
// Detail); no parseable output = E1900.
package vae

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
	"time"
)

// VerifyIssue is one chain finding (codes E1001–E1009, engine verify.ts).
type VerifyIssue struct {
	Index   *int   `json:"i"` // 1-based record index; null when global
	Code    string `json:"code"`
	Message string `json:"message"`
}

// VerifyReport is the normalized verification result — one honest shape
// for both CLI output faces.
type VerifyReport struct {
	RunID    string        `json:"run_id"`
	OK       bool          `json:"ok"`
	Torn     bool          `json:"torn"`
	Records  int           `json:"records"`
	Events   int           `json:"events"`
	HeadHash string        `json:"head_hash"` // 64-hex blake3 commitment
	Issues   []VerifyIssue `json:"issues"`
}

// verifyTimeout bounds one CLI verification subprocess.
const verifyTimeout = 60 * time.Second

// Verify runs the CLI of record against the journal bytes on disk. An
// empty runID verifies the latest journal (`vae verify --json`); a
// non-empty runID verifies that specific run
// (`vae journal verify RUN --json`).
func (c *Client) Verify(runID string) (VerifyReport, error) {
	argv, err := vaeCommand()
	if err != nil {
		return VerifyReport{}, err
	}
	var args []string
	if runID == "" {
		args = []string{"verify"}
	} else {
		args = []string{"journal", "verify", runID}
	}
	args = append(args, "--json")

	ctx, cancel := context.WithTimeout(context.Background(), verifyTimeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, argv[0], append(argv[1:], args...)...)
	cmd.Dir = c.cwd
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	runErr := cmd.Run()

	exitCode := 0
	if runErr != nil {
		if exitErr, ok := runErr.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			return VerifyReport{}, &VaerionError{
				Code:    "E1601",
				Message: "cannot execute the vae CLI: " + runErr.Error(),
				Fix:     "check $VAE_BIN / PATH, or run `vae verify --json` manually to see the failure",
			}
		}
	}

	// The CLI emits NDJSON on stdout: keep the LAST parseable line.
	var payload map[string]any
	for _, line := range strings.Split(stdout.String(), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var p map[string]any
		if json.Unmarshal([]byte(line), &p) == nil && p != nil {
			payload = p
		}
	}
	if payload == nil {
		var detail any
		if s := stderr.String(); s != "" {
			if len(s) > 500 {
				s = s[len(s)-500:]
			}
			detail = s
		}
		return VerifyReport{}, &VaerionError{
			Code:    "E1900",
			Message: fmt.Sprintf("verification produced no machine output (exit %d)", exitCode),
			Detail:  detail,
		}
	}
	if exitCode != 0 {
		return VerifyReport{}, &VaerionError{
			Code:    "E1001",
			Message: "journal verification FAILED — see the report payload",
			Fix:     "vae journal recover <run_id>",
			Detail:  payload,
		}
	}
	return normalizeVerifyReport(payload), nil
}

// normalizeVerifyReport folds the two CLI output faces into one
// VerifyReport (python parity in agent.py verify()).
func normalizeVerifyReport(payload map[string]any) VerifyReport {
	report := payload
	if wrapped, ok := payload["report"].(map[string]any); ok {
		report = wrapped
	}
	out := VerifyReport{
		OK:       truthy(report["ok"]),
		Torn:     truthy(report["torn"]),
		Records:  intField(report["records"]),
		Events:   intField(report["events"]),
		HeadHash: stringOr(report["headHash"], report["head_hash"]),
		Issues:   issuesFrom(report["issues"]),
	}
	if id := stringOr(payload["run_id"], report["run_id"]); id != "" {
		out.RunID = id
	}
	return out
}

func truthy(v any) bool {
	b, ok := v.(bool)
	return ok && b
}

func intField(v any) int {
	switch n := v.(type) {
	case float64:
		return int(n)
	case int:
		return n
	}
	return 0
}

func stringOr(v, fallback any) string {
	if s, ok := v.(string); ok && s != "" {
		return s
	}
	if s, ok := fallback.(string); ok {
		return s
	}
	return ""
}

func issuesFrom(v any) []VerifyIssue {
	items, ok := v.([]any)
	if !ok {
		return nil
	}
	issues := make([]VerifyIssue, 0, len(items))
	for _, item := range items {
		m, ok := item.(map[string]any)
		if !ok {
			continue
		}
		issue := VerifyIssue{
			Code:    stringOr(m["code"], nil),
			Message: stringOr(m["message"], nil),
		}
		if n, ok := m["i"].(float64); ok {
			i := int(n)
			issue.Index = &i
		}
		issues = append(issues, issue)
	}
	return issues
}
