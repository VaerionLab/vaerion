# Social Posts Kit — draft (Founder approval required to publish)

| | |
|---|---|
| **Status** | DRAFT — nothing is published without Founder approval |
| **Voice law** | `brand/BRAND-BOOK.md` §10. Engineered, declarative, exact. No exclamation marks, no hype, numbers measured. Hashtag discipline: maximum 2 where fitting, none by default. |
| **Gated items** | npm/PyPI publish, `vaerion.dev`, Discord invite — named as release-train items or not named at all. Never presented as live. |

---

## 1. X / Twitter — launch thread (4 tweets, each ≤280 chars)

**Tweet 1 — the hook**

```
AI agents act. Trust is missing.

Vaerion is a local-first trust engine for AI agents: blake3-chained
journals, Ed25519-signed receipts, reproducible .vxn bundles, a
fail-closed permission broker. Zero telemetry.

Receipts, or it did not happen.
```

**Tweet 2 — measured, not promised**

```
Vaerion runs AI-assisted work the way a database engine runs
transactions.

Measured, not promised: 9 verification gates, 545 tests / 0 failed,
3,932 expectations, 22,018 engine lines, coverage 86.52/90.6. Every
number from the engine's own verification record.
```

**Tweet 3 — the proof, in four commands**

```
The proof is mechanical:

vae run demo — every step journaled, closes with a receipt
vae journal verify <RUN_ID> — the blake3 chain recomputed
vae package build — identical inputs, byte-identical bundles
vae package verify — a pure check. Executes nothing.
```

**Tweet 4 — honest channels + link**

```
Install today: from source, or the signed release tarballs (sha256 →
Ed25519 → openssl cross-check). npm/PyPI publish is Founder-gated on
the release train. vaerion.dev goes live with it.

Apache-2.0. https://github.com/falconxa0-commits/vaerion
```

*(Character counts verified against the 280 limit before posting — see
the posting checklist at the bottom.)*

---

## 2. LinkedIn — founder post

```
I kept asking one question about AI agents and could not answer it:
"can I recompute what this agent just did?"

Logs did not answer it. Logs are written by the process you are
auditing, and they go quiet exactly where the decisions happen — what
was read, what was allowed, what left the machine.

So I built Vaerion. It is a local-first trust engine for AI agents,
and it makes the evidence architectural rather than procedural:

- Every step of a run lands on an append-only journal, blake3
  hash-chained. Every run closes with a receipt that verifies
  independently of the process that produced it.
- Nothing acts without authority: a fail-closed permission broker
  decides every sensitive operation, and its decisions are journaled
  too. Deny stops the run; a prompt pauses it with a durable human
  gate.
- Deliverables build into reproducible .vxn bundles — identical
  inputs produce identical bytes, and verification never executes
  the content.
- Zero telemetry is enforced mechanically: the config guard accepts
  exactly one value, and a constitutional check fails the build if
  any other network egress appears.

The measured state of the engine of record (0.1.13-rc1): 9
verification gates, 545 tests with 0 failed, 3,932 expectations,
22,018 engine lines, Apache-2.0.

An honest note on availability: npm and PyPI publication is
Founder-gated on the release train. Today you install from source or
from the signed release tarballs, which ship with the instructions to
verify them. I will not announce a channel before it is real.

If you find a claim the engine cannot prove from terminal output,
that is a defect and I want the output: auren@vaerion.dev.

https://github.com/falconxa0-commits/vaerion
```

---

## 3. Reddit — r/LocalLLaMA (self-post, story first)

**Title:**

```
I built a local-first trust engine for AI agents: every run leaves a
blake3-chained journal, a signed receipt, and reproducible bundles. Zero
telemetry, enforced by the build itself.
```

**Body:**

```
The question I could not shake: when a local agent reads your files and
runs your tools, can you recompute what it did afterwards? For most
stacks the answer is no — the log is written by the process you are
auditing and is neither append-only nor hash-chained.

Vaerion (Apache-2.0, TypeScript on Bun) is my answer. It is an engine,
not a framework:

- One event spine per run. Append-only NDJSON journals, single writer,
  blake3 hash-chained. `vae journal verify <RUN_ID>` recomputes the
  whole chain on your machine and prints the result.
- A fail-closed permission broker. Every source read, model call, and
  tool use is a broker decision, journaled. Policy deny stops the run;
  a prompt policy pauses it with a durable human gate you resolve with
  `vae resume`.
- Reproducible .vxn bundles. `vae package build` twice and the bytes
  are identical; `vae package verify` is a pure check that never
  executes content.

For the local angle specifically: models sit behind one gateway —
OpenAI, Anthropic, Ollama — plus MockBrain, a deterministic seeded
virtual provider that runs entirely offline with byte-identical outputs
for the same seed. The whole pipeline is exercisable with zero network.
Zero telemetry is enforced mechanically: the config guard accepts
exactly one value (telemetry.enabled: false) and a constitutional
check fails the build if anything else tries to egress.

State of record for 0.1.13-rc1: 9 verification gates, 545 tests / 0
failed, 3,932 expectations, coverage 86.52/90.6.

Install honesty: npm/PyPI publish is Founder-gated on the release
train and has not happened yet. Today: source, or the signed release
tarballs (Ed25519, sha256, a shipped VERIFY.md with three verification
legs). Repo: https://github.com/falconxa0-commits/vaerion

Happy to answer design questions — the ADRs and the threat model are
public.
```

