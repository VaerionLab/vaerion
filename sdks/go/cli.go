// Resolution of the `vae` CLI of record — 1:1 with the Python reference's
// _vae_command (sdks/python/src/vaerion/agent.py):
//
//  1. $VAE_BIN (split on whitespace)
//  2. `vae` on PATH
//  3. repo layout fallback (dev checkouts): `bun run <repoRoot>/packages/
//     vaerion/src/cli/vae.ts`, where repoRoot is two parents above this
//     package directory — only when bun exists
//
// Otherwise: VaerionError E1601 with a Fix line (never a guess).
package vae

import (
        "os"
        "os/exec"
        "path/filepath"
        "runtime"
        "strings"
)

// packageDir is this source file's directory in a dev checkout. The
// repo-layout fallback resolves the engine two parents above it
// (sdks/go → sdks → repo root), exactly like the Python SDK resolves
// parents[4] from its own file location.
var packageDir = func() string {
        _, file, _, ok := runtime.Caller(0)
        if !ok {
                return ""
        }
        return filepath.Dir(file)
}()

// vaeCommand resolves the CLI of record.
func vaeCommand() ([]string, error) {
        if envBin := os.Getenv("VAE_BIN"); envBin != "" {
                return strings.Fields(envBin), nil
        }
        if path, err := exec.LookPath("vae"); err == nil {
                return []string{path}, nil
        }
        if packageDir != "" {
                repoRoot := filepath.Dir(filepath.Dir(packageDir))
                repoVae := filepath.Join(repoRoot, "packages", "vaerion", "src", "cli", "vae.ts")
                if _, err := os.Stat(repoVae); err == nil {
                        if _, err := exec.LookPath("bun"); err == nil {
                                return []string{"bun", "run", repoVae}, nil
                        }
                }
        }
        return nil, &VaerionError{
                Code:    "E1601",
                Message: "cannot find the vae CLI (looked at $VAE_BIN, PATH, and the repo layout)",
                Fix:     "install it: npm install -g vaerion — or set VAE_BIN to the command that runs vae",
        }
}

// vaeAvailable reports whether the CLI of record resolves on this machine
// (the integration test gate: skip when absent — never fake).
func vaeAvailable() bool {
        _, err := vaeCommand()
        return err == nil
}
