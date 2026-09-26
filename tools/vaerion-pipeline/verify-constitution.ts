/**
 * VAERION PIPELINE — vaerion:verify-constitution
 *
 * Recomputes the SHA-256 digest of every pinned canonical document and
 * compares it to the Snapshot Authority manifest. Proves that the repository
 * transcriptions are identical to the ratified originals (Foundation Amendment
 * F-001). Deterministic governance tooling (not product code, not test code —
 * see IR-002).
 *
 * Citations: F-001, F-002; Implementation Constitution P-6, 9.1, 11.2–11.3.
 */

import { verifyConstitution } from '../../src/vaerion/foundation/verification';

console.log('VAERION PIPELINE — CONSTITUTION VERIFICATION (Snapshot Authority)');
console.log('');

const { ok, lines } = verifyConstitution();
for (const line of lines) console.log(line);
console.log('');

if (!ok) {
  console.error(
    'CONSTITUTIONAL VIOLATION (F-001/SNAPSHOT): a canonical document diverged from its pinned digest. Changes require the amendment pathway (Constitution 11.2–11.3).',
  );
  process.exit(1);
}

console.log('All pinned canonical documents are identical to their ratified digests.');
