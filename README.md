# Vaerion

<img src="public/icon-192.png" alt="The official Vaerion mark — the double-chevron V: the action and the evidence it carries" width="88" align="right" />

**AI agents can act. Vaerion proves what they did.** A cryptographic
runtime for deterministic, verifiable AI agents — local-first, zero
telemetry, auditable by construction.

[![verify](https://github.com/VaerionLab/vaerion/actions/workflows/verify.yml/badge.svg)](https://github.com/VaerionLab/vaerion/actions/workflows/verify.yml)
![release](https://img.shields.io/badge/release-v0.1.14--rc1-D4AF37)
![npm](https://img.shields.io/badge/npm-vaerion%400.1.14--rc1-D4AF37)
![license](https://img.shields.io/badge/license-Apache--2.0-9C9CA6)
![telemetry](https://img.shields.io/badge/telemetry-zero_by_construction-9C9CA6)

[Website](https://vaerion.vercel.app) · [Support & community](SUPPORT.md) · [Security proof](VAERION_SECURITY_PROOF_v1.0.md) · [Code of Conduct](CODE_OF_CONDUCT.md)

Vaerion runs AI-assisted work the way a database engine runs
transactions: every step lands on one versioned event spine, journals
are append-only and blake3-chained, permissions pass through a
fail-closed broker, runs replay deterministically, and every run closes
with a receipt folded from its journal.

---

## Demo — a verified run, end to end

```text
$ vae run demo --query "What guarantees does Vaerion make about evidence?"

receipt:
  run_id: crn_run_01M3F2460N5TEREDSJX9HJRE49
  counts:
    records: 13
    decisions_allow: 1
    snapshots: 1
  journal:
    records: 13
    head_hash: 7b5e8d78c56306e3…
  summary: indexed 1 documents; 1 hits for "What guarantees…"
journal_verified: true
```

```text
$ vae journal verify crn_run_01M3F2460N5TEREDSJX9HJRE49

report:
  ok: true
  records: 14
  torn: false
  issues: []
```

The chain holds — measured, not promised. Your ids and hashes will
differ; the shape and the `ok: true` will not.

## Installation

**Prerequisite: [Bun](https://bun.sh) 1.3+** (the engine executes on the
Bun runtime — without it, `vae` refuses with a taught error, never a
cryptic one).

```sh
curl -fsSL https://bun.sh/install | bash    # if Bun is not installed yet
npm install -g vaerion@rc                    # live on the npm registry
vae --version                                # → vae 0.1.14-rc1
```

Other channels (signed release tarball with three-leg offline
verification, PyPI wheel, Debian, Homebrew, Windows — each labeled with
its measured status): [`docs/INSTALL.md`](docs/INSTALL.md). The signed
artifact set lives on
[GitHub Releases](https://github.com/VaerionLab/vaerion/releases);
[`VERIFY.md`](https://github.com/VaerionLab/vaerion/releases) in each
release teaches the anonymous verification.

## Quick Start — first proof in under 10 minutes

```sh
vae init --template demo      # scaffold vaerion.yaml + .vaerion/ stores
vae run demo --query "What guarantees does Vaerion make about evidence?"
vae journal ls                # note the run id (crn_run_…)
vae journal verify <RUN_ID>   # ok: true — the blake3 chain holds
```

Full walkthrough with expected output:
[`docs/getting-started/quickstart.md`](docs/getting-started/quickstart.md).
Prefer a guided tour? `vae tour` walks the engine read-only in nine
steps. New here? [`BETA-ONBOARDING.md`](BETA-ONBOARDING.md) is the
onboarding contract.

## Why Vaerion exists

AI-assisted development loses its most valuable property —
trustworthiness — when the work leaves no evidence. Vaerion's answer is
architectural, not procedural:

| Property | Mechanism |
|---|---|
| Every action is evidence | One versioned event spine; append-only NDJSON journals, single writer, blake3 chain |
| Nothing acts without authority | Fail-closed permission broker; every decision journaled; durable human gates |
| Failure is recoverable | Event-sourced state, checkpoint chaining, `resume`, `journal recover` |
| Output is reproducible | Deterministic `.vxn` bundles (ADR-0016): identical inputs → identical bytes, verified by a pure check that never executes content |
| Trust is scoped | Model I/O passes one sanctioned gateway gate (ADR-0019); extensions run sha256-pin-verified in a subprocess host (ADR-0009) |
| Secrets stay secret | OS-keychain-first resolution (ADR-0013); secrets never enter journals, receipts, or bundles |
| Zero telemetry | No analytics, no undeclared network — enforced mechanically by constitutional checks on every build |

## Architecture

A layer-governed TypeScript engine (layer law enforced by `layerlint`
on every build — lower layers never import higher):

| Layer | Components | Role |
|---|---|---|
| L0 | `kernel`, `config` | blake3 content identity, canonical JSON, deterministic ids, strict schema-validated config |
| L1 | `spine`, `journal`, `store`, `receipts`, `broker` | the event spine, append-only hash-chained journals, content-addressed blob store, receipts folded from journals, the fail-closed permission engine |
| L2 | `runtime`, `research`, `agents`, `workflow`, `package`, `evals`, `extensions`, `repo`, `identity`, `center` | deterministic runs (research / agent loop / DAG workflows), reproducible packaging, repository intelligence, local identity |
| L4 | `cli`, `api` | the `vae` command surface and the loopback-only HTTP/SSE daemon over the same contracts |

Contracts of record live in [`spec/`](spec/): 8 JSON Schemas
(`envelope`, `journal-record`, `receipt`, `broker-decision`, `gate`,
`vaerion-yaml`, …), the event registry, the 82-code E-diagnostics
catalog (`spec/errors.yaml`), OpenAPI, and the extension WIT world.
Architecture decisions: [`docs/adr/README.md`](docs/adr/README.md).

## Security model

- **Broker law — Decide → Journal → Act.** A single centralized broker
  gates `tool.call`, `model.invoke`, `research.fetch`, `secret.read`,
  `net.connect`. Declaring a tool grants nothing; only reviewed policy
  rules do. Unmatched means denied — and denials land in their own
  hash-chained refusal log.
- **Journals prove integrity AND completeness.** Every closed run ends
  with a receipt record that commits to the run's final record count and
  head hash; `vae journal verify` enforces the commitment (E1010) —
  editing, re-chaining, or deleting records after close is detectable.
  Tested against a defined attack suite:
  [`VAERION_SECURITY_PROOF_v1.0.md`](VAERION_SECURITY_PROOF_v1.0.md).
- **One sanctioned egress.** All model I/O crosses a single gateway
  gate; nothing else in the engine may open the network (constitutionally
  enforced, mechanically checked).
- **Zero telemetry.** `telemetry.enabled: false` is the only value the
  config guard accepts.
- **Human gates survive crashes.** A `prompt` decision is a durable
  journal state, resolvable only by a human via `vae resume`.
- **Signed releases.** Every release ships an Ed25519-signed
  `MANIFEST.json` + public key + `SHA256SUMS`; a fresh consumer verifies
  anonymously in three independent legs.

Deep dives: [`docs/security/THREAT-MODEL.md`](docs/security/THREAT-MODEL.md)
· [`docs/security/MITIGATIONS.md`](docs/security/MITIGATIONS.md) ·
[`docs/security/RISK-LEDGER.md`](docs/security/RISK-LEDGER.md) (the
honest inventory of what is *not* yet mitigated).

## Examples — three two-minute proofs

| Example | Proves | The one-liner |
|---|---|---|
| [`examples/verifiable-agent/`](examples/verifiable-agent/) | an agent action with cryptographic proof | run a brokered plan → receipt → `journal verify` → `ok: true` |
| [`examples/refused-action/`](examples/refused-action/) | unauthorized actions are stopped and recorded | flip one policy word → `outcome: failed`, denial hash-chained, journal still verifies |
| [`examples/replay-machine/`](examples/replay-machine/) | same input creates same verified execution | build a `.vxn` twice → byte-identical; flip one byte → verification refuses |
| [`examples/vaerion-demo/`](examples/vaerion-demo/) | the full 15-minute walkthrough | the canonical external-tester workspace |

Every flow in [`examples/vaerion/`](examples/vaerion/) is executed by
the engine's own test suite — examples cannot drift from reality.

## Documentation

| Start with | What it covers |
|---|---|
| [`docs/README.md`](docs/README.md) | the documentation index, organized by journey |
| [`docs/getting-started/installation.md`](docs/getting-started/installation.md) | install paths and verification |
| [`docs/getting-started/quickstart.md`](docs/getting-started/quickstart.md) | first verified run in <10 minutes |
| [`docs/concepts/`](docs/concepts/) | architecture, runtime, journals, security — the mental model |
| [`docs/guides/`](docs/guides/) | building agents, permissions, verification — the hands-on paths |
| [`docs/reference/cli.md`](docs/reference/cli.md) · [`docs/reference/errors.md`](docs/reference/errors.md) | command surface and E-code diagnostics |
| [`docs/CLI.md`](docs/CLI.md) | the full generated CLI manual |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | exit codes 0–5, every E-code with a Fix |
| [`docs/FAQ.md`](docs/FAQ.md) · [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) | questions, and what is honestly not done yet |
| [`docs/book/`](docs/book/) | tutorials → concepts → operator guides |
| [`docs/SDK.md`](docs/SDK.md) | the TypeScript SDK (`@vaerion/sdk`), wire-parity with the CLI |

## Roadmap

`v0.1.14-rc1` is a **release candidate**: 9/9 verification gates green,
signed release artifacts, npm distribution live and consumer-verified.
What ships next and what is explicitly *not* done yet:
[`ROADMAP_PROGRESS.md`](ROADMAP_PROGRESS.md),
[`docs/LIMITATIONS.md`](docs/LIMITATIONS.md), and
[`docs/security/RISK-LEDGER.md`](docs/security/RISK-LEDGER.md).

## Contributing

Contributions agree to the Apache-2.0 license
([`CONTRIBUTING.md`](CONTRIBUTING.md)). The law of the repository: every
change passes the verification gates (`bun run tools/verify.ts` —
typechecks, tests with coverage floors, architecture boundaries,
constitutional invariants, performance budgets, accessibility, lint)
before it lands; CI re-runs the same gates on every push.

## License

Copyright © 2026 Auren. Apache License 2.0 — see
[`LICENSE`](LICENSE). The full legal identity layer — ownership,
trademark policy, contributor terms — is [`LEGAL.md`](LEGAL.md).

---

<span aria-hidden="true">VERIFIED · REPRODUCIBLE · TRUSTED — 🜂</span>
