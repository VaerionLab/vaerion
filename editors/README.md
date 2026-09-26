# Vaerion Editor Ecosystem

Three editor integrations, one law: **the editor owns no business logic** —
every integration is a thin surface over the `vae` CLI (the CLI is the one
authority; the editors render and invoke it). All three are version-pinned
to the engine version of record by
`packages/vaerion/tests/integration/version-register.test.ts`.

Status vocabulary is the repository's own: VERIFIED (measured on this tree) /
authored (reviewed, never executed here) / Founder-gated (publish requires
the release train).

## VS Code — `editors/vscode/`

- Package: `vaerion-vscode` (publisher `vaerion`), version = engine version
  of record (`0.1.13-rc1`), license = Apache-2.0 by reference.
- Surface: status bar, one-click `vae doctor`, run history, journal viewer,
  snapshots, YAML schema + snippets for `vaerion.yaml`
  (`schemas/vaerion-yaml.schema.json`, kept byte-identical to
  `spec/schemas/vaerion-yaml.schema.json`).
- Implementation: `extension.js` + `lib/protocol.js` / `lib/view.js`
  (TypeScript declarations in `lib/*.d.ts`); media in `media/`.
- Status: authored and reviewed; execution requires a VS Code host.
  Marketplace publish is **Founder-gated** (`vsce publish` with
  `VSCE_PAT`; prepared, not run — the F-5 publication step).

## Neovim — `editors/nvim/`

- Package: a single Lua module `lua/vaerion/init.lua` + `README.md`.
- Surface: status/doctor/journal helpers through the `vae` CLI.
- Status: **authored, never executed** — no `nvim` binary exists in the
  engineering environment, and this file does not claim otherwise.
  Distribution structure is prepared for a future plugin channel;
  publishing is Founder-gated.

## JetBrains — `editors/jetbrains/`

- Package: Gradle IntelliJ-plugin skeleton
  (`build.gradle.kts`, `settings.gradle.kts`,
  `src/main/kotlin/dev/vaerion/editors/jetbrains/VaerionStatusAction.kt`,
  `src/main/resources/META-INF/plugin.xml`), `group dev.vaerion.editors`,
  version = engine version of record (`0.1.13-rc1`).
- Surface: a status action invoking the `vae` CLI.
- Status: **skeleton, never compiled or executed** — no Gradle/IntelliJ SDK
  exists in the engineering environment, and this file does not claim
  otherwise. Marketplace publish is Founder-gated.

## The common contract

1. One business-logic site: the `vae` CLI (docs/CLI.md). Editors parse,
   render, and invoke — they never reimplement.
2. One version law: every editor manifest carries the engine version of
   record, pinned in the version register.
3. One publish law: no marketplace upload happens outside the Founder's
   release-train authorization.
4. One honesty law: unexecuted states are labeled as such — here and in
   each integration's README.
