# Accessibility

The Vaerion CLI accessibility contract — what is guaranteed for screen
readers, color-blind operators, pipes, and CI logs. These properties are
**test-enforced** by the a11y golden suite
(`packages/vaerion/tests/golden/a11y.test.ts`); a violation fails the
verification gates.

## A1 — Plain text is the baseline

The renderer never emits ANSI escapes in any mode, on any surface. There is
no color mode to turn off — there is nothing to turn off. `NO_COLOR=1`,
`TERM=dumb`, a piped (non-TTY) stream, and a screen reader all see exactly
the same characters. Proven by: a zero-ANSI scan across a command matrix
(help, version, dev, doctor, journal ls, package help, error paths — plain
and `--json`), plus a real spawned-process check under
`NO_COLOR=1 TERM=dumb`.

## A2 — Stability

The same command in the same state emits **byte-identical** output. Screen
readers and line-indexed tooling can rely on line order; diffs of CI logs are
meaningful. Proven by double-run determinism tests on `dev` and `doctor` in
both output modes.

## A3 — Machine mode

`--json` emits stable **NDJSON**: one JSON object per line, every line
independently parseable. This includes `version` (a defect where
`version --json` printed the plain line was found by this gate and fixed at
root cause). Proven by a line-by-line parse test over the matrix.

## A4 — Governed surfaces

Help text (`vae --help`, every `vae <command> --help`), the version line, and
the error contract (`E#### code + message + Fix:` line, in both modes) are
**golden fixtures** under `VAE_BLESS=1` governance. A wording change is a
reviewed contract change — drift cannot land silently.

## The error contract

Errors are lines, never beeps, spinners, or cursor games:

```
E1600 unknown command: xyz. Fix: run `vae --help` for the Daily Seven.
```

In `--json` mode the same information arrives as a stable object:

```json
{"error":{"code":"E1600","name":"usage","message":"...","fix":"..."}}
```

Exit codes are honest and documented in every help text
(`0 ok · 1 internal · 2 usage · 3 broker-denied · 4 provider-down ·
5 partial-with-repair-hint`) — automations can trust the exit status, and
humans get the repair hint in the same breath as the failure.

## Design stance

Accessibility here is not a feature toggle; it is a property of the output
layer. The plain-text baseline costs nothing to maintain (there is no second
rendering path), works over every transport (TTY, pipe, SSE), and the gates
make regressions structurally impossible rather than socially discouraged.
