/**
 * Vaerion — Surfaces / Copy Module (Announcement & Copy Registry consumption)
 *
 * LAW (Constitution 4.7, 6.11; Foundation Amendment F-003): page titles,
 * empty states, and guidance draw wording from the shared copy authority;
 * no string is invented at render time — strings are consumed from the
 * registry by identifier.
 *
 * The Announcement & Copy Registry (constitution/announcement-registry/)
 * had no ratified strings when Stage 4 was ordered. The minimal string set
 * the ordered surfaces require is therefore REGISTERED here, submitted as
 * IR-009 (PROPOSED — inert until the Founder ratifies), and consumed by
 * identifier only. Every entry declares its voice (Bible Art. VII) and
 * honesty constraints (Art. VIII) are binding: nothing overstates, softens,
 * or promises.
 *
 * Strings that are constitutional vocabulary (verdict words, anatomy field
 * names, territory names, state words, stamp words) are law-sourced and not
 * entries of this module — they live in the primitives that render them.
 */

export type Voice = 'machine' | 'human';

export interface CopyEntry {
  readonly id: string;
  readonly voice: Voice;
  readonly text: string;
  /** Accessibility form — the announced text, when it differs (6.11). */
  readonly announcedAs?: string;
  /** IR-009 proposal status — every string here is PROPOSED, not ratified. */
  readonly status: 'proposed (IR-009)';
}

/**
 * The four verdict explainers — mandated by Bible Art. XIII ("Teach the
 * States"): every verdict state carries, on first encounter and on demand
 * forever, a one-line plain-language explainer. Wording proposed in IR-009.
 */
export const VERDICT_EXPLAINERS: Readonly<Record<'verified' | 'unverified' | 'failed' | 'pending', CopyEntry>> = {
  verified: {
    id: 'explainer.verified',
    voice: 'human',
    text: 'A named verifier checked this claim against a named rule set, and the check holds.',
    status: 'proposed (IR-009)',
  },
  unverified: {
    id: 'explainer.unverified',
    voice: 'human',
    text: 'No verification has been performed yet. This is not an error — it is the honest default.',
    status: 'proposed (IR-009)',
  },
  failed: {
    id: 'explainer.failed',
    voice: 'human',
    text: 'A named verifier checked this claim and it did not hold. A failed measurement, not an accusation.',
    status: 'proposed (IR-009)',
  },
  pending: {
    id: 'explainer.pending',
    voice: 'human',
    text: 'Verification is in flight. The result will be shown when an authority returns it — never before.',
    status: 'proposed (IR-009)',
  },
} as const;

/** Surface copy, consumed by identifier (4.7; F-003). */
export const SURFACE_COPY = {
  demoQuarantine: {
    id: 'notice.demoQuarantine',
    voice: 'machine',
    text: 'DEMO QUARANTINE — demonstration records only; no authority is bound at this stage; exports disabled',
    status: 'proposed (IR-009)',
  },
  emptyLedger: {
    id: 'empty.ledger',
    voice: 'human',
    text: 'No records match the current criteria. Narrow the formula above, or wait for appends.',
    status: 'proposed (IR-009)',
  },
  emptyQueue: {
    id: 'empty.queue',
    voice: 'human',
    text: 'The queue is empty. Lawful absence — nothing is awaiting verification.',
    status: 'proposed (IR-009)',
  },
  searchInstruction: {
    id: 'guidance.search',
    voice: 'human',
    text: 'Paste a receipt id or hash. Identifiers resolve first — hash-first resolution, per the Caliper grammar.',
    status: 'proposed (IR-009)',
  },
  lensInstruction: {
    id: 'guidance.lens',
    voice: 'human',
    text: 'Press and hold any claim — or focus it and press L — and its evidence chain lights up. The Lens adds light, never access.',
    status: 'proposed (IR-009)',
  },
  verificationDecision: {
    id: 'guidance.verification',
    voice: 'human',
    text: 'Select a record with J / K. Verify with V, review with R, inspect evidence with E. Every decision issues a receipt.',
    status: 'proposed (IR-009)',
  },
  fourQuestions: {
    id: 'status.fourQuestions',
    voice: 'machine',
    text: 'WHAT ENGINE · WHAT RULES · WHAT ENVIRONMENT · WHAT GATES · WHAT CHAIN HEALTH',
    status: 'proposed (IR-009)',
  },
} as const;

/** Resolves a copy entry by identifier — no render-time composition (F-003). */
export function copy(id: string): CopyEntry {
  const pool: CopyEntry[] = [
    ...Object.values(VERDICT_EXPLAINERS),
    ...Object.values(SURFACE_COPY),
  ];
  const entry = pool.find((e) => e.id === id);
  if (!entry) {
    throw new Error(
      `[COPY · F-003] Unregistered copy id "${id}". Strings are consumed from the registry by identifier; composing copy on the fly is a violation.`,
    );
  }
  return entry;
}
