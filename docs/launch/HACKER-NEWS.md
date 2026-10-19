# Hacker News Kit — draft (Founder approval required to publish)

| | |
|---|---|
| **Status** | DRAFT — nothing is published without Founder approval |
| **Law** | Factual, no superlatives, no marketing. HN detects hype; the brand forbids it anyway (`brand/BRAND-BOOK.md` §10). Answer every question with what was measured. |

---

## Title (use exactly this)

```
Show HN: Vaerion – Local-first trust infrastructure for AI agents (Ed25519-signed receipts, reproducible bundles)
```

## Submission text (2–3 paragraphs)

```
Vaerion is a local-first engine that makes AI-agent work verifiable. Every
step of a run — source reads, broker decisions, model calls, tool uses —
lands on one append-only event journal, blake3 hash-chained, single
writer. Every run closes with a receipt folded from that journal, and the
receipt verifies independently of the process that produced it. Nothing
acts without authority: a fail-closed permission broker decides every
sensitive operation, denies stop the run, prompts pause it with a durable
human gate, and refusals go to their own hash-chained log. `vae package
build` produces .vxn bundles where identical inputs produce identical
bytes, and `vae package verify` is a pure check — digests recomputed,
pins compared, content never executed.

Zero telemetry is enforced mechanically, not by policy: the config guard
accepts exactly one value (`telemetry.enabled: false`) and a
constitutional check fails the build if any module outside the single
gateway egress imports network primitives. Models (OpenAI, Anthropic,
Ollama, plus MockBrain — a deterministic local provider) sit behind one
sanctioned gateway. The daemon is loopback-only and refuses non-loopback
binds. State of record for 0.1.13-rc1: 9 verification gates, 545 tests /
0 failed, 3,932 expectations, coverage 86.52/90.6, 22,018 engine lines,
21 ADRs, Apache-2.0.

Honest install status: today the real channels are source and the signed
release tarballs (three verification legs taught in the shipped
VERIFY.md). npm/PyPI publication is gated on the release train and has
not happened; the installer URL goes live with it. Repo:
https://github.com/falconxa0-commits/vaerion — the quickstart is 15
minutes from clone to a verified run and a byte-identical bundle pair.
```

## First-reply set (post these as replies in the first hours)

### 1. "How is this different from OpenTelemetry / agent tracing / LangSmith?"

> Different object, different trust model. Tracing shows what a framework
> believes happened, rendered in someone's dashboard. Vaerion optimizes
> for recomputation on your machine: the journal is append-only and
> hash-chained (tampering breaks the chain), the receipt verifies
> independently of the producing process, and bundle verification never
> executes content. There is no hosted surface to trust — `vae journal
> verify` recomputes the chain locally, and the refusals of the
> permission broker are themselves journaled in a separate chained log.
> Governance decisions are evidence here, not annotations.

### 2. "Why TypeScript/Bun?"

> It is an honest provisional choice, recorded as such. ADR-0018 names
> the substrate provisional with a migration path; ratification is
> explicitly pending. What is treated as durable is the contract layer:
> specs under `spec/` (error catalog, event registry, schemas, OpenAPI)
> are additive-only within a major version, error codes are never reused,
> and a verification gate asserts the implementation stays in sync with
> the spec. If the substrate changes, the contracts carry. I would rather
> ship a measured 22,018-line implementation under 9 gates than a promise
> about a rewrite.

### 3. "What about prompt injection?"

> Not claimed solved. The design constrains it and records it: untrusted
> source content is fenced — content is data, never instructions — and
> travels to the model only inside the fenced context pack. Broker
> decisions gate every source read and tool call, undeclared tool calls
> are refused fail-closed (E1801), and denials land in the hash-chained
> refusal log. So an injection attempt cannot silently expand what the
> agent is allowed to touch, and the attempt itself is evidence you can
> audit afterwards. The threat model and its mitigations are public:
> `docs/security/THREAT-MODEL.md`, `MITIGATIONS.md`, `RISK-LEDGER.md`.

### 4. "Cloud plans?"

> None announced, deliberately. ADR-0017 reserves the seams; the product
> today is local: no accounts (`vae account` measures local identity),
> the daemon binds loopback only and refuses non-loopback binds (E2001),
> and the permission broker fail-closes what policy does not grant. If a
> hosted surface ever exists it will be a ratified ADR, not a flag. I am
> not going to describe a roadmap product as a feature.

### 5. "Zero telemetry — how is that actually enforced?"

> Mechanically. The config guard accepts exactly one value:
> `telemetry.enabled: false` — no other value parses. The
> constitutional-check gate (one of 9, run before every commit and in CI)
> fails the build if any module outside the gateway imports HTTP client
> primitives, and `vae doctor` performs no network access. The check is
> code, not policy, so 'trust us' is not load-bearing anywhere.

### 6. "Why would an agent lie?"

> The framing is not that agents lie; it is that claims need recomputation.
> Whether a model is honest is out of scope; whether its work is checkable
> is the whole scope. Same inputs, same journal; deterministic replay;
> receipts that verify without the producing process; MockBrain — a
> seeded deterministic provider — so the machinery can be tested end to
> end with byte-identical outputs and no network. If a claim in the README
> cannot be recomputed from terminal output, that is treated as an engine
> defect, not a nuance.

### 7. "Can I actually use it today?"

> Yes, with the honest caveats. Install is from source or the signed
> release tarballs; every artifact set ships SHA256SUMS, an Ed25519-signed
> MANIFEST.json, the public key, and a VERIFY.md teaching three
> verification legs (sha256 → engine verifier → openssl cross-check).
> Engine of record is 0.1.13-rc1 — a prerelease. Stable within v1: exit
> codes 0–5, the 81-code E-catalog, the `--json` machine contract.
> npm/PyPI publication is gated on the release train and has not
> happened; I will not pretend otherwise.

### 8. "Isn't reproducible packaging just tar plus a hash?"

> A tarball plus a hash tells you the bytes did not change in transit. A
> .vxn bundle tells you the build was deterministic: entries are
> canonically ordered, compression is zstd at a pinned level, identity is
> blake3, and the manifest pins are compared against both `vaerion.yaml`
> and the generated `vaerion.lock` — a mismatch is a hard failure (the
> digest-swap defense). `verify` is a pure check: it never executes
> package content. The quickstart's move is the demo: build twice, diff
> the digests yourself.

## Conduct notes

- Post the submission text verbatim; do not add a second link or a
  call-to-action.
- Reply in the founder voice from the repo identity (Auren). Answers cite
  ADRs, E-codes, and measured numbers — no adjectives doing the work of
  evidence.
- If a claim is challenged and cannot be recomputed, say so in-thread and
  open the defect. That response is the product.
