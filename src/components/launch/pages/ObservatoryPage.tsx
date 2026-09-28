"use client";

/**
 * Vaerion — Release Observatory page (Phase 12, order section 3:
 * "Release Observatory").
 *
 * Two honest layers:
 *   1. The F-006 release record of the civilization, fetched live from
 *      /api/knowledge — receipts, artifacts, channels, exactly as issued
 *      by the Stage 10 Release Engine.
 *   2. The generated observatory artifact itself (the pipeline's own
 *      command-center rendering, produced by `bun run vaerion:observatory`),
 *      served verbatim at /api/release/observatory and framed here.
 *
 * The page asserts nothing beyond the record: channels read "signed" —
 * never "delivered" — because delivery evidence is undefined pending
 * IR-019, and this page's own display path is pending IR-018 (it
 * exercises the Founder's Phase 12 order, which mandates the section).
 *
 * Citations: Phase 12 execution order section 3; F-006; IR-018; IR-019;
 * IR-021; src/vaerion/release/* (Stage 10).
 */

import { ExternalLink } from "lucide-react";

import { releaseDate, useKnowledge } from "../api";
import { Callout, PageHero, Panel, Pill, Section } from "../../site/primitives";

export function ObservatoryPage() {
  const { state } = useKnowledge();

  return (
    <>
      <PageHero
        eyebrow="Release Observatory"
        title="Every release, receipted. Every receipt, verifiable."
        lead="The Release Engine issues nothing without a receipt — constitutional, build, artifact, distribution, trust — recorded in an append-only ledger under constitution/releases/. What follows is the record, verbatim."
      >
        <div className="flex flex-wrap gap-2">
          <Pill tone="gold">F-006 release ledger</Pill>
          <Pill tone="neutral">display path pending IR-018</Pill>
          <Pill tone="neutral">delivery evidence pending IR-019</Pill>
        </div>
      </PageHero>

      <Section tight label="The release record" title="Issued by the ceremony — never hand-written.">
        {state.phase === "loading" ? (
          <Panel className="p-6" aria-busy="true">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-mutedfg">reading the release ledger…</p>
          </Panel>
        ) : state.phase === "error" ? (
          <Panel className="border-failx/40 p-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-failx">the ledger is unreachable</p>
            <p className="mt-2 text-sm text-mutedfg">/api/knowledge responded: {state.message}. No release is claimed in its place.</p>
          </Panel>
        ) : !state.data.release ? (
          <Panel className="p-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-mutedfg">none recorded</p>
            <p className="mt-2 text-sm text-mutedfg">
              No release exists in constitution/releases/index.json yet. Absence renders as absence — no release is fabricated for display.
            </p>
          </Panel>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[12px] text-mutedfg">
              <span>
                release <span className="text-gold">{state.data.release.releaseId}</span>
              </span>
              <span>version {state.data.release.version}</span>
              <span>ledger seq {state.data.release.seq}</span>
              <span>issued {releaseDate(state.data.release.appendedAt)}</span>
              <span>parent {state.data.release.parentReleaseId ?? "genesis"}</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedfg">
                  Receipts ({state.data.release.receipts.length}) — each with its integrity digest
                </h3>
                <ul className="space-y-2.5">
                  {state.data.release.receipts.map((r) => (
                    <li key={r.receiptId}>
                      <Panel className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-body">{r.kind}</span>
                          <Pill tone="neutral">{r.signatureAlgorithm}</Pill>
                        </div>
                        <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-mutedfg">
                          {r.receiptId} · sha256 {r.sha256Prefix}…
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-mutedfg">authority: {r.authority}</p>
                      </Panel>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedfg">
                    Artifacts ({state.data.release.artifacts.length}) — nothing anonymous
                  </h3>
                  <ul className="space-y-2.5">
                    {state.data.release.artifacts.map((a) => (
                      <li key={a.artifactId}>
                        <Panel className="p-4">
                          <p className="font-mono text-[12px] text-body">{a.name}</p>
                          <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-mutedfg">
                            {a.kind} · sha256 {a.sha256Prefix}… · origin: {a.origin}
                          </p>
                        </Panel>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedfg">
                    Channels ({state.data.release.channels.length}) — honest lifecycle
                  </h3>
                  <ul className="space-y-2">
                    {state.data.release.channels.map((c) => (
                      <li key={c.channel} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-edge bg-surface px-4 py-2.5">
                        <span className="font-mono text-[12px] text-body">{c.channel}</span>
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-[10.5px] text-mutedfg">{c.packageIdentity}</span>
                          <Pill tone={c.stage === "delivered" ? "trust" : "warn"}>{c.stage}</Pill>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Callout kind="honesty" title="Why every channel reads signed, not delivered">
                    The Distribution Engine refuses to mark a channel delivered without external delivery evidence — registry responses, publish
                    logs — and that evidence definition is pending the Founder&apos;s ruling (IR-019). Until ruled, no channel claims delivery.
                    This is the Art. VIII law: deployment history is never fabricated.
                  </Callout>
                </div>
              </div>
            </div>
          </>
        )}
      </Section>

      <Section tight label="The artifact" title="The observatory as the pipeline rendered it.">
        <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          The command center below is not a re-rendering — it is the actual artifact generated by{" "}
          <code className="font-mono text-gold">bun run vaerion:observatory</code> and served verbatim from{" "}
          <code className="font-mono text-gold">/api/release/observatory</code>.
        </p>
        <div className="mt-6 overflow-hidden rounded-md border border-edge">
          <iframe
            src="/api/release/observatory"
            title="Release Observatory — generated artifact"
            className="h-[720px] w-full bg-ink"
            loading="lazy"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          <a
            href="/api/release/observatory"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-mutedfg transition-colors hover:text-body"
          >
            open the artifact standalone <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
        <p className="mt-6 font-mono text-[11px] leading-relaxed text-mutedfg">
          page authority: constitution/releases/index.json · constitution/releases/receipts/ · /api/release/observatory · F-006 · IR-018 ·
          IR-019 — confidence: verified against the ledger at request time
        </p>
      </Section>
    </>
  );
}
