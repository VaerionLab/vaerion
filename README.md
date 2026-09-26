# Vaerion

<img src="public/icon-192.png" alt="The official Vaerion mark — the double-chevron V: the action and the evidence it carries" width="88" align="right" />

**AI agents act. Vaerion turns those actions into cryptographic
evidence.** Local-first. Deterministic. Auditable by construction — the
trust infrastructure for autonomous AI systems.

[![verify](https://github.com/VaerionLab/vaerion/actions/workflows/verify.yml/badge.svg)](https://github.com/VaerionLab/vaerion/actions/workflows/verify.yml)
![release](https://img.shields.io/badge/release-v0.1.13--rc1-D4AF37)
![gates](https://img.shields.io/badge/verification_gates-9%2F9-22C55E)
![license](https://img.shields.io/badge/license-Apache--2.0-9C9CA6)
![telemetry](https://img.shields.io/badge/telemetry-zero_by_construction-9C9CA6)

Vaerion runs AI-assisted development work the way a database engine runs
transactions: every step lands on one versioned event spine, journals are
append-only and blake3-chained, permissions pass through a fail-closed
broker, runs replay deterministically, receipts are folded from journals,
and deliverables build into reproducible `.vxn` bundles whose identical
inputs produce identical bytes.

> **The launch promise:** install Vaerion, connect an AI agent, run an
> action, and receive verifiable proof that the action followed the rules
> you defined — locally, without telemetry, without an account.

```
vae run demo --sources ./sources --query "determinism"
vae journal verify <RUN_ID>          # the chain holds — measured, not promised
vae package build                    # byte-identical bundles, sealed by vaerion.lock
```

**Status: release candidate `v0.1.13-rc1`** — 9/9 verification gates green,
Ed25519-signed release artifacts on
[Releases](https://github.com/VaerionLab/vaerion/releases), GA
rehearsed and pending Founder go. Honest about what is not yet done — see
`docs/LIMITATIONS.md` and `docs/security/RISK-LEDGER.md`.

---

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

## Install

Every channel delivers the same engine, the same `vae` entrypoint, the
same exit-code contract — full map with measured status in
[`docs/INSTALL.md`](docs/INSTALL.md). Verified channels first:

```sh
# Signed release tarball (offline, no account needed)
# → https://github.com/VaerionLab/vaerion/releases  (VERIFY.md teaches the checks)

# From source — the path this repository uses to verify itself
git clone https://github.com/VaerionLab/vaerion.git vaerion && cd vaerion
bun install --frozen-lockfile
bun run tools/verify.ts              # all gates must be green
alias vae="bun run packages/vaerion/src/cli/vae.ts"
```

Requires **Bun ≥ 1.3** — the engine floor of record (`engines.bun` in
`package.json`).

`npm install -g vaerion` / `pip install vaerion` / the `vaerion.dev`
installer are **built and rehearsed** — registry publication and the
domain go live with the release train (Founder-gated). They will appear
here the day they are real.

Then — first contact:

```sh
vae                            # the welcome front door: measures this
                               # directory, points at the next step (exit 0)
vae tour                       # a guided, read-only walk of the engine
vae init --template demo
vae run demo --sources ./sources --query "your question"
vae journal verify <RUN_ID>
vae doctor
vae provenance <BUNDLE>.vxn    # permanent evidence for anything it built
vae repo                       # measure the repository you are standing in
vae account                    # who acts in this workspace — local identity
vae ai ask --question "..." --capability sources   # grounded Q&A through the single gate
vae center                     # the operator cockpit: runs, metering, integrity
vae ci validate                # CI must re-run the same gates (D-R)
vae release readiness          # can this repository ship? measured only
```

Full walkthrough: [`docs/QUICKSTART.md`](docs/QUICKSTART.md) · companion
workspace: [`examples/vaerion-demo/`](examples/vaerion-demo/).

## The CLI at a glance

`vae` — bare `vae` opens the welcome front door:

`init` · `run research|demo|model|agent|workflow` · `resume` · `explain` ·
`journal ls|show|verify|recover|export` · `doctor` · `dev` · `serve` ·
`package build|verify` · `provenance` · `repo` · `account` ·
`ai ask|models` · `center` · `ci validate|simulate` · `release readiness` · `tour`

Every command honors `--json` (stable machine output), `--dry-run`
(plan only, nothing written), and exit codes 0–5 with the E-code
diagnostics catalog ([`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)).

On an interactive terminal the CLI renders the Vaerion design language —
panels, honest status
badges, receipts, educated errors with fix and doc pointers. Pipes and
`--json` always receive the stable plain contract; `VAE_UI=plain|rich`
overrides the detection. Shell completions ship for bash, zsh, fish,
powershell, nushell, and xonsh from one completion model.

## The local daemon and SDK

`vae serve` starts a loopback-only HTTP/SSE daemon (pairing token printed
once) exposing the same contracts the CLI exercises. The TypeScript SDK
(`@vaerion/sdk`) is wire-parity-tested against the CLI — same contracts,
same behavior. Reference: [`docs/SDK.md`](docs/SDK.md).

## Verification law

`bun run tools/verify.ts` runs the verification gates and writes the
measured record to `.vaerion-verification.json`: strict typechecks
(engine, SDK), the test suite with enforced coverage floors, layerlint
architecture boundaries, the constitutional invariants (zero telemetry,
determinism, no placeholder debt, contract sync, secret scan, config
guard, egress confinement), the performance budget law (seven
engine-critical operations measured against typed budget ceilings), the
accessibility structural invariants (landmarks, labels, alt text, focus
visibility), and repository lint. **Every gate must be green before any
commit.** CI re-runs the same suite on every push
([`.github/workflows/`](.github/workflows/)).

## Trust model

Vaerion's trust model is simple to state and mechanical to check: **trust
is a property of evidence, not of promises.**

| You want to know | Vaerion's answer |
|---|---|
| Did the agent stay inside the rules? | The fail-closed permission broker decides every step and journals every decision — denies included (`receipt.counts.decisions_deny`) |
| Is the record intact? | Journals are append-only and blake3-chained; `vae journal verify` re-walks the chain with a pure check (`torn: false`, `issues: []`) |
| Is the output what it claims to be? | `.vxn` bundles are deterministic (ADR-0016); `vae provenance` reads the receipt without ever executing content |
| Who could have acted? | Runs carry run + trace IDs, config fingerprints, and engine version — every field lands in the receipt |
| What does Vaerion itself see? | Nothing — zero telemetry by construction, enforced mechanically on every build |

The honest inventory lives in
[`docs/security/THREAT-MODEL.md`](docs/security/THREAT-MODEL.md) and the
remaining-risk ledger
[`docs/security/RISK-LEDGER.md`](docs/security/RISK-LEDGER.md). Read
them before you trust anything — including us. Launch evidence with real
captures: [`docs/launch/`](docs/launch/).

## Documentation

| Start with | What it covers |
|---|---|
| [`docs/QUICKSTART.md`](docs/QUICKSTART.md) | The 15-minute guided journey |
| [`docs/INSTALL.md`](docs/INSTALL.md) | Every install channel, with measured status |
| [`docs/CLI.md`](docs/CLI.md) | Full command reference, exit codes, E-codes |
| [`docs/SDK.md`](docs/SDK.md) | The TypeScript SDK and the parity law |
| [`docs/FAQ.md`](docs/FAQ.md) · [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Questions, exit codes, recovery |
| [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) | The honest inventory of what is measured and what is not |
| [`docs/adr/README.md`](docs/adr/README.md) | All 21 architecture decisions and their status |

## Repository map

| Path | What it is |
|---|---|
| `packages/vaerion/` | The engine and the `vae` CLI |
| `sdks/typescript/` | `@vaerion/sdk` — wire-parity client |
| `spec/` | Contracts: errors, events, schemas, OpenAPI, WIT world |
| `docs/adr/` | Architecture decision records (indexed in `docs/adr/README.md`) |
| `docs/security/` | Threat model, mitigation record, remaining-risk ledger |
| `docs/book/` | The Vaerion book — tutorials, concepts, guides |
| `docs/constitution/` | The engineering constitution, every ratified version |
| `examples/vaerion-demo/` | The 15-minute demo workspace |
| `docs/launch/` | Launch evidence — real captures, architecture diagram, the verification walkthrough |
| `brand/` | `brand/official/` ONLY — the Founder-provided official identity assets + custody MANIFEST (PHASE 16.3 brand purge; PHASE 16.4 replacement set of record) |
| `tools/` | Verification, status dashboard, and release tooling |

## Roadmap

Vaerion is becoming the trust runtime for AI agents — deliberately **not**
trying to become everything. The order of record, with measured status in
[`ROADMAP_PROGRESS.md`](ROADMAP_PROGRESS.md) and the curated view in
[`ROADMAP.md`](ROADMAP.md):

1. **Agent-framework integrations** — evidence for the frameworks people already run
2. **SDK ecosystem** — `@vaerion/sdk` beyond TypeScript
3. **Verification tooling** — one-command independent verification of any receipt or bundle
4. **Enterprise controls** — the governance surface organizations need

Current status: release candidate `v0.1.13-rc1`, 9/9 verification gates
green. What is *not* done is written down in
[`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).

## Beta program

New to the project? [`CONTRIBUTING.md`](CONTRIBUTING.md) is the onboarding
contract — from install to your first verified run — and the community
surfaces (Discussions, Discord, issue templates) are laid out in
[`community/`](community/) — they go live with the release train.

## Governance and license

Vaerion is maintained under an explicit engineering constitution
(`docs/constitution/`). Architectural decisions are recorded as ADRs;
substrate-level decisions are explicitly marked until the project owner
ratifies them. Copyright (c) 2026 Auren. Licensed under the Apache
License 2.0 — see [`LICENSE`](LICENSE). Contributions agree to the same
license ([`CONTRIBUTING.md`](CONTRIBUTING.md)). The full legal identity
layer — ownership, trademark policy, contributor terms, and the
pseudonym disclosure (F-2) — is [`LEGAL.md`](LEGAL.md).

---

<span aria-hidden="true">SEE IT. EXPLAIN IT. OWN IT.</span>
