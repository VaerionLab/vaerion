# Launch Announcement — draft (Founder approval required to publish)

# Vaerion: trust infrastructure for AI agents

**Suggested subtitle:** Receipts, fail-closed governance, and reproducible
bundles — running locally, with zero telemetry.

---

## The problem: agents act, trust is missing

AI agents now do real work. They read files, call models, run tools, and
chain all three into decisions. What they almost never leave behind is
proof. The record of an agent run is usually a log written by the same
process you are auditing — easy to lose, easy to edit, and silent about
the decisions that mattered: what was read, what was allowed, what left
the machine.

The question that matters is not "can the agent talk" but "can I recompute
what it did." Today that question has no answer for most of the stack.

## What Vaerion is

Vaerion is a local-first AI-agent trust engine. It runs AI-assisted work
the way a database engine runs transactions, and it makes four moves in
order:

| Move | What it means |
|---|---|
| Identity | Who acts is measured, locally. No cloud accounts. |
| Governance | Nothing acts without authority. A fail-closed permission broker decides, and every decision is journaled. Undeclared tool calls are refused. |
| Evidence | Every step lands on one versioned event spine: append-only journals, a single writer, blake3 hash-chained. Every run closes with a receipt folded from that journal. |
| Verification | Verification is a command, not a promise. Chains, bundles, and workspaces can be recomputed by anyone, on any machine. |

## The proof story

Three artifacts carry the argument.

**Receipts.** The last journal record of every run is its receipt. It
verifies independently of the process that produced it — a notary
document, not a status page.

**blake3-chained journals.** Every run writes one append-only NDJSON
journal. Each record commits to the previous one by hash. `vae journal
verify` recomputes the whole chain; a torn crash tail is repaired by a
recover command that re-seals with an auditable note, never a rewrite.

**Byte-identical bundles.** `vae package build` folds declared inputs into
a `.vxn` bundle. Identical inputs produce identical bytes — canonical
ordering, zstd at a pinned level, blake3 identity — and `vae package
verify` is a pure check: digests recomputed, manifest pins compared
against both `vaerion.yaml` and `vaerion.lock` (the digest-swap defense),
content never executed. Build it twice, compare the digests yourself.

Around all of it sits the broker: config policy evaluates first, a deny
stops the run, a prompt pauses it with a durable human gate, and refusals
land in their own hash-chained log.

## Measured, not promised

Every number below comes from the engine's own verification record
(`.vaerion-verification.json`, engine `0.1.13-rc1`):

| Measurement | Value |
|---|---|
| Verification gates | 9 (all green, enforced before every commit and in CI) |
| Tests | 545 passed / 0 failed, 3,932 expectations |
| Coverage (lines / branches) | 86.52% / 90.6% (floors ratchet, never drop) |
| Engine | 107 files, 22,018 lines |
| Architecture decision records | 21 |
| API paths (loopback daemon) | 17 |
| Stable diagnostic E-codes | 81 (additive-only, never reused) |
| License | Apache-2.0 |

Zero telemetry is not a settings toggle here. The config guard accepts
exactly one value (`telemetry.enabled: false`), and a constitutional
check fails the build if any module outside the single gateway egress
imports network primitives. The engine cannot ship with a phone home.

## Install (honest channels)

Today, two real channels exist:

```sh
# from source — the audit path
git clone https://github.com/falconxa0-commits/vaerion.git vaerion && cd vaerion
bun install
bun run tools/verify.ts        # all 9 gates must be green
alias vae="bun run packages/vaerion/src/cli/vae.ts"
```

Or the signed release tarballs — every release carries `SHA256SUMS`, an
Ed25519-signed `MANIFEST.json`, the public key, and a `VERIFY.md` that
teaches three verification legs (sha256 → engine verifier → openssl
cross-check):

> https://github.com/falconxa0-commits/vaerion/releases

Registry publication (npm, PyPI, Homebrew, winget) is authored and
version-locked but **Founder-gated on the release train**. The
`vaerion.dev` installer URL goes live with that same train. We will not
announce those channels before they are real.

Then, in about fifteen minutes (`docs/QUICKSTART.md`):

```sh
vae init --template demo
vae run demo --sources ./sources --query "determinism"
vae journal verify <RUN_ID>     # ok: true — the chain holds
vae package build
vae package verify .vaerion/package/vaerion-demo.vxn
vae doctor
```

## What Vaerion is not

- **Not a cloud service.** No accounts, no hosted control plane. The
  daemon binds loopback only and refuses any non-loopback bind.
- **Not telemetry-free as a claim — as a mechanism.** Enforced by the
  constitutional gates on every build.
- **Not published to registries yet.** npm/PyPI publish is Founder-gated;
  source and signed tarballs are the real channels today.
- **Not a release-quality product.** Engine `0.1.13-rc1` is a
  prerelease. Exit codes (0–5) and E-codes are stable and additive within
  v1; cross-version upgrade paths carry honest UNVERIFIED labels until
  measured.
- **Not a model.** Vaerion governs and records agent work; models are
  providers behind one gateway (OpenAI, Anthropic, Ollama, and MockBrain,
  the deterministic local provider used for hermetic runs).

## Links

- Repository: https://github.com/falconxa0-commits/vaerion
- Releases (signed artifacts + VERIFY.md): https://github.com/falconxa0-commits/vaerion/releases
- Quickstart: `docs/QUICKSTART.md` · Demo workspace: `examples/vaerion-demo/`
- Threat model and risk ledger: `docs/security/`
- Security reports: `auren@vaerion.dev` (private; see `SECURITY.md`)

Receipts, or it did not happen.
