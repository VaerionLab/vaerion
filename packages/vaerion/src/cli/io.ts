/**
 * Vaerion CLI — I/O ports and exit codes.
 *
 * Five Guarantees (constitution D-N): honest exit codes are law.
 * 0 ok · 2 usage · 3 broker-denied · 4 provider-down · 5 partial-with-repair-hint.
 */

export interface CliIo {
  out(line: string): void;
  err(line: string): void;
  /** Unbuffered single-line write (TTY progress only; absent in tests/pipes). */
  raw?(s: string): void;
  /** Whether stdout is an interactive terminal (rich rendering gate). */
  tty?: boolean;
  columns?: number;
  /** One input line, or null at EOF (the interactive wizard's port).
   *  Provided only for real terminals and scripted tests; absent elsewhere. */
  input?: () => Promise<string | null>;
}

export const ExitCode = {
  ok: 0,
  internal: 1,
  usage: 2,
  brokerDenied: 3,
  providerDown: 4,
  partial: 5,
} as const;

export type OutputMode = "json" | "plain";
