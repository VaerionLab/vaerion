/**
 * Vaerion editor extension — run viewer (render-only, escape-everything).
 *
 * Law: the webview renders run records as HTML with EVERY interpolated
 * value HTML-escaped, a locked Content-Security-Policy (default-src 'none')
 * and no script tags anywhere. Unknown record shapes are counted, never
 * invented ("N not rendered"); known kinds render with their counts.
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Render a run's records into the webview HTML.
 * @param {string} runId
 * @param {ReadonlyArray<{ kind?: string; ts?: string; detail?: string }>} records
 * @param {{ verified?: boolean }} [opts]
 * @returns {string} the complete HTML document (no scripts, locked CSP)
 */
export function buildRunHtml(runId, records, opts = {}) {
  const list = Array.isArray(records) ? records : [];
  const rendered = list.filter((r) => r && typeof r.kind === "string");
  const notRendered = list.length - rendered.length;

  const counts = new Map();
  for (const record of rendered) counts.set(record.kind, (counts.get(record.kind) ?? 0) + 1);
  const legend = [...counts.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([kind, n]) => `${escapeHtml(kind)}×${n}`)
    .join(", ");

  const rows = rendered
    .map(
      (r) =>
        `<tr><td class="kind">${escapeHtml(r.kind)}</td><td class="ts">${escapeHtml(r.ts ?? "")}</td><td class="detail">${escapeHtml(
          r.detail ?? "",
        )}</td></tr>`,
    )
    .join("\n");

  const verifiedLine =
    opts && opts.verified === true ? `<p class="verified" id="verification">journal verified</p>` : `<p class="unverified" id="verification">journal not verified</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style: 'unsafe-inline'">
<title>Vaerion run ${escapeHtml(runId)}</title>
<style>
  body { font-family: ui-monospace, Menlo, Consolas, monospace; background: #0B0D10; color: #FAF9F6; margin: 1rem; }
  h1 { font-size: 1rem; color: #D4AF37; letter-spacing: 0.08em; }
  .verified { color: #22C55E; }
  .unverified { color: #C98A1F; }
  table { border-collapse: collapse; width: 100%; margin-top: 0.75rem; }
  td, th { border: 1px solid #232932; padding: 0.3rem 0.5rem; text-align: left; vertical-align: top; }
  th { color: #9C9CA6; font-weight: normal; }
  td.kind { color: #D4AF37; white-space: nowrap; }
  td.ts { color: #9C9CA6; white-space: nowrap; }
  td.detail { white-space: pre-wrap; word-break: break-word; }
  footer { margin-top: 0.75rem; color: #9C9CA6; font-size: 0.85rem; }
</style>
</head>
<body>
<h1>VAERION — run ${escapeHtml(runId)}</h1>
${verifiedLine}
<table>
<thead><tr><th>kind</th><th>ts</th><th>detail</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
<footer><span id="counts">${legend}</span> · <span id="skipped">${notRendered} not rendered</span> · evidence is rendered read-only, escaped end-to-end</footer>
</body>
</html>
`;
}
