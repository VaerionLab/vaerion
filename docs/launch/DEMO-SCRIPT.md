# 90-Second Terminal Demo Script — draft (Founder approval required to publish)

| | |
|---|---|
| **Status** | DRAFT — recording and publication require Founder approval |
| **Command law** | Every command below is real and documented in `docs/QUICKSTART.md` and `examples/vaerion-demo/DEMO.md`. Nothing is mocked, nothing is edited after capture. |
| **Honesty law** | The output shown must be the output produced. If a beat fails on the recording machine, the take is re-shot after fixing the machine — never re-painted. |

---

## Cast and setting

- One terminal window, `VAE_UI=rich` on a real TTY (rich profile is the
  interactive evidence surface; `NO_COLOR`, `TERM=dumb`, and `CI` must be
  unset — they force the plain profile).
- Working directory: a fresh copy of `examples/vaerion-demo/` (or any
  empty directory that will receive `vae init --template demo`).
- Runtime: Bun 1.3+ with the engine built (`bun install`, gates green).
- Capture the full screen; crop nothing that shows a failure.

## Recording palette (per `brand/BRAND-BOOK.md`)

| Token | Value | Use |
|---|---|---|
| Background | `#0B0D10` (ink) | terminal background everywhere |
| Prompt / accent | `#D4AF37` (gold) | the prompt marker, key highlights only |
| Text | `#FAF9F6` (porcelain) | primary output text |
| Muted | `#9C9CA6` (mist) | captions, secondary |
| Success | `#3F9B6E` | verified states |
| Error | `#C24E4E` | failures only |

Font: **Geist Mono** (fallback JetBrains Mono). Terminal size: fixed, at
least 100 columns × 30 rows (the CLI clamps render width to 56–120).
Screen recording at 2× for crisp mono glyphs. The cursor is the only
thing allowed to blink.

---

## The 90-second cut (0:00 – 1:30)

### 0:00 – 0:06 — Title card

- **Narration:** "AI agents act. Vaerion makes their work verifiable.
  Fifteen minutes compressed to ninety seconds — every frame is real
  output."
- **On-screen:** ink background, the Ledger V mark, tagline
  `VERIFIED · REPRODUCIBLE · TRUSTED` in Geist Mono, gold.

### 0:06 – 0:16 — Create the workspace

- **Narration:** "A workspace is one manifest plus one state directory.
  Nothing else exists anywhere on the machine."
- **On-screen:** type and run:
  ```sh
  vae init --template demo
  ```
- **Expected output shape:** a short scaffold panel — `vaerion.yaml`
  created, `.vaerion/` state tree, template name `demo`, exit 0. The
  panel lists what was written; nothing more.

### 0:16 – 0:36 — The run

- **Narration:** "One command runs the pipeline: local sources are
  indexed through the broker, every step lands on the journal, and the
  run closes with a receipt."
- **On-screen:** type and run:
  ```sh
  vae run demo --sources ./sources --query "determinism"
  ```
- **Expected output shape:** the broker's per-source decision, the
  pipeline steps, then the run id printed at the end — highlight
  (circle or box) the `RUN_ID`; it is used in the next beat.

### 0:36 – 0:48 — Verify the journal

- **Narration:** "The journal is append-only and blake3-chained.
  Verification is a command, not a promise."
- **On-screen:** type and run:
  ```sh
  vae journal verify <RUN_ID>
  ```
- **Expected output shape:** the chain check recomputing per record and
  closing with `ok: true`. This is the beat to let breathe — the
  receipt is the product.

### 0:48 – 1:02 — Prove reproducibility

- **Narration:** "Now the part you can hold: build the bundle twice.
  Identical inputs, identical bytes."
- **On-screen:** type and run:
  ```sh
  vae package build
  vae package build --out second.vxn
  ```
- **Expected output shape:** two build receipts, each ending in a
  blake3 digest; the two digests are identical. Optionally cut to a
  side-by-side view of both digest lines.

### 1:02 – 1:12 — Verify the bundle

- **Narration:** "Verification is a pure check: digests recomputed,
  manifest pins compared, content never executed."
- **On-screen:** type and run:
  ```sh
  vae package verify .vaerion/package/vaerion-demo.vxn
  ```
- **Expected output shape:** a per-check findings list ending verified,
  exit 0.

### 1:12 – 1:22 — Health check

- **Narration:** "One command proves the whole workspace is healthy —
  config, journals, blobs, audit chain. It performs no network access."
- **On-screen:** type and run:
  ```sh
  vae doctor
  ```
- **Expected output shape:** a summary panel of checks (config,
  journals, blobs, audit ledger, gateway matrix), all green, exit 0.

### 1:22 – 1:30 — Close card

- **Narration:** "Every frame here is re-runnable on your machine.
  Install today: source, or the signed release tarballs. Receipts, or
  it did not happen."
- **On-screen:** ink card — repo URL
  `github.com/falconxa0-commits/vaerion`, engine version line
  `0.1.13-rc1 · 9 gates · 545 tests / 0 failed`, and the honest install
  line: "npm/PyPI publish is Founder-gated on the release train."

---

## The 30-second cut (short version)

| Time | Beat | Command |
|---|---|---|
| 0:00 – 0:04 | Title card | — |
| 0:04 – 0:10 | Workspace | `vae init --template demo` |
| 0:10 – 0:18 | The run | `vae run demo --sources ./sources --query "determinism"` |
| 0:18 – 0:24 | The chain holds | `vae journal verify <RUN_ID>` → `ok: true` |
| 0:24 – 0:30 | Identical bytes | `vae package build` ×2 → matching digests, then `vae package verify .vaerion/package/vaerion-demo.vxn` |

Narration for the cut is the same sentences, one per beat, no
introduction. The close card is two seconds, repo URL only.

---

## Recording notes

1. **One take per beat.** Re-shoot a beat rather than editing its output;
   the honest output law outranks polish.
2. **Type the commands on camera** where the cut allows it — typing is
   evidence that nothing is scripted behind the scenes. For the 30-second
   cut, pre-typed prompts with visible history are acceptable.
3. **No color edits in post.** The terminal palette above is configured
   before recording; post-production may only crop, scale, and add
   highlight boxes.
4. **Highlight discipline.** One highlight at a time, gold `#D4AF37`
   hairline box, 150–250 ms ease-out — the brand motion law.
5. **Cursor and caret.** Show the real caret; do not fake a block cursor
   overlay.
6. **Scroll discipline.** If a beat's output exceeds the viewport, let it
   scroll once, naturally — no fast-cut jumps inside a command's output.
7. **Audio.** Narration voice: measured pace, no music bed louder than
   −30 dB relative to voice, no sound effects.
8. **Captions.** Burned-in captions on by default; the narration lines
   above are the caption source of truth.
9. **Pre-flight before the take:** `bun run tools/verify.ts` prints ALL
   GATES GREEN on the recording machine; `vae doctor` exits 0 in the
   demo directory; record the run id of the demo run in the shoot notes
   so the artifact is traceable.
10. **Publication gate.** The rendered file ships only with Founder
    approval, together with the honest-install close card intact.
