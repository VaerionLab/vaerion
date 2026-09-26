/**
 * VAERION PIPELINE — vaerion:stages
 *
 * Prints the stage manifest, evaluates the dependency-graph gate for every
 * stage mechanically, and names the current work front. Deterministic
 * governance tooling (not product code, not test code — see IR-002).
 *
 * Citations: Volume IV directive BUILD ORDER + Amendments F-005/F-007;
 * Implementation Constitution P-4, Part X.
 */

import {
  assertDependencyGraphIntegrity,
  dependencyGraph,
  formatGateReport,
  evaluateStageGate,
} from '../../src/vaerion/foundation/gate';
import { currentStage, STAGES, type StageId } from '../../src/vaerion/foundation/stages';
import {
  diskPrerequisiteResolver,
  verifyAllPrerequisites,
} from '../../src/vaerion/foundation/verification';

const resolver = diskPrerequisiteResolver();

assertDependencyGraphIntegrity();

const { nodes, edges } = dependencyGraph();

console.log('VAERION PIPELINE — STAGE MANIFEST (Volume IV build order)');
console.log('');
console.log('GRAPH:');
for (const stage of nodes) {
  const deps = stage.dependsOn.length
    ? stage.dependsOn.map((d) => `stage ${d}`).join(', ')
    : '(none — entry stage)';
  const prereqs = stage.constitutionalPrerequisites.length
    ? stage.constitutionalPrerequisites.join(', ')
    : '(none)';
  console.log(
    `  stage ${String(stage.id).padStart(2)} [${stage.status.padEnd(10)}] ${stage.name} — depends on: ${deps}; prerequisites: ${prereqs}`,
  );
}
console.log(`  edges: ${edges.map((e) => `${e.from}->${e.to}`).join(' ') || '(none)'}`);
console.log('');

const proofs = verifyAllPrerequisites();
console.log('CONSTITUTIONAL PREREQUISITE PROOFS:');
for (const [id, proof] of Object.entries(proofs)) {
  console.log(`  [${proof.satisfied ? 'PASS' : 'FAIL'}] ${id} — ${proof.evidence}`);
}
console.log('');

console.log('STAGE GATES (would this stage be allowed to begin now?):');
let exit = 0;
for (const stage of STAGES) {
  const report = evaluateStageGate(stage.id as StageId, resolver);
  console.log(formatGateReport(report));
  console.log('');
  if (!report.mayBegin && stage.status !== 'pending') exit = 1;
}

const front = currentStage();
console.log(`CURRENT WORK FRONT: stage ${front ? `${front.id} — ${front.name}` : 'none (all stages conformant)'}`);
console.log('Build order enforcement: a stage whose prerequisites are unmet terminates immediately with a ConstitutionalViolationError (Amendment F-007).');

if (exit !== 0) {
  console.error('CONSTITUTIONAL VIOLATION: a non-pending stage failed its gate.');
  process.exit(1);
}
