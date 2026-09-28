/**
 * Vaerion — Primitives / The Primitive Manifest
 *
 * The conformance registry of implemented primitives, each carrying its
 * four-clause contract, token bindings, state awareness, accessibility
 * contract, and citations (Constitution 3.0; P-4). The manifest is the
 * machine-readable input of tools/vaerion-pipeline/verify-primitives.ts.
 *
 * The fifteen bound contracts of Part III are marked `bound: true`. The
 * remaining Visual System §5 primitives are governed by identical contract
 * structure derived from their Visual System definitions (Constitution 3.0).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { AUDIT_TABLE_METADATA, LOG_METADATA, TIMELINE_METADATA } from './logsurfaces';
import { BUTTON_METADATA, FIELD_FRAME_METADATA, MICRO_LABEL_METADATA } from './controls';
import { CHAINLINE_METADATA, PANEL_METADATA } from './containers';
import { CRITERIA_BAR_METADATA } from './criteria';
import { DIALOG_METADATA, GAUGE_METADATA, RETURN_METADATA } from './feedback';
import { ENVIRONMENT_STAMP_METADATA, SPINE_METADATA } from './chrome';
import { EVIDENCE_ITEM_METADATA, HASH_LINE_METADATA, LEDGER_ROW_METADATA } from './records';
import { LENS_METADATA } from './lens';
import { RECEIPT_METADATA } from './receipt';
import { SEAL_METADATA } from './seal';
import { RECEIPT_ANATOMY, type PrimitiveMetadata } from './contract';

/**
 * The implemented primitive set. Order follows Constitution Part III, then
 * the remaining Visual System §5 primitives (Constitution 3.0).
 */
export const PRIMITIVE_MANIFEST: readonly PrimitiveMetadata[] = Object.freeze([
  SEAL_METADATA,
  RECEIPT_METADATA,
  PANEL_METADATA,
  CHAINLINE_METADATA,
  BUTTON_METADATA,
  FIELD_FRAME_METADATA,
  AUDIT_TABLE_METADATA,
  LOG_METADATA,
  TIMELINE_METADATA,
  ENVIRONMENT_STAMP_METADATA,
  SPINE_METADATA,
  DIALOG_METADATA,
  RETURN_METADATA,
  GAUGE_METADATA,
  LENS_METADATA,
  HASH_LINE_METADATA,
  EVIDENCE_ITEM_METADATA,
  LEDGER_ROW_METADATA,
  MICRO_LABEL_METADATA,
  CRITERIA_BAR_METADATA,
]);

/** The fifteen bound contract names (Constitution 3.0–3.15). */
export const BOUND_CONTRACT_NAMES = [
  'Receipt',
  'Panel',
  'Seal',
  'Chainline',
  'Button',
  'Input (Field Frame)',
  'Table (Audit Table)',
  'Log',
  'Timeline',
  'Environment Stamp',
  'Navigation (Spine)',
  'Dialog',
  'Toast (Return)',
  'Gauge',
  'Lens',
] as const;
