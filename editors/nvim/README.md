# Vaerion for Neovim

The Vaerion Developer Workspace Experience for Neovim 0.10+.

> **HONESTY MARKER (Honesty Law):** this plugin is authored but has **never been executed** in the Vaerion build environment — no `nvim` binary exists there, so no activation, rendering, or command-routing claim is made. The CLI contracts it consumes (`status`, `doctor`, `report`, `ai status`, `journal ls/show`, `--json` catalog) **are** verified by the repository's own test suite. If anything drifts, the drift is in this Lua layer — please report it.

## Install

```lua
-- lazy.nvim
{
  dir = "<path-to-vaerion>/editors/nvim",
  config = function() require("vaerion").setup({}) end,
}
```

Install the CLI first (`docs/INSTALL.md`) — the plugin is a window, the CLI is the engine.

## Commands

| Command | What it does | How it runs |
| --- | --- | --- |
| `:Vaerion status` | workspace, identity, AI, runs, next hints | headless `vae status --json` → centered float |
| `:Vaerion doctor` | full health audit, findings teach (cause → impact → fix) | headless `vae doctor --json` → float |
| `:Vaerion report` | the insight fold over every journal | headless `vae report --json` → float |
| `:Vaerion ai` | provider matrix, credential presence (never values) | headless `vae ai status --json` → float |
| `:Vaerion dev` | engine version, layers, gateway matrix | headless → float |
| `:Vaerion tour` | the nine-step guided tour | headless → float (tour is read-only by law) |
| `:VaerionJournal` | pick a run, read its journal as a rendered timeline | `vae journal ls/show --json` |
| `:VaerionInteractive run demo` | a full constitutional run | `:terminal` — streams live, developer-owned |
| `:VaerionInteractive init` / `clean` / `snapshot` | scaffold / maintenance / recovery | `:terminal` |

## Statusline

```lua
-- e.g. in lualine: require("vaerion").statusline()
-- → "vae:workspace·anthropic/claude-…" or "vae:fresh"
```

Computed only when the statusline evaluates it (no timers, no polling).

## Laws honored

- **Editors call the CLI** — zero business logic in Lua; it parses the stable `--json` contract only.
- **No secrets** — the plugin never touches env/keychains; `vae ai setup` runs in a terminal, by law.
- **No polling** — work happens when you ask.
- **Interactive verbs stay interactive** — run/init/clean/snapshot run in `:terminal` where output streams and the developer stays in control.
