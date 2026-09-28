"use client";

/**
 * Vaerion — Documentation portal (Phase 12, order section 3:
 * "Documentation").
 *
 * The launch layer's documentation section. It does not duplicate the
 * docs of record — it composes the existing DocsHomePage verbatim and
 * adds the one thing the launch order demands: a front door to the
 * Knowledge Interface, the Stage 11 civilization archive.
 *
 * Citations: Phase 12 execution order section 3; IR-020 (Knowledge
 * Interface display path); IR-021; constitution/docs/GOVERNANCE.md.
 */

import { ArrowRight } from "lucide-react";

import DocsHomePage from "../../site/pages/DocsHomePage";
import { Panel, Section } from "../../site/primitives";

export function DocumentationPortal() {
  return (
    <>
      <Section tight label="Stage 11 · the knowledge organ" title="The Knowledge Interface — the archive behind these pages.">
        <a href="#/knowledge" className="group block" aria-label="Enter the Knowledge Interface">
          <Panel className="border-gold/30 p-6 transition-colors group-hover:border-gold/60">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                  Vaerion Knowledge Interface
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mutedfg">
                  The 2090-grade command center for the civilization archive: the twelve-chapter Codex, the knowledge organ, the stage manifest,
                  the F-006 release record, the trace index, the interpretation ledger, and hash-first search that resolves authority references
                  before prose. Every page it shows is governed — authority citations, verification timestamps, owning system, confidence state.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-gold transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Panel>
        </a>
      </Section>

      {/* The docs of record, verbatim — composed, never rewritten. */}
      <DocsHomePage />
    </>
  );
}
