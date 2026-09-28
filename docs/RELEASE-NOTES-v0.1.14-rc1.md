# Release Notes — v0.1.14-rc1

Vaerion 0.1.14-rc1 — the verification layer for AI agents

**TL;DR** — the completeness-closure release. In 0.1.13 the journal proved *integrity*: any edit to any record is detected. In 0.1.14 it also proves *completeness*: a journal that has been truncated — even cleanly — now fails verification with a taught error. Tail deletion, re-chained deletion, receipt removal, and post-close substitution are all detected. Nothing about your setup changes; verification got stricter because the receipt your run already writes at close was always there to be enforced.

**Install** (requires Bun 1.3+):

```sh
npm install -g vaerion@rc
vae init --template demo
vae run demo
vae journal verify <RUN_ID>   # → ok · anchored · complete
```

**What's new**

- **E1010 — the journal completeness anchor.** `vae journal verify` now enforces one invariant: *a receipt record certifies the prefix immediately before it.* The close-time receipt commits to the final record count and head hash; the verifier finally reads it. A truncated journal → `E1010` (exit 5) with fix guidance. `vae doctor` reports completeness too.
- **Layered detection.** Semantic forgery (body edited + re-hashed) → `E1001` at the successor. Middle-record deletion + full re-chain → `E1005` (sequence gap). Post-close substitution + re-chain → `E1010` (head commitment). Receipt-claim edits → `E1001`/`E1010`.
- **Exports stay verifiable.** Copied receipts re-certify to the export's own chain, so a redacted export self-verifies without breaking provenance — and export of an attacked (truncated) journal is refused at the source.
- **The attack suite ships as tests.** 12 permanent scenarios at `packages/vaerion/tests/security/journal-completeness.test.ts`, including the lawful-flow compatibility cases (torn-receipt recovery re-certifies; in-flight runs make no completeness claim; redacted exports verify). Package gate: **645/645 pass**, typecheck clean.

**Prove it on your machine** (~60 seconds, no API key — the demo uses the deterministic MockBrain model):

```sh
npm install -g vaerion@rc
mkdir proof && cd proof && vae init --template demo && vae run demo
# delete the last line of .vaerion/journal/<RUN_ID>.ndjson, then:
vae journal verify <RUN_ID>    # → E1010, exit 5
```

**Honest boundaries.** Vaerion is tamper-*evident*, not tamper-*impossible*: a hostile host with write access is outside what client-side anchoring can prevent — use `vae snapshot` / published receipts for adversarial custody. The record proves what the engine observed; it cannot make a compromised host truthful. The full model, the tested attack table, and the bootstrap-key disclosure live in `VAERION_SECURITY_PROOF_v1.0.md` in the repository.

**Links**: repository `github.com/VaerionLab/vaerion` · security policy `SECURITY.md` · install `npm install -g vaerion`

Apache-2.0 · zero telemetry · local-first
