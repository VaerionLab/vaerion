# The Vaerion Book

The documentation set for the Vaerion engine. Every claim here is checked
against the implementation; the generated AI corpus (`llms.txt`,
`llms-full.txt` at the repository root) is derived from these files by
`tools/gen-docs.ts`, and constitutional check C8 fails when the corpus drifts
from the book or when a relative link is broken.

## Tracks (blueprint §13)

### Tutorials — newcomer hour-one, each ends in a working demo

0. [Installation](tutorials/00-install.md) — get the engine from a checkout
   or the verified tarball, prove the install, learn the exit-code/`--json`/
   `--dry-run` laws every other tutorial assumes.
1. [Init and the first run](tutorials/01-init.md) — scaffold a workspace, run
   the local research demo, read the journal, verify it, explain it.
2. [Your first agent](tutorials/02-first-agent.md) — the supervised agent loop
   with a declared plan, tools, a human gate, and resume.
3. [Workflows](tutorials/03-workflow.md) — deterministic DAG execution,
   content-addressed outputs, crash-safe resume.

### Guides — operators

- [Models and auth](guides/models-and-auth.md) — the gateway single gate,
  providers, mockbrain, secrets, budgets, policy rules.
- [Security posture](guides/security-posture.md) — broker layers, audit
  ledger, refusal log, redaction, zero telemetry.
- [Extension kit](guides/extension-kit.md) — the WIT world, digest pins, the
  empty-environment host, the broker bridge.
- [Packaging](guides/packaging.md) — reproducible `.vxn` bundles, the
  vaerion.lock seal, verification law, the daemon route group.
- [Research and intel](guides/research-and-intel.md) — capability
  declarations, the One Context Path, the local BM25 index, citations.

### Concepts — architects

- [The event spine](concepts/event-spine.md)
- [The broker model](concepts/broker-model.md)
- [Tiered intelligence](concepts/tiered-intel.md)
- [Checkpoint math](concepts/checkpoint-math.md)

### Reference

- [Accessibility](accessibility.md) — the plain-text baseline, NO_COLOR law,
  stable line formats, machine mode.

### Machine-readable contracts (generated, byte-synced)

| Artifact | Path |
|---|---|
| OpenAPI (daemon) | `spec/openapi.json` |
| Error catalog (E####) | `spec/errors.yaml` |
| Event registry | `spec/events/registry.json` |
| Config schema | `spec/schemas/vaerion-yaml.schema.json` |
| WIT world (extensions) | `spec/wit/vaerion-extension@0.1.0.wit` |
| CLI autodoc | run `vae --help` and `vae <command> --help` |
