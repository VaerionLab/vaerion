'use client';

/**
 * Vaerion — Primitive / The Proof Lens
 *
 * Contract (Constitution 3.15 [VS §12; Bible Art. IX, XII]):
 * - Responsibility: evidence x-ray — a global interaction that dims the world
 *   to fog and re-renders the evidence chain at full ink, honoring evidence
 *   restrictions honestly.
 * - Boundaries: it must work on every claim, in every view; it must not drop
 *   chain contrast below the minimum; it must not reveal restricted evidence,
 *   which renders hatched with its honest notice; it must not alter data,
 *   only visibility.
 * - Extension: none beyond amendment; the Lens is singular.
 * - Composition: owns the lens plane (layer.6); activated by pointer hold,
 *   Alt-hover, or keyboard focus + L; mobile tap-to-toggle.
 *
 * Bible Art. XII: the Lens is the signature moment — the single sanctioned
 * "wow". It must exist on every claim surface, and it must obey access
 * control: the Lens illuminates only evidence the viewer is authorized to
 * see; it never widens visibility beyond the underlying verification grant.
 * Transitions ≤ 400 ms on the registered curve; reduced-motion parity is
 * complete.
 */

import { useEffect, useRef, useState } from 'react';
import { definePrimitive } from './contract';
import { EvidenceItem, type EvidenceRecord } from './records';
import { Chainline, type ChainLink } from './containers';
import { MicroLabel } from './controls';

export const LENS_METADATA = definePrimitive({
  name: 'Lens',
  constitutionClause: '3.15',
  visualSystemSections: ['12'],
  bound: true,
  contract: {
    responsibility: 'Evidence x-ray — dims the world to fog and re-renders the evidence chain at full ink, honoring evidence restrictions honestly.',
    boundaries: [
      'must work on every claim, in every view (Constitution 3.15)',
      'must not drop chain contrast below the minimum (Constitution 3.15; VS §14 amendment 2)',
      'must not reveal restricted evidence — restricted renders hatched with its honest notice (Constitution 3.15)',
      'must not alter data, only visibility (Constitution 3.15)',
      'adds light, never access — it illuminates only evidence the viewer is authorized to see (Bible Art. XII; VS §12)',
    ],
    extension: 'none beyond amendment; the Lens is singular (Constitution 3.15)',
    composition: 'owns the lens plane (layer.6); activated by pointer hold, Alt-hover, or keyboard focus + L; mobile tap-to-toggle (Constitution 3.15; VS §11)',
  },
  tokens: ['elevation.veil.3', 'elevation.lens.6', 'motion.bound.max', 'motion.curve.settleOut', 'color.ink.32', 'shape.radius.8'],
  states: ['restricted'],
  accessibility: {
    announcement: 'activation moves focus to the illuminated chain; Escape returns it to the originating claim (6.8)',
    keyboard: 'focus + L activates; Escape dismisses; pointer-hold and Alt-hover are never the sole path (6.7, 6.9)',
    sensory: 'fog contrast meets the minimum — the Lens never trades contrast for drama (VS §12)',
  },
  citations: [],
});

export interface LensProps {
  /** The claim under inspection (Human Voice). */
  claim: string;
  /** The chain as received from the Chain Authority — rendered as the Chainline. */
  chain: readonly ChainLink[];
  /** Evidence as received from the Evidence Authority, restrictions intact. */
  evidence: readonly EvidenceRecord[];
  children: React.ReactNode;
}

const HOLD_MS = 350; // pointer-hold below the 400 ms motion bound; keyboard +L and tap are equivalent paths.

export function Lens({ claim, chain, evidence, children }: LensProps) {
  const [open, setOpen] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const claimRef = useRef<HTMLDivElement>(null);

  const activate = () => setOpen(true);
  const deactivate = () => setOpen(false);

  // Focus management (6.8): activation moves focus to the illuminated chain;
  // Escape returns it to the originating claim.
  useEffect(() => {
    if (open) planeRef.current?.focus();
  }, [open]);

  const startHold = () => {
    holdTimer.current = setTimeout(activate, HOLD_MS);
  };
  const cancelHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  useEffect(() => () => cancelHold(), []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'l' || event.key === 'L') && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      setOpen((o) => !o);
    }
    if (event.key === 'Escape') {
      setOpen(false);
      claimRef.current?.focus();
    }
  };

  const restrictedCount = evidence.filter((e) => e.restricted).length;

  return (
    <>
      <div
        ref={claimRef}
        className="vx-lens-claim"
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={`claim: ${claim} — activate to hold the Proof Lens, or press L`}
        onKeyDown={onKeyDown}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onContextMenu={(event) => event.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={(event) => {
          if (event.altKey) activate();
        }}
      >
        {children}
      </div>

      {/* veil.3 — the dimming stratum (VS §3.4) */}
      <div
        className="vx-lens-veil"
        data-open={open ? 'true' : 'false'}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--vx-color-ink-32)',
          zIndex: 'var(--vx-elevation-veil-3)',
          pointerEvents: open ? 'none' : 'none',
        }}
        aria-hidden="true"
      />

      {/* lens.6 — the illuminated evidence chain (VS §12) */}
      <div
        className="vx-lens-plane"
        data-open={open ? 'true' : 'false'}
        style={{ visibility: open ? 'visible' : 'hidden' }}
        aria-hidden={!open}
      >
        <div
          ref={planeRef}
          className="vx-lens-content"
          tabIndex={-1}
          role="dialog"
          aria-label={`proof lens: ${claim}`}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
              claimRef.current?.focus();
            }
          }}
        >
          <MicroLabel>PROOF LENS</MicroLabel>
          <p style={{ margin: 'var(--vx-space-3) 0' }}>{claim}</p>
          <MicroLabel>EVIDENCE CHAIN</MicroLabel>
          <div style={{ margin: 'var(--vx-space-3) 0' }}>
            <Chainline links={chain} orientation="horizontal" />
          </div>
          <MicroLabel>EVIDENCE ({evidence.length})</MicroLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-3)', marginTop: 'var(--vx-space-3)' }}>
            {evidence.map((item, index) => (
              <EvidenceItem key={index} evidence={item} />
            ))}
          </div>
          {restrictedCount > 0 ? (
            <p className="vx-micro" style={{ marginTop: 'var(--vx-space-4)' }}>
              {restrictedCount} EVIDENCE ITEM(S) RESTRICTED — RENDERED HATCHED, NEVER REVEALED
            </p>
          ) : null}
          <p className="vx-machine" style={{ marginTop: 'var(--vx-space-4)' }}>
            ESC RETURNS TO THE CLAIM
          </p>
        </div>
      </div>
    </>
  );
}
