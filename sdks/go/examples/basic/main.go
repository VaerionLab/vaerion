// examples/basic — the five-line Vaerion experience in Go, runnable.
//
//	cd sdks/go && go run ./examples/basic
//
// The program spawns its own loopback daemon in a temporary workspace,
// runs one brokered agent goal, prints the run coordinates and the
// receipt's integrity commitment, then verifies the journal chain through
// the CLI of record. Every value printed below is engine-produced —
// nothing is asserted, nothing is fabricated.
package main

import (
	"fmt"
	"os"
	"path/filepath"

	vae "github.com/VaerionLab/vaerion-go"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}

func run() error {
	cwd, err := os.MkdirTemp("", "vaerion-go-example-")
	if err != nil {
		return err
	}
	defer os.RemoveAll(cwd)

	agent, err := vae.NewClient(vae.WithCwd(cwd))
	if err != nil {
		return err
	}
	defer agent.Close()

	// One brokered, journaled run. Inline planning is declared: the
	// default plan is a single note step — deterministic, no model calls.
	result, err := agent.Run("summarize the project from the journal")
	if err != nil {
		return err
	}

	headHash := "<absent>"
	if journal, ok := result.Receipt["journal"].(map[string]any); ok {
		if h, ok := journal["head_hash"].(string); ok {
			headHash = h
		}
	}
	fmt.Println("run_id:   ", result.RunID)
	fmt.Println("status:   ", result.Status)
	fmt.Println("head_hash:", headHash)

	// Verification recomputes the blake3 chain from the bytes on disk
	// (the CLI of record — this engine version has no daemon verify route).
	report, err := agent.Verify(result.RunID)
	if err != nil {
		return err
	}
	fmt.Printf("verify:    ok=%v torn=%v records=%d head=%s\n",
		report.OK, report.Torn, report.Records, report.HeadHash)
	fmt.Println("workspace:", filepath.Join(cwd, ".vaerion", "journal"))
	return nil
}
