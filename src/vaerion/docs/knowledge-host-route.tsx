'use client';

/**
 * Vaerion — Documentation Architecture / The Knowledge Host Route
 *
 * Stage 11 — Deliverable 3 display path (IR-020). The standing platform
 * exposes a single user-visible route (`/`). The route's default
 * composition is untouched — it mounts the constitutional instrument
 * (`SurfaceHost`, the ten registered surfaces of Constitution 4.6). The
 * Knowledge Interface is documentation delivery and is reached through the
 * documented hash path:
 *
 *     /#/knowledge
 *
 * The mechanism is the same instrument as the Release Observatory's
 * IR-018: documentation/tooling delivery at the host route, pending the
 * Founder's ruling on its permanent display path. Nothing is deleted
 * either way (11.4). The hash is read after hydration only, so the
 * server-rendered instrument and the first client render agree.
 *
 * Citations: Stage 11 execution order Deliverable 3; IR-020; IR-001
 * (host-route precedent); Constitution 4.6, 3.11, P-5, 11.4; Bible Art. XI.
 */

import { useEffect, useState } from 'react';

import { SurfaceHost } from '../surfaces';
import { KnowledgeInterface } from './knowledge-interface';

const KNOWLEDGE_HASH = '#/knowledge';

export function KnowledgeHostRoute() {
  // SSR and the first client render agree: the constitutional instrument.
  const [showKnowledge, setShowKnowledge] = useState(false);

  useEffect(() => {
    const readHash = (): void => {
      setShowKnowledge(window.location.hash === KNOWLEDGE_HASH);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => {
      window.removeEventListener('hashchange', readHash);
    };
  }, []);

  if (showKnowledge) {
    return <KnowledgeInterface />;
  }
  return <SurfaceHost />;
}
