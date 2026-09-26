/**
 * VAERION PIPELINE — publish-documentation (Stage 11, Deliverable 7 support)
 *
 *   bun run vaerion:publish-docs
 *
 * Generates the five published artifacts of the knowledge organ into
 * src/vaerion/docs/generated/ — exclusively from constitutional sources
 * (the trace index, the canonical Registry, the stage manifest, the
 * implementation exports, the organ itself). Generated documentation is
 * never hand-edited (F-005 discipline; GOVERNANCE.md §1.4); drift fails
 * `bun run vaerion:verify-documentation` (Constitution 9.1).
 *
 * Citations: Stage 11 execution order Deliverable 7; docs contract
 * src/vaerion/docs/README.md §3; Constitution P-4, 2.7, 9.1; F-005.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { GENERATED_DOCS_DIR, buildPublishedArtifacts } from './docs-shared';

mkdirSync(GENERATED_DOCS_DIR, { recursive: true });
for (const artifact of buildPublishedArtifacts()) {
  writeFileSync(join(GENERATED_DOCS_DIR, artifact.name), artifact.content, 'utf8');
  console.log(`  published: src/vaerion/docs/generated/${artifact.name} (${artifact.content.length} bytes)`);
}
console.log('');
console.log('PUBLISH-DOCUMENTATION: complete — 5 artifacts (generated, never hand-edited; F-005).');
