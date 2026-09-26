/**
 * Type declarations for the Vaerion editor run viewer (view.js).
 * Render-only, escape-everything; the webview has no scripts and a
 * locked CSP. Unknown record shapes are counted, never invented.
 */

export interface RunRecord {
  kind?: string;
  ts?: string;
  detail?: string;
  /** Unknown record shapes are lawful input — they are counted, never invented. */
  [key: string]: unknown;
}

export interface BuildRunHtmlOptions {
  /** Whether the journal verified at read time (drives the banner). */
  verified?: boolean;
}

/**
 * Render a run's records into the complete webview HTML document.
 * Every interpolated value is HTML-escaped; the document carries
 * `default-src 'none'` and contains no script tags, ever.
 */
export declare function buildRunHtml(
  runId: string,
  records: ReadonlyArray<RunRecord>,
  opts?: BuildRunHtmlOptions,
): string;
