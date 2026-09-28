'use client';

/**
 * Vaerion — Primitives / Chrome: Environment Stamp · Navigation Spine
 *
 * Contracts:
 * - Environment Stamp (Constitution 3.10 [VS §5.21; Bible Art. III]) —
 *   permanent, machine-voice declaration of verifier identity — engine
 *   version, ruleset, environment — in chrome, linking to the Attestation
 *   Page. Present on every surface without exception; not dismissible, not
 *   stylable per surface, not human-voice. If the stamp is missing, the
 *   surface is not a Vaerion surface (VS §5.21).
 * - Navigation Spine (Constitution 3.11 [VS §5.20]) — section wayfinding
 *   with active-state brass tick and mandatory labels. Sections are the
 *   enumerated set of the Visual System territories (console, records,
 *   rules, system); it must not host actions, notifications, or metrics;
 *   labels are never optional.
 *
 * Composition: both belong to the chrome layer, authored once, inherited
 * everywhere (Constitution 4.3). Pages must not re-render, restyle, or omit
 * them.
 */

import { definePrimitive } from './contract';

/* ── Environment Stamp ────────────────────────────────────────────────────── */

export interface EnvironmentIdentity {
  /** Engine version (Bible Art. III — the verifier is named). */
  engineVersion: string;
  /** Rule set (Bible Art. III). */
  ruleset: string;
  /** Environment (Bible Art. III). */
  environment: string;
}

export const ENVIRONMENT_STAMP_METADATA = definePrimitive({
  name: 'Environment Stamp',
  constitutionClause: '3.10',
  visualSystemSections: ['5.21'],
  bound: true,
  contract: {
    responsibility: 'Permanent, machine-voice declaration of verifier identity — engine version, rule set, environment — in chrome, linking to the Attestation Page.',
    boundaries: [
      'present on every surface without exception (Constitution 3.10)',
      'not dismissible, not stylable per surface, not human-voice (Constitution 3.10)',
      'its fields are fixed; adding a field requires amendment (Constitution 3.10)',
    ],
    extension: 'fields are fixed (engine version · rule set · environment); amendment only',
    composition: 'belongs to the chrome layer, never to page content (Constitution 3.10; Part VII)',
  },
  tokens: ['type.voice.machine', 'color.ink.16', 'elevation.sticky.2', 'color.accent.brass.glyph'],
  states: [],
  accessibility: {
    announcement: 'announces the three identity fields as the attestation of context (Art. III)',
    keyboard: 'the attestation link is reachable (6.7)',
    sensory: 'Machine Voice at registered micro scale (VS §5.21)',
  },
  citations: [],
});

export function EnvironmentStamp({
  identity,
  onOpenAttestation,
}: {
  identity: EnvironmentIdentity;
  onOpenAttestation?: () => void;
}) {
  return (
    <div className="vx-stamp vx-micro" role="contentinfo" aria-label="environment stamp">
      <span className="vx-stamp-field">
        <span aria-hidden="true">ENGINE</span>
        <span className="vx-machine">{identity.engineVersion}</span>
      </span>
      <span aria-hidden="true">·</span>
      <span className="vx-stamp-field">
        <span aria-hidden="true">RULE SET</span>
        <span className="vx-machine">{identity.ruleset}</span>
      </span>
      <span aria-hidden="true">·</span>
      <span className="vx-stamp-field">
        <span aria-hidden="true">ENVIRONMENT</span>
        <span className="vx-machine">{identity.environment}</span>
      </span>
      {onOpenAttestation ? (
        <button type="button" className="vx-stamp-link vx-micro" onClick={onOpenAttestation}>
          ATTESTATION
        </button>
      ) : null}
    </div>
  );
}

/* ── Navigation Spine ─────────────────────────────────────────────────────── */

/** The enumerated territories of the instrument (VS §5.20). */
export const SPINE_TERRITORIES = ['console', 'records', 'rules', 'system'] as const;
export type SpineTerritory = (typeof SPINE_TERRITORIES)[number];

export interface SpineEntry {
  id: string;
  label: string;
  territory: SpineTerritory;
}

export const SPINE_METADATA = definePrimitive({
  name: 'Navigation (Spine)',
  constitutionClause: '3.11',
  visualSystemSections: ['5.20'],
  bound: true,
  contract: {
    responsibility: 'Section wayfinding with active-state brass tick and mandatory labels.',
    boundaries: [
      'sections are the enumerated set of the Visual System territories (Constitution 3.11; VS §5.20)',
      'must not host actions, notifications, or metrics (Constitution 3.11)',
      'labels are never optional (Constitution 3.11)',
      'the Spine never hides behind discovery patterns; wayfinding is always visible (VS §5.20)',
    ],
    extension: 'a new section requires amendment of the enumerated set (Constitution 3.11)',
    composition: 'chrome layer; collapse behaviors at tablet and mobile are fixed by the responsive contract (Constitution 3.11; Part VII)',
  },
  tokens: ['color.ink.16', 'color.ink.32', 'color.accent.brass.glyph', 'elevation.sticky.2', 'space.touchMinimum'],
  states: [],
  accessibility: {
    announcement: 'navigation landmark; current entry is announced with aria-current',
    keyboard: 'entries are buttons in DOM order; Tab reaches every label (6.7)',
    sensory: 'active state is a brass tick plus wash — never color alone (Art. IV)',
  },
  citations: [],
});

export function Spine({
  entries,
  activeId,
  onNavigate,
}: {
  entries: readonly SpineEntry[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="vx-spine" aria-label="navigation spine">
      {SPINE_TERRITORIES.map((territory) => {
        const territoryEntries = entries.filter((e) => e.territory === territory);
        if (territoryEntries.length === 0) return null;
        return (
          <div key={territory} className="vx-spine-territory">
            <span className="vx-micro" style={{ opacity: 0.7 }}>{territory}</span>
            {territoryEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="vx-spine-entry"
                aria-current={entry.id === activeId ? 'true' : undefined}
                onClick={() => onNavigate(entry.id)}
              >
                <span>{entry.label}</span>
              </button>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
