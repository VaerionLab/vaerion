# Vaerion for JetBrains IDEs

> **HONESTY MARKER (Honesty Law, updated 2026-10-22):** this skeleton has **never been compiled or executed** — no IntelliJ SDK or Gradle toolchain exists in the Vaerion build environment. It is a **scaffold**: `plugin.xml` is real, and the Kotlin action source (`src/main/kotlin/dev/vaerion/editors/jetbrains/VaerionStatusAction.kt`) is currently a **0-byte placeholder** tracked to be authored for **v0.1.16** (same disclosure discipline as the nvim plugin) — the `Tools → Vaerion Status` action and the `vae status --json` call below are the design contract, not a working implementation. The CLI contract the design parses **is** verified by the repository's own test suite (editor protocol v1). Compile it locally with IntelliJ IDEA 2023.2+:

```sh
cd editors/jetbrains && gradle buildPlugin
```

## What it is specified to do (design contract — not yet implemented)

- **Tools → Vaerion Status** — runs `vae status --json --cwd <project>` and shows the payload. Exit codes are surfaced honestly (2 usage · 3 broker-denied · 4 provider-down).

## Roadmap (in fidelity order — each step reuses the CLI, none adds logic)

1. Tool window rendering the full `status`/`doctor`/`report` payloads (the same JSON the VS Code extension consumes).
2. Run history list from `vae journal ls --json`; click-through to `journal show` records.
3. One-click doctor with the cause → impact → fix chain mapped to IDEA inspections.
4. Terminal embedding for interactive verbs (run/init/clean/snapshot), mirroring the VS Code extension's split: read-only verbs call `--json`, streaming verbs stay in a visible terminal.

## Laws

Editors call the CLI; the CLI owns all business logic. No secrets in the IDE (credential handling is `vae ai setup` in a terminal). No polling.
