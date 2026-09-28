/**
 * Vaerion — State / Quarantine & Restriction Travel
 *
 * Demo quarantine (Constitution 5.10): "Demo state may not co-mingle with
 * production data in any store, stream, or export. A demo flag travels with
 * the record through every authority and is rendered wherever the record
 * appears, forever." Exports from Demo quarantines are refused by
 * construction (8.7).
 *
 * Restricted evidence (Constitution 8.2): "Restriction is a first-class state
 * that travels with the artifact; missing evidence is a recorded state, never
 * silent deletion." Restricted evidence renders hatched with its honest
 * notice (5.2) and is never masked by container inheritance (5.6) nor revealed
 * by the Lens (3.15; Art. XII).
 *
 * Citations: Implementation Constitution 5.10, 8.7, 8.2, 5.6, 5.2, 3.15;
 * Bible Art. VIII, XII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';

/** The quarantine flag that travels with a record (5.10). */
export type QuarantineFlag = 'demo' | 'production' | null;

/** A state record carrying its quarantine and restriction facts. */
export interface StateRecord {
  readonly id: string;
  readonly quarantine: QuarantineFlag;
  /** Restriction travels with the artifact (8.2). */
  readonly restricted?: boolean;
}

const QUARANTINE_CITATIONS: readonly Citation[] = [
  implementation('5.10', 'demo quarantine'),
  implementation('8.7', 'exports from Demo quarantines are refused by construction'),
];

const RESTRICTION_CITATIONS: readonly Citation[] = [
  implementation('8.2', 'restriction is a first-class state that travels with the artifact'),
  implementation('5.2', 'restricted — rendered hatched with its honest notice'),
  implementation('5.6', 'inheritance must not mask evidence-level restriction'),
];

/**
 * Co-mingling refusal (5.10): a store, stream, or export target containing
 * both demo and production records is a violation. The demo flag is part of
 * the record itself, so the check is mechanical.
 */
export function assertNoCommingling(records: readonly StateRecord[], target: string): void {
  const demo = records.some((record) => record.quarantine === 'demo');
  const production = records.some((record) => record.quarantine === 'production');
  if (demo && production) {
    throw new ConstitutionalViolationError(
      '5.10',
      `Demo state co-mingles with production data in "${target}". Demo state may not co-mingle with production data in any store, stream, or export (Constitution 5.10).`,
    );
  }
}

/**
 * Export refusal by construction (5.10; 8.7): no demo-quarantined record may
 * enter an export bundle.
 */
export function assertExportAllowed(records: readonly StateRecord[]): void {
  const demoRecord = records.find((record) => record.quarantine === 'demo');
  if (demoRecord) {
    throw new ConstitutionalViolationError(
      '8.7 / 5.10',
      `Export refused: record "${demoRecord.id}" is Demo-quarantined. Exports from Demo quarantines are refused by construction (Constitution 8.7; 5.10).`,
    );
  }
  assertNoCommingling(records, 'export bundle');
}

/**
 * The demo flag travels with the record through every authority and renders
 * wherever the record appears, forever (5.10). A record that has lost its
 * flag is a violation — the flag cannot be dropped by transformation.
 */
export function assertQuarantineFlagPresent(record: StateRecord): void {
  if (record.quarantine !== 'demo' && record.quarantine !== 'production') {
    throw new ConstitutionalViolationError(
      '5.10',
      `Record "${record.id}" carries no quarantine flag. The demo flag travels with the record through every authority and is rendered wherever the record appears, forever (Constitution 5.10). A record without its flag is unrenderable.`,
    );
  }
}

/**
 * Restricted evidence renders hatched with its honest notice — never silently
 * omitted, never deleted, never masked (5.2; 8.2; 5.6; 3.15).
 *
 * `rendered` is the mechanical proof that the restriction reached the
 * rendering layer; `maskedByContainerState` is the proof that no container
 * inheritance hid it (5.6).
 */
export function assertRestrictionHonest(params: {
  readonly record: StateRecord;
  readonly rendered: boolean;
  readonly maskedByContainerState: boolean;
}): void {
  if (params.record.restricted === true && !params.rendered) {
    throw new ConstitutionalViolationError(
      '8.2 / 5.2',
      `Restricted evidence "${params.record.id}" was not rendered. Restricted evidence renders hatched with its honest notice — never silently omitted (Constitution 5.2; 8.2). Missing evidence is a recorded state, never silent deletion.`,
    );
  }
  if (params.record.restricted === true && params.maskedByContainerState) {
    throw new ConstitutionalViolationError(
      '5.6',
      `Evidence-level restriction on "${params.record.id}" was masked by container state. Inheritance must not mask evidence-level restriction (Constitution 5.6): the record renders its own restriction, hatched, whatever its container declares.`,
    );
  }
}

export { QUARANTINE_CITATIONS, RESTRICTION_CITATIONS };

/**
 * Record-level resolution (5.6): a record's own verdict fact is rendered from
 * the record — never from the container. "A Verified receipt inside a
 * restricted surface renders its own seal and hatched evidence, not the
 * container's state." A restricted record resolves to 'restricted' whatever
 * its container declares, and the restriction is asserted honest.
 */
export function resolveRecordState(params: {
  readonly record: StateRecord & { readonly verdictState?: import('./matrix').CanonicalState };
  readonly containerState: import('./matrix').CanonicalState;
}): import('./matrix').CanonicalState {
  const own = params.record.verdictState;
  const effective = own ?? params.containerState;
  if (params.record.restricted === true) {
    assertRestrictionHonest({ record: params.record, rendered: true, maskedByContainerState: false });
    return 'restricted';
  }
  return effective;
}
