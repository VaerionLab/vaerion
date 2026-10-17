/**
 * Vaerion CLI — the interactive first-run prompt layer (Phase 59.2).
 *
 * 59.1 shipped `vae start` deliberately non-interactive (scriptable,
 * testable). This module adds the TTY-interactive prompt layer ON TOP of the
 * existing CliIo port — a second I/O layer is never introduced: prompts
 * render through `io.out`, answers arrive through the `input?()` port
 * (provided only for real terminals and scripted tests), and the engage law
 * keeps every scripted, piped, and `--json` invocation byte-identical to the
 * pre-59.2 surface.
 *
 * Engage law (measured, pinned in tests/integration/cli-interactive.test.ts):
 *   - `--no-interactive` refuses prompts outright (it wins over -i).
 *   - `--json` NEVER prompts — NDJSON stays pure; missing required input is
 *     the standing E1600 usage error, never a question on stdout.
 *   - auto mode: prompts engage only when stdout is a TTY AND an input port
 *     exists AND required input is actually missing (nothing is asked when
 *     flags already answer everything).
 *   - `--interactive` / `-i` FORCES the prompts (flag values become the
 *     highlighted defaults; Enter accepts) — refused honestly (E1600) in
 *     --json mode or when no input port exists (a forced prompt with no
 *     way to answer is a usage error, never a hang, never a silent skip).
 *   - prompts live on the cold path: this module is dynamically imported by
 *     the commands that need it, so the non-interactive hot path never loads
 *     it (performance law).
 *
 * Selection is by NUMBER or exact template NAME. Arrow-key navigation is
 * deliberately out of scope: the CliIo input port is line-oriented by
 * design (raw-mode keypress handling would bypass the port, break the
 * scripted-test parity, and drag a second I/O layer in behind it).
 *
 * Pure module relative to process streams — all I/O crosses CliIo.
 */

import type { CliIo, OutputMode } from "./io.ts";
import { VaerionError } from "../kernel/errors.ts";
import { INIT_TEMPLATES, assertValidProjectName, initTemplateNames } from "../config/templates.ts";

/** How the prompt layer engages for one invocation. */
export type Interactivity = "off" | "auto" | "forced";

/**
 * The engage law for one invocation. Throws E1600 only for the two
 * forced-prompt impossibilities (--json, or no input port) — a forced
 * prompt that cannot be answered must fail loudly, never hang or skip.
 */
export function interactivityOf(io: CliIo, mode: OutputMode, flags: Record<string, string | boolean>): Interactivity {
  if (flags["no-interactive"] === true) return "off"; // explicit refusal wins over --interactive
  if (flags.interactive === true) {
    if (mode === "json") {
      throw new VaerionError("E1600", "--interactive never prompts in --json mode (--json stays pure NDJSON; Fix: drop --interactive or --json)");
    }
    if (typeof io.input !== "function") {
      throw new VaerionError("E1600", "--interactive requires an interactive terminal with readable stdin (Fix: run in a terminal, or drop --interactive)");
    }
    return "forced";
  }
  if (mode === "json") return "off";
  return io.tty === true && typeof io.input === "function" ? "auto" : "off";
}

/**
 * The template picker: the registry of record, numbered, with its honest
 * one-line descriptions. Answers: a number in range, an exact template
 * name, or bare Enter for the default. Invalid picks re-prompt (the list
 * is printed once; the prompt line repeats until a valid answer arrives).
 * EOF (stdin closed) aborts with a teaching E1600 — never an infinite loop.
 */
export async function promptTemplateChoice(io: CliIo, opts: { defaultName: string; header: string }): Promise<string> {
  const names = initTemplateNames(); // deterministic sorted registry order
  io.out(opts.header);
  names.forEach((n, i) => io.out(`  ${i + 1}) ${n} — ${INIT_TEMPLATES[n]!.description}`));
  for (;;) {
    io.out(`? Template number or name [${opts.defaultName}]:`);
    const line = await io.input!();
    if (line === null) {
      throw new VaerionError("E1600", "interactive selection aborted: stdin closed before a template was chosen (Fix: pass --template <name>, or --no-interactive to skip prompts)");
    }
    const t = line.trim();
    if (t.length === 0) return opts.defaultName; // bare Enter accepts the default
    if (/^\d+$/.test(t)) {
      const idx = parseInt(t, 10) - 1;
      const byNumber = idx >= 0 && idx < names.length ? names[idx] : undefined;
      if (byNumber !== undefined) return byNumber;
    } else if (names.includes(t)) {
      return t;
    }
    io.out(`  ✗ "${t}" is not a template number (1-${names.length}) or name — pick again (available: ${names.join(", ")})`);
  }
}

/**
 * The workspace-name prompt with the SAME validation law as `vae create`
 * (assertValidProjectName — one rule, every surface that names a
 * workspace). Bare Enter accepts the suggested default; invalid names
 * re-prompt with the exact reason. EOF aborts with a teaching E1600.
 */
export async function promptWorkspaceName(io: CliIo, opts: { defaultName: string }): Promise<string> {
  for (;;) {
    io.out(`? Workspace name [${opts.defaultName}]:`);
    const line = await io.input!();
    if (line === null) {
      throw new VaerionError("E1600", "interactive naming aborted: stdin closed before a workspace name was chosen (Fix: pass --name <name>, or --no-interactive to skip prompts)");
    }
    const t = line.trim();
    const candidate = t.length === 0 ? opts.defaultName : t;
    try {
      assertValidProjectName(candidate);
      return candidate;
    } catch (err) {
      io.out(`  ✗ ${(err as Error).message}`);
    }
  }
}
