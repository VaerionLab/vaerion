/**
 * Vaerion — Foundation / Constitutional Prerequisite Registry
 *
 * Declares every constitutional prerequisite a stage may depend on, together
 * with the mechanical proof obligation that establishes its completion. This
 * module is pure data; the fs-based proofs live in foundation/verification.ts
 * (Node tooling) and the gate evaluation lives in foundation/gate.ts.
 *
 * Citations:
 * - Volume IV directive, "Amendment F-007 — Stage Dependency Graph": "Every
 *   stage must explicitly declare: required predecessor stages, constitutional
 *   prerequisites, completion conditions. A stage whose prerequisites are
 *   unmet must terminate immediately with a Constitutional Violation."
 * - Implementation Constitution P-4 (every declaration carries citations),
 *   P-5 (unresolved authority is declared, never improvised), Part IX
 *   (gate discipline precedent: mechanical, pass or fail).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { cite, implementation, visualSystem, type Citation } from './citations';

/** How a prerequisite's completion is mechanically proven. */
export type PrerequisiteProofKind =
  /** Digest-verified transcription of a ratified document (Snapshot Authority manifest). */
  | 'document-transcription'
  /** Established authority structure on disk (existence + content markers). */
  | 'authority-structure'
  /** Structural/behavioral proof executed in code (graph integrity, ledger status). */
  | 'structural'
  /** Ratification status parsed from a governance ledger. */
  | 'governance-status';

export interface StagePrerequisite {
  /** Stable id, e.g. "DP-1", "F-004", "IR-002-RATIFIED". Cited by stages. */
  readonly id: string;
  /** Human-readable label used by gate reports and documentation. */
  readonly label: string;
  /** What completion means, precisely. */
  readonly description: string;
  /** The mechanical proof obligation that establishes completion. */
  readonly proof: PrerequisiteProofKind;
  /** Constitutional citations governing this prerequisite. */
  readonly citations: readonly Citation[];
}

/**
 * The complete prerequisite registry. Amendment F-001..F-007 are recorded as
 * ratified Foundation Amendments (constitution/amendments/LEDGER.md); their
 * completion is proven mechanically, never asserted narratively.
 */
