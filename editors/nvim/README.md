# Vaerion for Neovim

The Vaerion Developer Workspace Experience for Neovim 0.10+.

> **HONESTY MARKER (Honesty Law, updated 2026-10-21):** this plugin is a **scaffold** — `lua/vaerion/init.lua` is currently a **0-byte placeholder**, not a working module. As committed, `require("vaerion").setup({})` will fail, none of the `:Vaerion*` commands are defined, and the `statusline()` API does not exist. The command and API surfaces below are the **design contract**, not a working implementation; they are tracked to be authored for **v0.1.16**. The CLI contracts the design consumes (`status`, `doctor`, `report`, `ai status`, `journal ls/show`, `--json` catalog) **are** verified by the repository's own test suite — the gap is in this Lua layer, and this file no longer claims otherwise.

## Planned install (not functional yet)

```lua
-- lazy.nvim — the intended shape once the module is authored
{
  dir = "<path-to-vaerion>/editors/nvim",
  config = function() require("vaerion").setup({}) end,
}
```

Install the CLI first (`docs/INSTALL.md`) — the plugin is a window, the CLI is the engine. Until the module lands, the CLI is usable directly from any shell.

## Planned command surface (design contract — not yet implemented)

| Command | What it will do | How it will run |
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

## Planned statusline (design contract — not yet implemented)

```lua
-- e.g. in lualine: require("vaerion").statusline()
-- → "vae:workspace·anthropic/claude-…" or "vae:fresh"
```

Computed only when the statusline evaluates it (no timers, no polling).

## Laws honored (binding on the future implementation)

- **Editors call the CLI** — zero business logic in Lua; it parses the stable `--json` contract only.
- **No secrets** — the plugin never touches env/keychains; `vae ai setup` runs in a terminal, by law.
- **No polling** — work happens when you ask.
- **Interactive verbs stay interactive** — run/init/clean/snapshot run in `:terminal` where output streams and the developer stays in control.
