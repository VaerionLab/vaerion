# Product Hunt Kit — draft (Founder approval required to publish)

> **Update (2026-10-21):** the facts below were updated to the published truth — engine of record `0.1.15` (GA); npm delivers `vaerion 0.1.15` under dist-tag `latest` (published 2026-10-21); PyPI and the signed GitHub Release `v0.1.15` published 2026-10-17.

| | |
|---|---|
| **Status** | DRAFT — nothing is published without Founder approval |
| **Voice law** | `brand/BRAND-BOOK.md` §10: engineered, declarative, exact. No hype, no exclamation marks. Claims carry evidence or an UNVERIFIED marker. |
| **Honesty law** | npm and PyPI are LIVE (npm published 2026-10-21; PyPI 2026-10-17) — name them with their dates. `vaerion.dev` and the Discord server remain release-train items (Founder-gated); never presented as live. |

---

## Product name

**Vaerion**

## Tagline (≤60 chars)

> Trust infrastructure for AI agents — receipts included.

56 characters. Alternates, in order of preference:

- `Local-first trust infrastructure for AI agents` (47)
- `AI agents, governed fail-closed — with receipts` (48)

## Gallery image text (5 slides)

Rendered on the terminal palette per `brand/BRAND-BOOK.md`: ink
background `#0B0D10`, gold `#D4AF37` accents, Geist Mono for all terminal
output. Real output only — screenshots from `VAE_UI=rich` evidence
capture, never mock-ups.

| # | Headline | Body | Visual |
|---|---|---|---|
| 1 | AI agents act. Trust is missing. | Agents read files, call models, run tools. The record they leave is a log written by the process you are auditing. The question that matters: can you recompute what it did? | Ink slide, the Ledger V mark, tagline `VERIFIED · REPRODUCIBLE · TRUSTED` in mono. |
| 2 | Every step lands on the journal | One versioned event spine. Append-only NDJSON, single writer, blake3 hash-chained. Every run closes with a receipt folded from the journal — it verifies independently of the process that produced it. | Screenshot: `vae journal verify <RUN_ID>` → `ok: true`. |
| 3 | Nothing acts without authority | A fail-closed permission broker decides every source read, model call, and tool use. Deny stops the run. A prompt pauses it with a durable human gate. Refusals land in their own hash-chained log. | Screenshot: a broker decision panel from a `vae run demo` transcript. |
| 4 | Identical inputs. Identical bytes. | `vae package build` folds declared inputs into a `.vxn` bundle. `vae package verify` recomputes every digest and executes nothing. Build it twice; compare the blake3 digests yourself. | Side-by-side terminal: two builds, matching digests. |
| 5 | Local-first. Zero telemetry. Enforced. | Config accepts exactly one value: `telemetry.enabled: false`. A constitutional gate fails the build if anything else tries to phone home. 9 gates, 721 tests, 5,277 expectations — green before every commit. | Screenshot: `vae doctor` summary panel; status line of the verification record. |

## First comment (maker comment — posted by Auren)

> I built Vaerion because I could not answer a question I kept asking:
> "can I recompute what this agent just did?"
>
> Logs did not answer it. Logs are written by the process you are
> auditing, and they go quiet exactly where the decisions happen. So I
> built the thing I wanted instead: an engine where every step lands on
> an append-only, blake3-chained journal; every model call, source read,
> and tool use passes a fail-closed broker whose decisions are themselves
> journaled; and every run closes with a receipt you can verify without
> trusting the process that made it.
>
> A few things I will not claim today, because honesty is load-bearing
> here:
>
> - npm and PyPI are live. Install today is `npm install -g vaerion`
>   (vaerion 0.1.15 under dist-tag latest, published 2026-10-21); PyPI
>   delivered 0.1.15 on 2026-10-17. The signed release tarballs remain
>   (Ed25519, with a VERIFY.md that teaches three verification legs).
> - The engine of record is 0.1.15 — the first stable release. Stable
>   within v1: exit codes 0–5 and the 82-code E-catalog. Cross-version
>   upgrades carry honest UNVERIFIED labels until measured.
> - Zero telemetry is enforced mechanically: the config guard accepts
>   exactly one value, and a constitutional check fails the build if any
>   other egress appears. That is not a promise in a privacy policy; it
>   is a gate that goes red.
>
> The measured state of the engine of record: 9 verification gates, 721
> tests / 0 failed, 5,277 expectations, 25,037 engine lines, 20 ADRs,
> Apache-2.0.
>
> If you find something the engine cannot prove, that is not a bug in
> your expectations — it is a defect in the engine, and I want the
> terminal output.

## FAQ (3)

**Q: How is this different from agent tracing / observability tools?**
Tracing shows you what a framework thinks happened; Vaerion recomputes
what actually happened. Journals are append-only and hash-chained,
receipts verify independently of the producing process, and bundle
verification is a pure check that never executes content. There is no
cloud, no dashboard to trust — the verification surface is the CLI on
your machine.

**Q: Does it work offline? Which models?**
Local operation needs no network at all. Models run behind one sanctioned
gateway: OpenAI, Anthropic, and Ollama are real providers;
MockBrain is a deterministic local virtual provider — byte-identical
outputs for the same seed, so the whole pipeline is testable without a
network. Secrets resolve from the OS keychain behind broker decisions and
never enter journals, receipts, or bundles.

**Q: Is it production-ready?**
Engine `0.1.15` is the first stable release; the remaining-risk ledger
is public (`docs/security/RISK-LEDGER.md`). What is stable within v1:
exit codes 0–5, the additive-only E-code catalog, the `--json` machine
contract, and the verification law (all 9 gates green before any
commit, re-run by CI on every push).

## Topics (suggested)

- **Developer Tools**
- **Artificial Intelligence**
- **Open Source**

## Posting notes

- Maker comment goes up within the first hour; replies follow the HN-grade
  honesty law — measured answers, links only to real docs.
- Upvote requests never appear in any asset. The product's argument is the
  receipt.
- The gallery and the FAQ must carry the same numbers as
  `site-data/vaerion-status.json` at posting time; re-measure before
  publish.
