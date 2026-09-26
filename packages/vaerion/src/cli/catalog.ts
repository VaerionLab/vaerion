/**
 * Vaerion CLI — the machine-readable command catalog (ASC XVIII Phase 7).
 *
 * One structured source of truth for what the CLI can do, published so that
 * editors (VS Code, Neovim, JetBrains, …) can build command palettes from
 * what Vaerion actually is — never from a hand-copied list.
 *
 * Laws:
 *  - `usage` strings MUST appear verbatim in MAIN_HELP (drift-guarded by
 *    tests/editor-protocol.test.ts). Help text stays hand-crafted for
 *    humans; the catalog is the machine view of the same surface, and the
 *    test binds the two representations together — the same law as C4.
 *  - Every dispatcher `case` in vae.ts MUST appear here (same guard).
 *  - `vae --json` (bare) publishes exactly this array as `commands`.
 *  - Deterministic: fixed order, no computed fields, no clock.
 */

export interface CatalogEntry {
  /** The dispatcher command token (first word after `vae`). */
  command: string;
  /** The command family as it appears in MAIN_HELP. */
  family: string;
  /** One-line summary for palettes and hover documentation. */
  summary: string;
  /** The representative usage line — appears verbatim in MAIN_HELP. */
  usage: string;
}

export const COMMAND_CATALOG: readonly CatalogEntry[] = [
  { command: "init", family: "WORKSPACE", usage: "init [--template T] [--name NAME] [--dry-run]", summary: "scaffold a governed workspace — deterministic template registry, conflict law" },
  { command: "status", family: "WORKSPACE", usage: "status", summary: "the project dashboard: workspace, identity, AI, runs, next steps (read-only)" },
  { command: "run", family: "RUNS", usage: "run research --sources P[,P] --query Q [--max-docs N]", summary: "research/demo/model/agent/workflow runs — brokered, journaled, receipted" },
  { command: "resume", family: "RUNS", usage: "resume RUN_ID [--answer JSON]", summary: "restore a run; resolve a pending human gate" },
  { command: "explain", family: "RUNS", usage: "explain RUN_ID", summary: "reconstruct the run's narrative from its journal" },
  { command: "journal", family: "RUNS", usage: "journal ls | show RUN | verify RUN | recover RUN | export RUN [--out P]", summary: "append-only journal operations" },
  { command: "doctor", family: "HEALTH", usage: "doctor", summary: "verify config, journals, blobs, evidence, audit and refusal chains — every finding teaches" },
  { command: "dev", family: "HEALTH", usage: "dev", summary: "engine status: version, layers, gateway matrix, milestone position" },
  { command: "report", family: "INSIGHT", usage: "report", summary: "a pure fold over every journal — runs, decisions, metering, evidence" },
  { command: "snapshot", family: "RECOVERY", usage: "snapshot [--out FILE] [--dry-run]", summary: "deterministic archive of the evidence state, pinned by its digest" },
  { command: "restore", family: "RECOVERY", usage: "restore FILE [--force] [--dry-run]", summary: "verify-then-restore an archive; refuses conflicts without --force" },
  { command: "clean", family: "MAINTENANCE", usage: "clean [--yes] [--dry-run]", summary: "reclaim orphaned blobs — plan-only by default; evidence-linked blobs never" },
  { command: "account", family: "IDENTITY & AI", usage: "account create --name NAME [--email E]", summary: "local-first identity: create, status, login, logout, export (optional by law)" },
  { command: "ai", family: "IDENTITY & AI", usage: "ai setup --provider P --model M [--set-default] [--dry-run]", summary: "the developer-owned AI layer: setup, status, use, remove — you bring the key" },
  { command: "serve", family: "DISTRIBUTE", usage: "serve [--port N] [--host ADDR]", summary: "the local API daemon: loopback HTTP/SSE over the same contracts" },
  { command: "package", family: "DISTRIBUTE", usage: "package build [--out PATH] [--dry-run]", summary: "reproducible .vxn bundles: build and verify (ADR-0016)" },
  { command: "provenance", family: "DISTRIBUTE", usage: "provenance ARTIFACT", summary: "permanent provenance for anything Vaerion created — digests from the bytes" },
  { command: "tour", family: "LEARN", usage: "tour", summary: "the guided tour: what Vaerion is and the nine commands that matter first" },
  { command: "version", family: "LEARN", usage: "version", summary: "the version contract: engine version, runtime, platform" },
  { command: "repo", family: "HEALTH", usage: "repo | repo verify", summary: "repository intelligence, measured never assumed: branch, HEAD, staged/unstaged/untracked, conflicts" },
  { command: "ci", family: "HEALTH", usage: "ci simulate --event EV [--ref NAME]", summary: "run the CI gate matrix locally — the same gates Actions will run" },
  { command: "release", family: "DISTRIBUTE", usage: "release readiness [--live-gates]", summary: "the constitutional release evaluator: can this repository ship? Which check blocks?" },
  { command: "center", family: "INSIGHT", usage: "center", summary: "the operator cockpit: runs, receipts, metering, audit + refusal-log integrity, release readiness digest" },
  { command: "help", family: "LEARN", usage: "help [COMMAND]", summary: "the help frames for COMMAND — help always teaches and never executes" },
  { command: "completions", family: "LEARN", usage: "completions <shell>", summary: "emit shell completions from the command registry of record (six shells)" },
] as const;