export const PREREQUISITES: readonly StagePrerequisite[] = Object.freeze([
  {
    id: 'DP-1',
    label: 'Design Bible transcribed and pinned',
    description:
      'VAERION_DESIGN_BIBLE_v1.0 is transcribed verbatim into constitution/bible/ and its digest is pinned in the Snapshot Authority manifest.',
    proof: 'document-transcription',
    citations: [
      cite('BIBLE', 'Ratification', 'repository transcription discipline'),
      cite(
        'IMPLEMENTATION_CONSTITUTION',
        'P-6',
        'fidelity standard: canonical text must be identical across teams',
      ),
      implementation('F-001', 'canonical authority completion (amendments ledger)'),
    ],
  },
  {
    id: 'DP-2',
    label: 'Visual System transcribed and pinned',
    description:
      'VAERION_VISUAL_SYSTEM_v1.0.1 is transcribed verbatim into constitution/visual-system/ and its digest is pinned in the Snapshot Authority manifest. Value source for the Registry (Constitution 2.1).',
    proof: 'document-transcription',
    citations: [
      visualSystem('4.7', 'ratified reference values are the sole color source'),
      implementation('2.1', 'the Registry compiles from the ratified text'),
      implementation('F-001', 'canonical authority completion (amendments ledger)'),
    ],
  },
  {
    id: 'F-001',
    label: 'Canonical authority completion',
    description:
      'Both ratified documents (Bible v1.0, Visual System v1.0.1) are transcribed verbatim into the constitutional authority tree and proven identical to the ratified originals via pinned digests.',
    proof: 'document-transcription',
    citations: [
      implementation('F-001', 'mandatory Foundation Amendment'),
      implementation('P-6', 'verification must prove identity with the ratified originals'),
    ],
  },
  {
    id: 'F-002',
    label: 'Snapshot Authority established',
    description:
      'constitution/snapshot-authority/ exists with README.md, snapshots/, and manifests/; the canonical-documents manifest is present and parses.',
    proof: 'authority-structure',
    citations: [
      implementation('F-002', 'mandatory Foundation Amendment'),
      implementation('P-6', 'snapshot authority as fidelity canon'),
      implementation('9.3', 'visual gate compares against the ratified canon'),
    ],
  },
  {
    id: 'F-003',
    label: 'Announcement & Copy Registry authority established',
    description:
      'constitution/announcement-registry/ exists with its governing README. No strings are ratified yet; the authority must exist before Stage 6 announces anything.',
    proof: 'authority-structure',
    citations: [
      implementation('F-003', 'mandatory Foundation Amendment'),
      implementation('6.11', 'Announcement and Copy Registry — implementation necessity'),
    ],
  },
  {
    id: 'F-004',
    label: 'Registry authority separation',
    description:
      'Constitutional registry law lives at constitution/registry/; implementation lives at src/vaerion/registry/. Both exist; neither replaces the other.',
    proof: 'authority-structure',
    citations: [
      implementation('F-004', 'mandatory Foundation Amendment'),
      implementation('Part II', 'the constitutional registry defines law; the implementation executes law'),
    ],
  },
  {
    id: 'F-005',
    label: 'Generated artifact root established',
    description:
      'generated/bindings/ and generated/tokens/ exist under the generated-artifact law (generated/README.md); artifacts are never hand-authored.',
    proof: 'authority-structure',
    citations: [
      implementation('F-005', 'mandatory Foundation Amendment'),
      implementation('2.7', 'generated bindings are produced, never authored'),
    ],
  },
  {
    id: 'F-006',
    label: 'Release record authority established',
    description:
      'constitution/releases/ exists as the home of Release Receipts; build outputs are excluded by law.',
    proof: 'authority-structure',
    citations: [
      implementation('F-006', 'mandatory Foundation Amendment'),
      implementation('10.3', 'every release produces its own receipt'),
      implementation('10.4', 'append-only release chain'),
    ],
  },
  {
    id: 'F-007',
    label: 'Stage dependency graph operational',
    description:
      'The stage manifest declares predecessors, constitutional prerequisites, and completion conditions for every stage; the graph passes structural integrity (acyclic, ordered, skip-impossible) and its documentation exists.',
    proof: 'structural',
    citations: [
      implementation('F-007', 'mandatory Foundation Amendment'),
      implementation('Part X', 'stage discipline precedent'),
    ],
  },
  {
    id: 'AUTH-ANNOUNCEMENT',
    label: 'Announcement authority present (F-003 evidence)',
    description:
      'Standing evidence for any stage that announces copy: the Announcement & Copy Registry authority exists.',
    proof: 'authority-structure',
    citations: [implementation('6.11'), implementation('F-003')],
  },
  {
    id: 'AUTH-SNAPSHOT',
    label: 'Snapshot authority present (F-002 evidence)',
    description:
      'Standing evidence for any stage that captures or compares renderings: the Snapshot Authority exists.',
    proof: 'authority-structure',
    citations: [implementation('P-6'), implementation('9.3'), implementation('F-002')],
  },
  {
    id: 'AUTH-RELEASE',
    label: 'Release record authority present (F-006 evidence)',
    description:
      'Standing evidence for any stage that issues releases: the release record authority exists.',
    proof: 'authority-structure',
    citations: [implementation('10.3'), implementation('10.4'), implementation('F-006')],
  },
  {
    id: 'IR-002-RATIFIED',
    label: 'IR-002 ratified (gate implementation authority)',
    description:
      'The standing interpretation that constitutional gates are implemented as conformance tooling is ratified by the Founder. Currently PROPOSED — the proof fails until the ledger records RATIFIED.',
    proof: 'governance-status',
    citations: [
      implementation('Part IX', 'gates are executable conformance checks'),
      implementation('P-5', 'unresolved interpretations block dependent work'),
    ],
  },
]);

/** Returns a prerequisite by id, or throws — unknown prerequisites are never improvised. */
export function getPrerequisite(id: string): StagePrerequisite {
  const prerequisite = PREREQUISITES.find((p) => p.id === id);
  if (!prerequisite) {
    throw new Error(
      `[PREREQUISITE REGISTRY] Unknown prerequisite "${id}". Declared prerequisites only: ${PREREQUISITES.map((p) => p.id).join(', ')}.`,
    );
  }
  return prerequisite;
}
