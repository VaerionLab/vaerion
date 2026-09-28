/**
 * Vaerion — Primitives / The Primitive Contract Model
 *
 * Every primitive is defined by four clauses — Responsibility, Boundaries,
 * Extension, Composition — and carries citation metadata, registry token
 * references, state awareness, and an accessibility contract.
 *
 * Citations:
 * - Implementation Constitution 3.0 (the Primitive Contract; "No primitive
 *   may hold responsibility, boundary, or behavior assigned to another. The
 *   fifteen contracts below are binding."); 1.2 (components are
 *   manifestations; no primitive exists without a citation).
 * - Implementation Constitution 1.6 (primitives never fabricate or compute
 *   verdicts — honesty is an engineering property).
 * - Visual System §5 (primitive registrations).
 * - Constitution Part V (primitives render received state; no primitive owns
 *   state — 5.4).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';

/** The four binding clauses of every primitive (Constitution 3.0). */
export interface PrimitiveContract {
  /** The one thing the primitive owns. */
  readonly responsibility: string;
  /** What it must not do. */
  readonly boundaries: readonly string[];
  /** How it may grow. */
  readonly extension: string;
  /** How it combines with other primitives. */
  readonly composition: string;
}

/** Accessibility contract (Constitution 6.7–6.11; Bible Art. XIV). */
export interface AccessibilityContract {
  /** How the primitive announces itself and its state. */
  readonly announcement: string;
  /** Keyboard operation. */
  readonly keyboard: string;
  /** Visible focus / other sensory contracts. */
  readonly sensory: string;
}

/** The full conformance metadata for one primitive. */
export interface PrimitiveMetadata {
  /** Canonical primitive name as registered by the Visual System §5. */
  readonly name: string;
  /** Constitution contract clause reference (e.g. "3.1"). */
  readonly constitutionClause: string;
  /** Visual System registration section(s). */
  readonly visualSystemSections: readonly string[];
  /** The four binding clauses (3.0). */
  readonly contract: PrimitiveContract;
  /** Registry token identifiers the primitive consumes (2.7(c)). */
  readonly tokens: readonly string[];
  /** State awareness — which canonical states the primitive renders (Part V). */
  readonly states: readonly string[];
  /** Accessibility contract. */
  readonly accessibility: AccessibilityContract;
  /** Governing citations (P-4; 1.2). */
  readonly citations: readonly Citation[];
  /** Whether this is one of the fifteen bound contracts of Part III. */
  readonly bound: boolean;
}

/** Helper: construct metadata with the standing citations applied. */
export function definePrimitive(
  meta: PrimitiveMetadata,
): PrimitiveMetadata {
  const standing: Citation[] = [
    implementation(meta.constitutionClause, 'binding primitive contract'),
    implementation('1.2', 'a primitive exists only because a governing document requires it'),
    implementation('1.6', 'primitives render received state; they never compute or fabricate'),
    visualSystem('5', 'primitive registration'),
  ];
  return { ...meta, citations: [...meta.citations, ...standing] };
}

/** Verdict-domain state identifiers as received from the Verification Authority (5.1). */
export const VERDICT_STATES = ['verified', 'unverified', 'failed', 'pending'] as const;
export type VerdictState = (typeof VERDICT_STATES)[number];

/**
 * The fixed receipt anatomy (Bible Art. VI; Constitution 3.1). The sequence
 * is the identity of the receipt object across every variant and rendering
 * target. Order here is composition law (4.2) and is enforced mechanically by
 * tools/vaerion-pipeline/verify-primitives.ts.
 */
export const RECEIPT_ANATOMY = [
  'id strip',
  'claim',
  'subject',
  'verdict seal',
  'verification method',
  'evidence[]',
  'issued-at',
  'chain parent',
] as const;

/** Demo quarantine marking law (5.10): the flag travels with the record and renders wherever the record appears. */
export const DEMO_STAMP_WORD = 'DEMO';
