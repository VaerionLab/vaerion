"use client";

import { ReceiptText, ShieldCheck, Package, Lock, FileSearch } from "lucide-react";
import { FACTS } from "../facts";
import {
  Section,
  PageHero,
  Panel,
  Pill,
  Bullets,
  CodeBlock,
  Terminal,
  ArrowLink,
  Callout,
  CTARow,
  GoldButton,
  GhostButton,
} from "../primitives";
import { ReceiptChain } from "../diagrams";

/* Tamper findings — transcribed from spec/errors.yaml, docs/CLI.md, and
 * docs/security/MITIGATIONS.md (measured). */
const FINDINGS = [
  {
    code: "E1001",
    name: "journal_chain_broken",
    text: "The journal hash chain does not link at the reported record — verify names the first broken index.",
  },
  {
    code: "E1002",
    name: "journal_torn_tail",
    text: "A torn crash tail. recover truncates only that tail and re-seals the chain with an auditable recovery record.",
  },
  {
    code: "E2100",
    name: "extension_artifact_digest_mismatch",
    text: "The extension artifact does not match its pinned digest — it is never executed.",
  },
  {
    code: "E2201 / E2202",
    name: "manifest / lock digest mismatch",
    text: "A digest swap must defeat config AND the generated lock seal simultaneously — one mismatch is a hard failure.",
  },
  {
    code: "E2205",
    name: "vxn_lock_mismatch",
    text: "vaerion.lock disagrees with reality. The lock is generated, never hand-edited — rebuild and review the diff.",
  },
  {
    code: "E2206",
    name: "vxn_verify_failed",
    text: "Verification completed with findings: the bundle must not be imported, distributed, or executed.",
  },
] as const;

