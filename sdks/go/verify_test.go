package vae

import (
        "os"
        "path/filepath"
        "reflect"
        "strings"
        "testing"
)

// The fake CLI below exercises the SUBPROCESS PLUMBING of Verify (the
// argv contract, NDJSON parse, both output shapes, exit-code mapping) in
// the unit layer. The integration layer runs the REAL vae CLI of record —
// never this fake.

const fakeVaeScript = `#!/bin/sh
# fake vae for SDK unit tests: emits the CLI-of-record NDJSON shapes
if [ -n "$FAKE_VERIFY_STDOUT" ]; then
  printf '%s\n' "$FAKE_VERIFY_STDOUT"
  exit "${FAKE_VERIFY_EXIT:-0}"
fi
if [ "$1" = "journal" ]; then
  printf '%s\n' '{"command":"journal","sub":"verify","run_id":"crn_run_WRAP00000000000000000000","report":{"ok":true,"path":"/tmp/j.ndjson","records":5,"events":3,"maxSeq":3,"headHash":"aa5500000000000000000000000000000000000000000000000000000000aa55","torn":false,"issues":[]}}'
else
  printf '%s\n' '{"command":"verify","run_id":"crn_run_FLAT00000000000000000000","verdict":"VERIFIED","ok":true,"records":4,"events":2,"head_hash":"bb6600000000000000000000000000000000000000000000000000000000bb66","torn":false,"issues":[]}'
fi
exit "${FAKE_VERIFY_EXIT:-0}"
`

func newFakeVae(t *testing.T) string {
        t.Helper()
        dir := t.TempDir()
        path := filepath.Join(dir, "vae-fake")
        if err := os.WriteFile(path, []byte(fakeVaeScript), 0o755); err != nil {
                t.Fatalf("write fake vae: %v", err)
        }
        return path
}

func newVerifyTestClient(t *testing.T) *Client {
        t.Helper()
        c := &Client{cwd: t.TempDir()}
        return c
}

func TestVerifyLatestUsesFlatShape(t *testing.T) {
        t.Setenv("VAE_BIN", newFakeVae(t))
        report, err := newVerifyTestClient(t).Verify("")
        if err != nil {
                t.Fatalf("Verify: %v", err)
        }
        want := VerifyReport{
                RunID:    "crn_run_FLAT00000000000000000000",
                OK:       true,
                Records:  4,
                Events:   2,
                HeadHash: "bb6600000000000000000000000000000000000000000000000000000000bb66",
                Issues:   []VerifyIssue{},
        }
        if !reflect.DeepEqual(report, want) {
                t.Fatalf("flat normalization wrong:\n got %#v\nwant %#v", report, want)
        }
}

func TestVerifySpecificRunUsesWrappedShapeWithCamelCaseHeadHash(t *testing.T) {
        t.Setenv("VAE_BIN", newFakeVae(t))
        report, err := newVerifyTestClient(t).Verify("crn_run_WRAP00000000000000000000")
        if err != nil {
                t.Fatalf("Verify: %v", err)
        }
        want := VerifyReport{
                RunID:    "crn_run_WRAP00000000000000000000",
                OK:       true,
                Records:  5,
                Events:   3,
                HeadHash: "aa5500000000000000000000000000000000000000000000000000000000aa55",
                Issues:   []VerifyIssue{},
        }
        if !reflect.DeepEqual(report, want) {
                t.Fatalf("wrapped normalization wrong:\n got %#v\nwant %#v", report, want)
        }
}

func TestVerifyFailedChainIsE1001CarryingTheReport(t *testing.T) {
        t.Setenv("VAE_BIN", newFakeVae(t))
        t.Setenv("FAKE_VERIFY_EXIT", "5")
        _, err := newVerifyTestClient(t).Verify("crn_run_WHATEVER0000000000000")
        ve, ok := err.(*VaerionError)
        if !ok || ve.Code != "E1001" {
                t.Fatalf("exit 5 must be E1001, got %#v", err)
        }
        if ve.Fix != "vae journal recover <run_id>" {
                t.Fatalf("E1001 fix = %q", ve.Fix)
        }
        detail, ok := ve.Detail.(map[string]any)
        if !ok || detail["run_id"] != "crn_run_WRAP00000000000000000000" {
                t.Fatalf("E1001 must carry the parsed report payload: %#v", ve.Detail)
        }
}

