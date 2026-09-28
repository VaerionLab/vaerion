"use client";

/**
 * Vaerion launch layer — the measured-data contract.
 *
 * Every launch page renders from `/api/knowledge` (Stage 11, IR-020) —
 * the same read-only delivery the Knowledge Interface uses. The route
 * reads the real sources at request time (stage manifest, F-006 release
 * record, organ inventory); this module types the subset the launch
 * pages consume and provides one honest fetch hook: loading is visible,
 * absence renders as absence, errors offer a retry. Nothing is invented
 * client-side.
 *
 * Citations: Phase 12 execution order (section 3 — Website Preparation);
 * IR-020; IR-021; Bible Art. VIII, XI; docs/launch rules in FACTS.
 */

import { useCallback, useEffect, useState } from "react";

export interface KnowledgeCounts {
  stages: number;
  stagesConformant: number;
  organPages: number;
  pathways: number;
  traceEntries: number;
  interpretations: number;
  receipts: number;
  artifacts: number;
  channels: number;
}

export interface ReleaseReceiptDto {
  kind: string;
  receiptId: string;
  sha256Prefix: string;
  signatureAlgorithm: string;
  authority: string;
}

export interface ReleaseArtifactDto {
  artifactId: string;
  kind: string;
  name: string;
  sha256Prefix: string;
  origin: string;
  owningRelease: string;
}

export interface ReleaseChannelDto {
  channel: string;
  stage: string;
  packageIdentity: string;
}

export interface ReleaseRecordDto {
  releaseId: string;
  version: string;
  seq: number;
  appendedAt: number;
  parentReleaseId: string | null;
  receipts: ReleaseReceiptDto[];
  artifacts: ReleaseArtifactDto[];
  channels: ReleaseChannelDto[];
}

export interface StageDto {
  id: number;
  name: string;
  root: string;
  status: string;
  dependsOn: number[];
  purpose: string;
}

export interface KnowledgeData {
  generatedAt: number;
  counts: KnowledgeCounts;
  stages: StageDto[];
  release: ReleaseRecordDto | null;
  interpretations: { path: string; entries: { id: string; title: string }[] };
}

type KnowledgeState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; data: KnowledgeData };

export function useKnowledge(): { state: KnowledgeState; reload: () => void } {
  const [state, setState] = useState<KnowledgeState>({ phase: "loading" });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    // No synchronous reset here: the hook starts in `loading`, and on a
    // reload the previous record stays visible until the fresh one lands
    // (no fake flicker, no invented state).
    fetch("/api/knowledge", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`/api/knowledge responded ${res.status}`);
        return (await res.json()) as KnowledgeData;
      })
      .then((data) => {
        if (!cancelled) setState({ phase: "ready", data });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ phase: "error", message: err instanceof Error ? err.message : "unknown fetch failure" });
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { state, reload };
}

/** UTC date for a F-006 appendedAt epoch (ms). */
export function releaseDate(appendedAt: number): string {
  return new Date(appendedAt).toISOString().slice(0, 10);
}