export default function ReceiptsPage() {
  return (
    <>
      <PageHero
        eyebrow="Receipts & verification"
        title="Proof that outlives the process that made it."
        lead="A receipt is a compact, tamper-evident record folded from a run's journal. It verifies independently of the process that produced it — trust becomes a property of the bytes, not the vendor."
      >
        <CTARow
          primary={
            <GoldButton href="#/how-it-works">Walk the journey that produces one</GoldButton>
          }
          secondary={<GhostButton href="#/governance">How the decisions behind it are made</GhostButton>}
        />
      </PageHero>

      {/* ───────────────────  the chain  ─────────────────── */}
      <Section
        label="The chain"
        title="Run → journal → receipt → verify."
        lead="Every agent action executes through the broker-gated pipeline, each step appends to the blake3-chained journal, the receipt folds from that journal, and any later process can recompute the check."
      >
        <ReceiptChain />
      </Section>

      {/* ───────────────────  what a receipt is  ─────────────────── */}
      <Section
        label="Definition"
        title="What a receipt is."
        lead="Not a log line, not a screenshot — a closing record derived from the journal by construction."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              tone="trust"
              items={[
                "The last journal record of a run is its receipt (docs/CLI.md).",
                "It is computed as a fold over the journal — a receipt can never disagree with the records it summarizes (ADR-0006).",
                "Compact and portable: it closes the run and is surfaced by vae explain and vae center.",
                "It verifies independently of the producing process — on disk under .vaerion/receipts/.",
              ]}
            />
            <Callout kind="security" title="Why this matters">
              Whether a run happened five minutes or five months ago makes no difference to the check. The producing process is irrelevant
              to whether the receipt holds.
            </Callout>
          </div>
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <ReceiptText className="h-5 w-5 text-gold" aria-hidden />
              <h3 className="text-sm font-semibold text-body">Where evidence lives in a workspace</h3>
            </div>
            <ul className="mt-4 space-y-2 font-mono text-xs leading-relaxed text-mutedfg">
              <li>.vaerion/journal/&lt;run&gt;.ndjson — append-only, blake3-chained</li>
              <li>.vaerion/receipts/ — receipts folded from the journals</li>
              <li>.vaerion/blobs/ — content-addressed store (blob CAS)</li>
              <li>.vaerion/package/*.vxn — reproducible bundles</li>
              <li>.vaerion/audit.log — hash-chained audit ledger</li>
              <li>.vaerion/refusals.log — the durable Refusal Log</li>
              <li>vaerion.lock — generated seal; committed, never hand-edited</li>
            </ul>
          </Panel>
        </div>
      </Section>

      {/* ───────────────────  what verify recomputes  ─────────────────── */}
      <Section
        label="Verification"
        title="A pure check: recompute, compare, never execute."
        lead="Verification recomputes digests and compares pins. It never executes bundle or journal content — there is no code path by which checking a bundle runs it."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col gap-5">
            <Bullets
              items={[
                "Walk the blake3 chain and report the first broken index — silent truncation is forbidden.",
                "Recompute every digest that can be recomputed from the bytes.",
                "Compare manifest pins both directions: against vaerion.yaml AND the generated vaerion.lock.",
                "vae doctor triangulates evidence ↔ blob bytes ↔ fingerprint across the whole workspace.",
              ]}
            />
            <ArrowLink href="#/docs/cli">The full command surface</ArrowLink>
          </div>
          <CodeBlock
            title="the verification commands"
            code={`vae journal verify <RUN_ID>                        # the chain holds — measured, now
vae package verify .vaerion/package/vaerion-demo.vxn   # per-check findings report
vae provenance .vaerion/package/vaerion-demo.vxn   # the evidence, recomputed from the bytes
vae doctor                                         # config, journals, blobs, both chains — no network`}
          />
        </div>
      </Section>

      {/* ───────────────────  tamper findings  ─────────────────── */}
      <Section
        label="Tamper"
        title="Tampering is a named finding, not a generic error."
        lead="Flipped bytes, swapped pins, or a torn chain fail with a specific E-code and a Fix hint — so the answer to 'what happened' is in the output, not in a debugger."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FINDINGS.map((f) => (
            <Panel key={f.code} className="p-5">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-failx" aria-hidden />
                <span className="font-mono text-sm font-semibold text-gold">{f.code}</span>
              </div>
              <p className="mt-1 font-mono text-xs text-mutedfg">{f.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{f.text}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-6">
          <Callout kind="honesty" title="What verification does not claim">
            A green verify report says the digests and pins hold. It does not certify that the underlying work was wise — that is what
            the journaled broker decisions and human gates are for. Different questions, different artifacts.
          </Callout>
        </div>
      </Section>

      {/* ───────────────────  bundles + lock  ─────────────────── */}
      <Section
        label="Bundles · ADR-0016"
        title="Reproducible .vxn bundles, sealed by vaerion.lock."
        lead="Identical inputs produce byte-identical bundles — test-proven, not aspirational. That is what makes rebuild-and-compare a usable tamper check for anyone, not just the author."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              tone="trust"
              items={[
                "Entries are canonically ordered; compression is zstd at a pinned level and version.",
                "Content identity is blake3 — every file carries a digest, and the manifest pins component digests.",
                "The build is a fold over declared inputs plus lockfile pins: no wall-clock, no ambient paths.",
                "Import and verify are pure checks; execution begins only after verification, with declared capabilities as broker principals.",
              ]}
            />
          </div>
          <Terminal
            title="vae — prove it to yourself"
            lines={[...FACTS.heroTerminal.slice(5, 11)]}
          />
        </div>
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-mutedfg">
          output shape distilled from docs/QUICKSTART.md §3–4 — run it yourself; your machine's digests are the proof
        </p>
        <div className="mt-8 flex flex-col gap-5">
          <Panel className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <Lock className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-sm font-semibold text-body">vaerion.lock</h3>
            </div>
            <p className="text-sm leading-relaxed text-mutedfg">
              The generated seal over config, extension pins, and the bundle digest. Generated, committed, never hand-edited — a
              disagreement (E2205) is repaired by rebuilding, not by editing.
            </p>
          </Panel>
          <CTARow
            primary={
              <GoldButton href="#/developers">
                Build your first bundle <Package className="h-4 w-4" aria-hidden />
              </GoldButton>
            }
            secondary={
              <GhostButton href="#/architecture">
                <ShieldCheck className="h-4 w-4" aria-hidden /> The architecture underneath
              </GhostButton>
            }
          />
        </div>
      </Section>
    </>
  );
}