func TestVerifyNoMachineOutputIsE1900(t *testing.T) {
        t.Setenv("VAE_BIN", newFakeVae(t))
        t.Setenv("FAKE_VERIFY_STDOUT", "  ")
        _, err := newVerifyTestClient(t).Verify("")
        ve, ok := err.(*VaerionError)
        if !ok || ve.Code != "E1900" {
                t.Fatalf("no output must be E1900, got %#v", err)
        }
        if !strings.Contains(ve.Message, "no machine output") {
                t.Fatalf("message = %q", ve.Message)
        }
}

func TestVerifyKeepsTheLastNDJSONLine(t *testing.T) {
        t.Setenv("VAE_BIN", newFakeVae(t))
        t.Setenv("FAKE_VERIFY_STDOUT", "{\"progress\":1}\n{\"progress\":2}\n{\"command\":\"verify\",\"run_id\":\"crn_run_LAST00000000000000000000\",\"ok\":true,\"records\":1,\"events\":1,\"head_hash\":\"cc\",\"torn\":false,\"issues\":[]}")
        report, err := newVerifyTestClient(t).Verify("")
        if err != nil {
                t.Fatalf("Verify: %v", err)
        }
        if report.RunID != "crn_run_LAST00000000000000000000" {
                t.Fatalf("last line must win, got run_id %q", report.RunID)
        }
}

func TestVaeCommandResolutionOrder(t *testing.T) {
        // 1. $VAE_BIN wins, split on whitespace.
        t.Setenv("VAE_BIN", "bun run /some/vae.ts")
        argv, err := vaeCommand()
        if err != nil || !reflect.DeepEqual(argv, []string{"bun", "run", "/some/vae.ts"}) {
                t.Fatalf("VAE_BIN resolution: %#v, %v", argv, err)
        }

        // 2. Without VAE_BIN: repo layout fallback → bun run <repo>/packages/
        //    vaerion/src/cli/vae.ts. Hermetic by construction: a fixture repo
        //    (packages/vaerion/src/cli/vae.ts) plus a stub `bun` placed first on
        //    PATH, so the resolution-order contract is measured on any machine.
        //    The original version assumed the author's dev checkout (bun on
        //    PATH) — a sandbox-ism the newly activated conformance gate caught
        //    (2026-10-21, red go leg on main).
        t.Setenv("VAE_BIN", "")
        fakeBin := t.TempDir()
        if err := os.WriteFile(filepath.Join(fakeBin, "bun"), []byte("#!/bin/sh\nexit 0\n"), 0o755); err != nil {
                t.Fatalf("stub bun: %v", err)
        }
        repoRoot := t.TempDir()
        repoVae := filepath.Join(repoRoot, "packages", "vaerion", "src", "cli", "vae.ts")
        if err := os.MkdirAll(filepath.Dir(repoVae), 0o755); err != nil {
                t.Fatalf("fixture repo layout: %v", err)
        }
        if err := os.WriteFile(repoVae, []byte("// fixture: engine entrypoint of record\n"), 0o644); err != nil {
                t.Fatalf("fixture vae.ts: %v", err)
        }
        origPackageDir := packageDir
        t.Cleanup(func() { packageDir = origPackageDir })
        packageDir = filepath.Join(repoRoot, "sdks", "go") // two parents under repoRoot, like the real layout
        t.Setenv("PATH", fakeBin)
        argv, err = vaeCommand()
        if err != nil {
                t.Fatalf("repo fallback must resolve with the stub bun on PATH: %v", err)
        }
        if len(argv) != 3 || argv[0] != "bun" || argv[1] != "run" || argv[2] != repoVae {
                t.Fatalf("repo fallback wrong: %#v", argv)
        }
}

func TestVaeCommandMissingIsE1601(t *testing.T) {
        // Empty PATH + VAE_BIN unset → only the repo fallback remains; point
        // packageDir at a place without the engine so nothing resolves.
        orig := packageDir
        t.Cleanup(func() { packageDir = orig })
        packageDir = t.TempDir()
        t.Setenv("VAE_BIN", "")
        t.Setenv("PATH", "")
        _, err := vaeCommand()
        ve, ok := err.(*VaerionError)
        if !ok || ve.Code != "E1601" {
                t.Fatalf("missing vae must be E1601, got %#v", err)
        }
        if !strings.Contains(ve.Fix, "VAE_BIN") {
                t.Fatalf("E1601 fix must teach VAE_BIN: %q", ve.Fix)
        }
}
