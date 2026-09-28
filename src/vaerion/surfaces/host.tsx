'use client';

/**
 * Vaerion — Surfaces / The Surface Host
 *
 * The host mounts the constitutional chrome (Shell) exactly once and swaps
 * registered surfaces inside their registered skeletons. Wayfinding is
 * always visible (VS §5.20); every act resolves to a receipt or a Return
 * (6.5), so the Returns provider wraps the whole instrument.
 *
 * The chamber is an operational choice (VS §4.1) held here; the declared
 * Registry version is auditable (2.8).
 *
 * Host-route note (IR-001): the standing platform exposes a single
 * user-visible route (`/`). The first constitutional surfaces landing at
 * Stage 4 execute the transition IR-001 anticipated; the pre-ratification
 * site remains preserved untouched as history (IR-003; 11.4). Recorded in
 * the Stage 4 conformance report and the worklog.
 */

import { useState, type ReactNode } from 'react';
import { ReturnsProvider, ReturnsHost } from '../primitives/feedback';
import { ConsoleSkeleton, DocumentSkeleton, StatusSkeleton, Shell } from '../rendering/skeletons';
import { Spine, type SpineEntry } from '../primitives/chrome';
import { getSurface, SURFACE_REGISTRY } from './registry';
import {
  AuditSurface,
  EnterpriseSurface,
  LedgerSurface,
  PlaygroundSurface,
  RuntimeSurface,
  VerificationSurface,
} from './console';
import { ConstitutionSurface, ReceiptViewerSurface } from './documents';
import { SearchSurface, StatusSurface } from './status';
import { DEMO_ENVIRONMENT_IDENTITY } from './fixtures';
import type { Chamber } from '../registry';

const SPINE_ENTRIES: readonly SpineEntry[] = SURFACE_REGISTRY.map((surface) => ({
  id: surface.id,
  label: surface.label,
  territory: surface.territory,
}));

function consoleSurface(id: string): ReactNode {
  switch (id) {
    case 'runtime': return <RuntimeSurface />;
    case 'ledger': return <LedgerSurface />;
    case 'audit': return <AuditSurface />;
    case 'verification': return <VerificationSurface />;
    case 'enterprise': return <EnterpriseSurface />;
    case 'playground': return <PlaygroundSurface />;
    default: return null;
  }
}

function statusSurface(id: string): ReactNode {
  switch (id) {
    case 'status': return <StatusSurface />;
    case 'search': return <SearchSurface />;
    default: return null;
  }
}

function DocumentSurfaceById({ id, spine }: { id: string; spine: ReactNode }) {
  const render = (body: ReactNode, rail: ReactNode) => (
    <DocumentSkeleton spine={spine} rail={rail}>{body}</DocumentSkeleton>
  );
  switch (id) {
    case 'receipt-viewer': return <ReceiptViewerSurface>{render}</ReceiptViewerSurface>;
    case 'constitution': return <ConstitutionSurface>{render}</ConstitutionSurface>;
    default: return null;
  }
}

export function SurfaceHost() {
  const [chamber, setChamber] = useState<Chamber>('light');
  const [activeId, setActiveId] = useState<string>('runtime');

  const surface = getSurface(activeId);

  const spine = <Spine entries={SPINE_ENTRIES} activeId={activeId} onNavigate={setActiveId} />;

  return (
    <ReturnsProvider>
      <Shell identity={DEMO_ENVIRONMENT_IDENTITY} chamber={chamber} onChamberChange={setChamber}>
        {surface.skeleton === 'console' ? (
          <ConsoleSkeleton spine={spine}>{consoleSurface(surface.id)}</ConsoleSkeleton>
        ) : surface.skeleton === 'document' ? (
          <DocumentSurfaceById id={surface.id} spine={spine} />
        ) : (
          <StatusSkeleton spine={spine}>{statusSurface(surface.id)}</StatusSkeleton>
        )}
      </Shell>
      <ReturnsHost />
    </ReturnsProvider>
  );
}
