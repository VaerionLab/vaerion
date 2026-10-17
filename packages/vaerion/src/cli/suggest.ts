/**
 * Vaerion CLI — command suggestion (Phase 59.1 DX).
 *
 * The did-you-mean engine: when an unknown command arrives, the nearest
 * ratified command (by Levenshtein edit distance) is suggested inside the
 * E1600 message — the ONE renderer carries it in plain and NDJSON modes
 * alike. Deterministic by law: ties break to the FIRST lowest-distance
 * command in catalog order, so the same typo always yields the same hint.
 *
 * Pure module — no imports, unit-pinned by tests/unit/cli-suggest.test.ts.
 */

/** Levenshtein edit distance with an early-exit ceiling (`cap`). */
export function editDistance(a: string, b: string, cap = Number.POSITIVE_INFINITY): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const width = b.length;
  let prev = new Array<number>(width + 1);
  let curr = new Array<number>(width + 1);
  for (let j = 0; j <= width; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = curr[0] as number;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= width; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
      if (curr[j]! < rowMin) rowMin = curr[j]!;
    }
    if (rowMin > cap) return cap + 1; // early exit — already too far
    const swap = prev;
    prev = curr;
    curr = swap;
  }
  return prev[width]!;
}

/**
 * The nearest command within `maxDistance` edits, or null.
 * `commands` order defines tie-breaking (catalog order — deterministic).
 */
export function suggestCommand(input: string, commands: readonly string[], maxDistance = 2): string | null {
  const q = input.toLowerCase();
  if (q.length === 0) return null;
  let best: string | null = null;
  let bestDist = maxDistance + 1;
  for (const c of commands) {
    const d = editDistance(q, c.toLowerCase(), bestDist);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return bestDist <= maxDistance ? best : null;
}
