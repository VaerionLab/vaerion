# Runtime — operating the engine

The runtime surface is the `vae` CLI. `vae` with no arguments prints the welcome
door and the full command catalog (measured: exit 0, ~0.09 s).

## The everyday commands

| Command | What it does |
|---|---|
| `vae init` | create a project from a template (`--template demo` is the guided one) |
| `vae run` | execute a workflow; journals every event, folds a receipt |
| `vae resume` | continue a run from its last checkpoint |
| `vae journal` | inspect, export, and **verify** run journals |
| `vae explain` | explain what the engine did, from the evidence |
| `vae doctor` | environment and workspace health checks |
| `vae center` | the operations console |
| `vae package` | build and verify reproducible packages |

The full command-by-command reference (every flag, every exit code family) is
[`CLI`](../CLI.md).

## Long-running work

The engine ships a daemon for persistent sessions, an HTTP API surface
([`spec/openapi.json`](../../spec/openapi.json)), and a workflow engine for
multi-step plans ([workflow DAG](../book/guides/extension-kit.md)).

## Deterministic recovery

Journals are checkpoint-chained: interruption is not corruption. Recovery and
replay are covered in the tutorials —
[03-workflow](../book/tutorials/03-workflow.md) — and the recovery reference in
[`TROUBLESHOOTING`](../TROUBLESHOOTING.md).

## First project in one minute

If you have not yet: [quickstart](../quickstart/README.md) — five commands to a
verified receipt.
