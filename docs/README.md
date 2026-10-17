# Vaerion Documentation

Organized around journeys, not internals. Everything is measured against
the engine of record (`v0.1.15`); the deep engineering records (ADRs,
security, GA packets) keep their historical authority.

## I just want to try it

| Read | For |
|---|---|
| [getting-started/installation.md](getting-started/installation.md) | every install path, with measured status |
| [getting-started/quickstart.md](getting-started/quickstart.md) | **first verified run in under 10 minutes** |
| [QUICKSTART.md](QUICKSTART.md) | zero to a verified run — the pure CLI journey (install → init → run → verify → receipt) |
| [../examples/README.md](../examples/README.md) | the indexed examples library: Verifiable Agent · Refused Action · Replay Machine · demo workspaces |
| [FAQ.md](FAQ.md) | quick answers |

## I want to understand it

| Read | For |
|---|---|
| [concepts/architecture.md](concepts/architecture.md) | the layer model, the event spine, the contracts |
| [concepts/runtime.md](concepts/runtime.md) | determinism, journal folds, resume, workflows |
| [concepts/journals.md](concepts/journals.md) | hash chains, receipts, recovery, exports |
| [concepts/security.md](concepts/security.md) | the broker, the gateway gate, zero telemetry, signing |
| [book/](book/) | tutorials → concepts → operator guides (the long form) |
| [adr/README.md](adr/README.md) | every architecture decision and its status |

## I want to build with it

| Read | For |
|---|---|
| [guides/building-agents.md](guides/building-agents.md) | agent plans, tools, ceilings, workflows |
| [guides/permissions.md](guides/permissions.md) | policy rules, refusals, human gates |
| [guides/verification.md](guides/verification.md) | journals, doctor, package verify, provenance, release verification |
| [SDK.md](SDK.md) | the five SDKs — TypeScript (`@vaerion/sdk`), Python, Go, Rust, Java — wire-parity with the CLI |
| [../VAERION_SDK_STANDARD.md](../VAERION_SDK_STANDARD.md) | the language-neutral SDK standard (v0.1, implemented across all five SDKs; Founder ratification pending) — the contract every SDK satisfies |

## I need the exact truth

| Read | For |
|---|---|
| [reference/cli.md](reference/cli.md) | the command surface and global flags |
| [reference/errors.md](reference/errors.md) | exit codes and the E-code diagnostics catalog |
| [reference/engine-api.md](reference/engine-api.md) | the engine API reference — kernel, spine, journal, broker, gateway, runtime, workflow (signatures verified against source) |
| [CLI.md](CLI.md) | the full generated CLI manual |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | recovery paths for every failure family |
| [LIMITATIONS.md](LIMITATIONS.md) | what is measured — and what is honestly not done |
| [security/](security/) | threat model, mitigations, remaining-risk ledger, signing ceremony |

## Project law and process

[constitution/](constitution/) — the ratified engineering constitution ·
[ga/](ga/) — release verification and audit packets ·
[operations/](operations/) — operations and launch-sequence records ·
[../CHANGELOG.md](../CHANGELOG.md) — version history of record.