---

## 4. Reddit — r/devops (self-post, ops angle)

**Title:**

```
Governance for AI agents in the pipeline: hash-chained journals, a
fail-closed permission broker, exit codes 0–5, and release artifacts
you verify before you trust (Apache-2.0)
```

**Body:**

```
If agents start doing real work in your pipelines, the audit question
changes shape: not "what did the agent say" but "can I recompute what
it did, and can I prove a refusal when it was denied." I built
Vaerion — a local-first trust engine for exactly that surface.

The parts an ops person will care about:

- Exit codes are law: 0 ok, 1 internal, 2 usage, 3 broker-denied,
  4 provider-down, 5 partial-with-findings. Every failure maps to a
  stable E-code (81 today, additive-only, never reused) with a Fix:
  hint and a doc anchor.
- `vae ci validate` parses your workflows and refuses gate logic that
  re-implements the verification authority instead of re-running it.
  `vae release readiness` is fail-closed: unmeasurable means blocked,
  exit 5 with the blocker list.
- Every run writes an append-only blake3-chained journal; every
  sensitive action passes a fail-closed permission broker whose
  decisions are journaled too. Refusals go to their own chained log,
  so a denial is evidence you can present later.
- Release artifacts ship as SHA256SUMS + an Ed25519-signed
  MANIFEST.json with the public key beside them and a VERIFY.md
  teaching three verification legs (sha256 → engine verifier →
  openssl cross-check). Verify first, install second.
- Zero telemetry is enforced by a constitutional gate that fails the
  build on undeclared network egress — the config parser accepts
  exactly one value for telemetry: false.

Measured state of the 0.1.13-rc1 engine of record: 9 verification
gates, 545 tests / 0 failed, 3,932 expectations, 22,018 engine lines.

Install honesty: npm/PyPI publish is Founder-gated on the release
train, so today the channels are source and signed release tarballs:
https://github.com/falconxa0-commits/vaerion

Question for this community: what would an agent trust boundary need
to look like in your pipeline before you would let it act?
```

---

## 5. Mastodon — single post

```
Vaerion, now in the open: a local-first trust engine for AI agents.

Every step lands on a blake3-chained journal and closes with a
verifiable receipt. A fail-closed broker governs every model call and
tool use. Identical inputs build byte-identical bundles.

Zero telemetry — enforced by a gate that fails the build.

9 gates, 545 tests, 0 failed. Engine 0.1.13-rc1.

Install: source or signed tarballs; npm/PyPI is Founder-gated.

https://github.com/falconxa0-commits/vaerion

#AIagents #OpenSource
```

---

## 6. Receipt-quote posts (two short standalone posts)

**Post A — the chain holds**

```
vae journal verify <RUN_ID>

→ ok: true

The chain holds. Recomputed on your machine, from the bytes — not
promised by a dashboard.

https://github.com/falconxa0-commits/vaerion
```

**Post B — identical bytes**

```
vae package build          → .vxn bundle 1
vae package build --out second.vxn
vae package verify         → byte-identical. same inputs, same bytes.

A pure check: digests recomputed, pins compared, content never
executed. Reproducibility is a command, not a claim.

https://github.com/falconxa0-commits/vaerion
```

---

## Posting checklist

- [ ] Re-measure `site-data/vaerion-status.json` immediately before
      posting; update every number in every post or do not post.
- [ ] Verify each X tweet ≤280 characters (thread hook first, link only
      in tweet 4).
- [ ] Reddit posts are self-posts; the repo link appears exactly once,
      at the end.
- [ ] No hashtags beyond the two on the Mastodon post; none on X,
      LinkedIn, or Reddit.
- [ ] Gated channels (npm/PyPI, vaerion.dev, Discord) appear only with
      their honest status; delete any post draft that drops the status.
- [ ] Founder approval recorded before any post goes out.
