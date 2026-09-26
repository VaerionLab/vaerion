/**
 * Type declarations for the Vaerion editor protocol client (protocol.js).
 * The client is plain JS so editor hosts need no transpiler; this d.ts is
 * the typed mirror consumed by the engine's own tests and by editor
 * developers with type checking enabled.
 */

export interface CatalogEntryView {
  command: string;
  family: string;
  summary: string;
  usage: string;
}

export interface RunOk<T = unknown> {
  ok: true;
  data: T;
  /** Honest partials: some verbs (doctor) complete AND exit nonzero. */
  exit?: number;
}

export interface RunFail {
  ok: false;
  kind: "cli-missing" | "spawn-failed" | "timeout" | "contract" | "cli-error" | "unknown";
  code?: string;
  exit?: number;
  message: string;
  fix: string;
}

export type RunResult<T = unknown> = RunOk<T> | RunFail;

export function buildArgs(args: string[], opts?: { cwd?: string }): string[];

export function parseNdjson(text: string): Record<string, unknown>[];

export function runJson<T = Record<string, unknown> | Record<string, unknown>[]>(
  cliPath: string,
  args: string[],
  opts?: { cwd?: string; timeoutMs?: number; env?: Record<string, string | undefined> },
): Promise<RunResult<T>>;

export interface DiagnosticView {
  code: string;
  message: string;
  severity: "warning" | "error" | "info";
  source: string;
  check?: string;
}

export function diagnosticsFromDoctor(json: unknown): DiagnosticView[];

export function statusSummary(json: unknown): { text: string; tooltip: string };

export interface RunRow {
  id: string;
  records?: number;
  bytes?: number;
  head?: string;
}

export function runsFromJournal(json: unknown): RunRow[];

export function catalogFromWelcome(json: unknown): CatalogEntryView[];

export function reportHighlights(json: unknown): string[];
