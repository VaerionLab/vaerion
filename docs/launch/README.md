# Launch evidence

Everything in this directory is **real**: real commands, real output, real
timings, captured from the release candidate `v0.1.13-rc1`. No mockups, no
fabricated screenshots, no invented numbers. Where a terminal capture is
rendered as an image, the pixels carry the exact bytes of a recorded run.

| Evidence | What it proves |
|---|---|
| [`architecture.svg`](architecture.svg) + [`ARCHITECTURE.md`](ARCHITECTURE.md) | How one action becomes evidence — the flow through the engine |
| [`installation-walkthrough.md`](installation-walkthrough.md) | A stranger installs Vaerion on an empty machine — every step timed |
| [`demo-flow.md`](demo-flow.md) | The first action: `vae init` → `vae run` → a folded receipt |
| [`receipt-verification.md`](receipt-verification.md) | The chain holds: `vae journal verify`, field by field |
| [`screenshots/`](screenshots/) | Rendered captures of the real runs above |

Identity law: the official Vaerion assets are the Founder-provided set in
[`brand/official/`](../../brand/official/) with its custody MANIFEST — the
one identity source of record. Tagline of record: **SEE IT. EXPLAIN IT.
OWN IT.**

Captures were taken in a scratch workspace on the recording machine, so
absolute paths inside outputs are that machine's — every other byte is
the engine's, unedited.
