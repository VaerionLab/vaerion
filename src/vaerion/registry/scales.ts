/**
 * Vaerion — Registry / Ratified Scales
 *
 * The ratified scale data, transcribed from the digest-pinned Visual System
 * text (constitution/visual-system/VAERION_VISUAL_SYSTEM_v1.0.1.md). These
 * constants are the mechanical reference against which scale membership is
 * validated (Constitution 2.6(a)) and from which the Registry compiles values
 * (Constitution 2.1 — the ratified text is the sole value source).
 *
 * Where the ratified text registers a value, that value appears here with its
 * citation. Where the ratified text registers a scale but not its numbers, the
 * absence is recorded — no number is invented (Bible Art. XI; P-5; see the
 * IR references below).
 *
 * Citations per constant; master citations: Visual System §0, §1.2, §2.1–§2.2,
 * §3.2–§3.5, §4.1–§4.7, §5, §7.1–§7.2, §8, §9, §10, §13.2; Constitution 2.6.
 *
 * No visual values originate in this file — only transcriptions of ratified
 * values. Citation: Constitution 1.3, 2.1.
 */

import { bible, implementation, visualSystem } from '../foundation/citations';

/** Visual System §1.2 — the ratified Gauge Ladder ramp (twelve ratified values). */
export const GAUGE_LADDER_PX = [0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

/**
 * Visual System §1.2 — the ratified enumeration "space.0–space.10".
 * IR-004 (transcription ambiguity): eleven indices, twelve values. Options A
 * and B AGREE on space.0–space.10 → 0/2/4/8/12/16/24/32/48/64/96; they diverge
 * only on whether 128 px is issued as space.11. Per IR-004, Stage 2 compiles
 * only the agreed range; the 128 px ramp value remains ratified-but-unindexed
 * and enters the Registry only by Founder ruling. Visual System §1.3 itself
 * binds space.7 = 32 px (seal isolation) and space.9 = 64 px (ceremony),
 * corroborating the sequential mapping within the agreed range.
 */
export const INDEXED_SPACE_RANGE = 10 as const;

/** Visual System §3.2 — the ratified Radius Ladder with registered roles. */
export const RADIUS_LADDER = [
  { value: 0, role: 'structural containers, panels, table frames' },
  { value: 2, role: 'hairline cards, inputs, small frames' },
  { value: 4, role: 'interactive controls (buttons, fields, toasts)' },
  { value: 8, role: 'large ceremony surfaces (Receipt Viewer, Lens)' },
  { value: 'seal', role: 'fully round — reserved exclusively to verdict seals and pulse dots' },
] as const;

/** Visual System §5.2 — the registered verdict seal sizes (also icon pair sizes, §8). */
export const SEAL_SIZES_PX = [16, 20, 28, 44] as const;

/** Visual System §3.4 — the ratified layer system (name → ordinal, in order). */
export const LAYER_SYSTEM = [
  { name: 'ground', ordinal: 0 },
  { name: 'surface', ordinal: 1 },
  { name: 'sticky', ordinal: 2 },
  { name: 'veil', ordinal: 3 },
  { name: 'floating', ordinal: 4 },
  { name: 'ceremony', ordinal: 5 },
  { name: 'lens', ordinal: 6 },
] as const;

/** Visual System §7.2 — the ratified motion bound and settle-out curve. */
export const MOTION_MAX_DURATION_MS = 400;
export const MOTION_CURVE_SETTLE_OUT = 'cubic-bezier(0.2, 0, 0, 1)';

/** Visual System §5 Gauge / §10 — the Gauge renders after 300 ms of expected wait. */
export const GAUGE_DELAY_MS = 300;

/** Visual System §5 Return / §10 — the registered Return life. */
export const RETURN_LIFE_SECONDS = 6;

/** Visual System §13.2 — hold-to-affirm binds to a 600 ms hold. */
export const HOLD_AFFIRM_MS = 600;

/** Visual System §10 — intentional-action acknowledgment bound (< 100 ms). */
export const ACKNOWLEDGMENT_MS = 100;

/** Visual System §3.3 — hairlines are 1 px at registered ink strengths ink.16 / ink.32. */
export const HAIRLINE_WIDTH_PX = 1;

/** Visual System §3.5 — the Chainline: 1 px ink.32 line, 2 px square nodes, 8 px break gap. */
export const CHAINLINE_WIDTH_PX = 1;
export const CHAINLINE_NODE_PX = 2;
export const CHAINLINE_BREAK_GAP_PX = 8;

/** Visual System §5 Ledger Row — the fixed ledger rhythm: 36 px row height. */
export const LEDGER_ROW_HEIGHT_PX = 36;

/** Visual System §1.4 — the Margin Rail width on ultra-wide Document surfaces. */
export const MARGIN_RAIL_WIDTH_PX = 320;

/** Visual System §9 — touch targets meet the registered 44 px minimum. */
export const TOUCH_TARGET_MINIMUM_PX = 44;

/** Visual System §4.1/§4.7 — the two chamber grounds. */
export const GROUND_LIGHT = '#F5F4F0';
export const GROUND_DARK = '#141312';

/** Visual System §2.1 — the two registered voices with families and line heights. */
export const MACHINE_VOICE_FAMILY = 'Berkeley Mono';
export const MACHINE_VOICE_FALLBACK = 'Spline Sans Mono';
export const MACHINE_VOICE_LINE_HEIGHT = 1.45;
export const HUMAN_VOICE_FAMILY = 'Instrument Sans';
export const HUMAN_VOICE_FALLBACK = 'Söhne';
export const HUMAN_VOICE_LINE_HEIGHT = 1.55;

/**
 * Citations for the transcription set above — used by the registry records
 * that materialize them. Kept here so every scale constant has a citation
 * origin (P-4).
 */
export const SCALE_CITATIONS = {
  gaugeLadder: [visualSystem('1.2', 'the Gauge Ladder — the ratified spacing ramp'), visualSystem('1.3', 'ceremonial distances corroborate the sequential mapping (space.7 = 32 px, space.9 = 64 px)')],
  radiusLadder: [visualSystem('3.2', 'the Radius Ladder and registered roles')],
  sealSizes: [visualSystem('5.2', 'registered seal sizes 16 / 20 / 28 / 44'), bible('III', 'seal geometry carries verdict identity')],
  layerSystem: [visualSystem('3.4', 'the layer system; shadows and glass prohibited')],
  motion: [visualSystem('7.2', 'motion law: 400 ms bound; settle-out curve'), visualSystem('7.1', 'exactly three canonical motions')],
  gaugeDelay: [visualSystem('5', 'Gauge — renders after 300 ms'), visualSystem('10', 'latency contract')],
  returnLife: [visualSystem('5', 'Return — 6 s registered life'), visualSystem('10', 'Returns live 6 s')],
  holdAffirm: [visualSystem('13.2', 'hold-to-affirm — 600 ms hold')],
  acknowledgment: [visualSystem('10', '< 100 ms acknowledgment')],
  hairline: [visualSystem('3.3', '1 px hairlines at registered ink strengths')],
  chainline: [visualSystem('3.5', 'the Chainline geometry'), bible('IX', 'chain is walkable')],
  ledgerRow: [visualSystem('5', 'Ledger Row — fixed 36 px rhythm'), bible('X', 'the sliced ledger keeps a stable physical act')],
  marginRail: [visualSystem('1.4', 'the Margin Rail — 320 px on ultra-wide')],
  touchTarget: [visualSystem('9', 'touch targets meet registered minimums (44 px)')],
  grounds: [visualSystem('4.2', 'Paper and Graphite grounds'), visualSystem('4.7', 'reference value tables')],
  voices: [visualSystem('2.1', 'the two voices — families and line heights')],
  ir004: [implementation('P-5', 'silence rule — index assignment beyond the agreed range awaits Founder ruling')],
} as const;
