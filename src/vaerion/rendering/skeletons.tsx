'use client';

/**
 * Vaerion — Rendering / The Three Skeletons
 *
 * Exactly three page skeletons exist (Visual System §1.4; Constitution 4.1):
 *
 *   1. Console — operational surfaces: ledgers, queues, verification runs.
 *      Dense, hairline-ruled, instrument-first.
 *   2. Document — reading surfaces: receipts, reports, attestations. One
 *      column of record, generous gauge, print-true. On ultra-wide it grows
 *      the 320 px Margin Rail instead of stretching the reading column.
 *   3. Status — at-a-glance surfaces: system attestation, health, stamps.
 *      Verdict-first, minimal navigation.
 *
 * A fourth layout pattern is a violation (4.1). Surfaces choose skeletons by
 * function, not preference.
 *
 * Chrome law (4.3): the Environment Stamp and the Spine are chrome, authored
 * once here, inherited everywhere. Pages must not re-render, restyle, or
 * omit them (3.10, 3.11).
 *
 * Citation: Constitution Part IV, Part VII; Visual System §1.4, §9.
 */

import type { ReactNode } from 'react';
import { EnvironmentStamp, type EnvironmentIdentity, Spine, type SpineEntry } from '../primitives/chrome';
import type { Chamber } from '../registry';

export type SkeletonKind = 'console' | 'document' | 'status';

export const SKELETON_CITATIONS = {
  console: ['VS §1.4 (Console — operational surfaces)', 'Constitution 4.1 (three skeletons only)'],
  document: ['VS §1.4 (Document — reading surfaces; the Margin Rail)', 'Constitution 4.1'],
  status: ['VS §1.4 (Status — at-a-glance; verdict-first)', 'Constitution 4.1'],
} as const;

export interface ShellProps {
  identity: EnvironmentIdentity;
  spineEntries: readonly SpineEntry[];
  activeSurfaceId: string;
  onNavigate: (id: string) => void;
  chamber: Chamber;
  /** The chamber declaration is an operational choice, rendered as registered controls (VS §4.1). */
  onChamberChange: (chamber: Chamber) => void;
  children: ReactNode;
}

/**
 * The shell: chrome inheritance for all three skeletons. The chamber
 * attribute scopes the two registered color sets (VS §4.1); the Environment
 * Stamp is rendered exactly once, here (4.3). The Spine is authored once as
 * a component and placed by each skeleton's grid (3.11; Part VII).
 */
export function Shell({ identity, chamber, onChamberChange, children }: Omit<ShellProps, 'spineEntries' | 'activeSurfaceId' | 'onNavigate'>) {
  return (
    <div className="vx-root vx-shell" data-chamber={chamber}>
      <header className="vx-shell-stamp">
        <EnvironmentStamp identity={identity} />
        <div className="vx-chamber-switch" role="group" aria-label="chamber (VS §4.1: theme is an operational choice)">
          <button
            type="button"
            className="vx-button"
            data-hierarchy={chamber === 'light' ? 'control' : 'quiet'}
            aria-pressed={chamber === 'light'}
            onClick={() => onChamberChange('light')}
          >
            READING ROOM
          </button>
          <button
            type="button"
            className="vx-button"
            data-hierarchy={chamber === 'dark' ? 'control' : 'quiet'}
            aria-pressed={chamber === 'dark'}
            onClick={() => onChamberChange('dark')}
          >
            WAR ROOM
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

/** Console skeleton: spine rail + operational main. */
export function ConsoleSkeleton({ spine, children }: { spine: ReactNode; children: ReactNode }) {
  return (
    <div className="vx-console">
      {spine}
      <main className="vx-console-main">{children}</main>
    </div>
  );
}

/** Document skeleton: one reading column + the ultra-wide Margin Rail (VS §1.4). */
export function DocumentSkeleton({ spine, children, rail }: { spine: ReactNode; children: ReactNode; rail?: ReactNode }) {
  return (
    <div className="vx-document">
      {spine}
      <main className="vx-document-reading">{children}</main>
      <aside className="vx-document-rail" aria-label="margin rail">
        {rail}
      </aside>
    </div>
  );
}

/** Status skeleton: verdict-first, minimal navigation, one screen (VS §13.3). */
export function StatusSkeleton({ spine, children }: { spine: ReactNode; children: ReactNode }) {
  return (
    <div className="vx-console" style={{ flex: 1 }}>
      {spine}
      <main className="vx-status">
        <div className="vx-status-main">{children}</div>
      </main>
    </div>
  );
}
