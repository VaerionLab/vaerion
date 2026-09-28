"use client";

import { Database, FileText, ShieldCheck, CircleCheck, Boxes, Globe, KeyRound, Radio } from "lucide-react";
import { FACTS } from "../facts";
import {
  Section,
  PageHero,
  Panel,
  Pill,
  Bullets,
  CodeBlock,
  Stat,
  ArrowLink,
  Callout,
  CTARow,
  GoldButton,
  GhostButton,
} from "../primitives";
import { LayerDiagram, SurfaceChip } from "../diagrams";

const SEAMS = [
  {
    icon: Globe,
    adr: "ADR-0019",
    title: "One sanctioned egress",
    text: "Exactly one transport site carries the endpoint map and calls fetch. Adapters name host keys, never URLs; outbound payloads pass redaction middleware first. The C7 check fails the build if any other module grows network primitives.",
  },
  {
    icon: KeyRound,
    adr: "ADR-0013",
    title: "A secrets port, not a secrets store",
    text: "Secrets resolve OS-keychain-first with env indirection for CI. vaerion.yaml and vaerion.lock carry secret NAMES only; secret reads are broker-mediated decisions, and a secret-shaped value never becomes journal content.",
  },
  {
    icon: Boxes,
    adr: "ADR-0009",
    title: "Extensions in a sandbox",
    text: "WASI-P2 components loaded from sha256-pinned artifacts. Powers arrive exclusively through a host-function bridge onto the broker — no ambient filesystem, network, or environment inside the sandbox.",
  },
  {
    icon: Radio,
    adr: "ADR-0010",
    title: "Loopback daemon + pairing token",
    text: "HTTP/SSE on 127.0.0.1:7897 by default; the daemon refuses any non-loopback bind (E2001) and requires a pairing token printed once on every state-changing call. Remote exposure needs a ratified ADR — there is no flag.",
  },
] as const;

export default function ArchitecturePage() {
  return (
    <>
      <PageHero
        eyebrow="Architecture"
        title="One event spine. One permission authority. One network seam."
        lead="Vaerion is a layered engine, not an agent framework: a deterministic kernel, an append-only spine, thin surfaces — and a lint gate that keeps dependencies pointing one way."
      >
        <CTARow
          primary={
            <GoldButton href="#/how-it-works">
              See the developer journey <CircleCheck className="h-4 w-4" aria-hidden />
            </GoldButton>
          }
          secondary={<GhostButton href="#/security">Read the security model</GhostButton>}
        />
      </PageHero>

      {/* ───────────────────  layers  ─────────────────── */}
      <Section
        label="The stack"
        title="Four layers, no L3, and a gate that enforces it."
        lead="A module may only depend downward. layerlint runs on every build — the layer law is a verified property of the codebase, not a diagram in a document."
      >
        <LayerDiagram />
      </Section>

      {/* ───────────────────  the spine  ─────────────────── */}
      <Section
        label="The spine · ADR-0002"
        title="Every event says who caused it, and why it exists."
        lead="CLI renderers, journals, replay, receipts, HTTP streams, and SDK iterators are all projections of one ordered event spine. The envelope is the most widely consumed contract in the system — so it is versioned, normative, and additive-only."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Panel className="p-6">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Envelope v1 — every field required</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["v", "type", "seq", "ts", "trace_id", "span_id", "actor {kind, id}", "cause {kind, ref}", "payload"].map((f) => (
                <SurfaceChip key={f}>{f}</SurfaceChip>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-mutedfg">
              Unknown fields are rejected. New event types must be registered before they can be emitted — there are no ambient events.
              Old journals stay readable by newer engines within v1.
            </p>
          </Panel>
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "actor and cause are never optional — nothing happens without a who and a why.",
                "seq is gapless, monotonic, 1-based, and allocated only by the run's single journal writer.",
                "Evolution within v1 is additive-only: fields may be added, never removed or re-typed.",
                "Removal requires a major envelope version with projection adapters.",
              ]}
            />
            <Callout kind="info" title="Why so strict">
              Journals are durable user data. A breaking envelope change would invalidate every journal ever written — the ceremony is
              the price of journals that outlive versions.
            </Callout>
          </div>
        </div>
      </Section>

      {/* ───────────────────  journals + checkpoints  ─────────────────── */}
      <Section
        label="Journals · ADR-0006"
        title="Event-sourced runs with checkpoint chaining."
        lead="The journal is not a log of convenience — it is the truth from which state, receipts, and audits are derived. A run replays to identical state given the same journal and seeds."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "One append-only NDJSON journal per run, blake3-chained from a 64-zero genesis link.",
                "One writer per journal, enforced by an exclusive-create lock with stale-owner detection.",
                "Snapshots are accelerators, never truth: restore prefers them but falls back to full replay, and a snapshot that disagrees with the journal is discarded (E1501).",
                "Resume continues an interrupted run from its journal fold — crash-safe by construction.",
              ]}
            />
            <Callout kind="security" title="Auditable recovery">
              A torn crash tail is truncated and re-sealed with a recovery record the reader can see. Silent truncation is forbidden —
              verification walks the chain and reports the first broken index.
            </Callout>
          </div>
          <CodeBlock
            title="journal operations (docs/CLI.md)"
            code={`vae journal ls                     # your runs
vae journal show <RUN_ID>          # the full event narrative
vae journal verify <RUN_ID>        # the chain holds — measured, now
vae journal recover <RUN_ID> [--dry-run]   # truncate only a torn crash tail, re-seal auditable
vae journal export <RUN_ID> [--out PATH]   # redacted, independently verifiable derivation`}
          />
        </div>
      </Section>

      {/* ───────────────────  seams  ─────────────────── */}
      <Section
        label="The seams"
        title="Every boundary is a designed, reviewed place."
        lead="Four mechanisms carry the local-first guarantees across trust boundaries. Each is one module, one ADR, and one constitutional check away from regression."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SEAMS.map((s) => (
            <Panel key={s.title} className="p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <Pill>{s.adr}</Pill>
              </div>
              <h3 className="mt-4 text-base font-semibold text-body">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{s.text}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {/* ───────────────────  hermetic intelligence  ─────────────────── */}
      <Section
        label="Deterministic minds · ADR-0012"
        title="AI-facing tests run hermetically: cassettes and MockBrain."
        lead="CI that calls live providers is flaky, slow, and priced — and cannot reproduce failures deterministically. Vaerion's eval methodology replaces the network with two deterministic devices."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Bullets
              items={[
                "Cassettes: recorded provider transcripts replayed verbatim — including streaming boundaries and error responses.",
                "MockBrain: a seeded virtual provider with byte-identical outputs for the same seed — no network, no credentials.",
                "A cassette change is a reviewed contract change, not a test detail.",
                "Golden eval fixtures regenerate only via an explicit bless command that renders diffs; silent updates are forbidden.",
              ]}
            />
            <ArrowLink href="#/developers">Use it in your first run</ArrowLink>
          </div>
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <Database className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-base font-semibold text-body">The compensating control</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              Hermetic evals under-approximate live model variance. A weekly shadow suite runs scenario suites against live providers and
              is report-only: it flags behavioral drift for human review and cassette re-recording — and never gates a merge.
            </p>
            <p className="mt-4 font-mono text-xs text-mutedfg">
              providers: {FACTS.providers.join(" · ")}
            </p>
          </Panel>
        </div>
      </Section>

      {/* ───────────────────  the law  ─────────────────── */}
      <Section
        label="The law"
        title="Measured contracts, not vibes."
        lead="The architecture is pinned by an ADR register, a version register, and a diagnostics catalog — each verified against the code on every build."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={`${FACTS.contracts.adrs}`} label="Architecture decisions" sub="each ratified, provisional, or superseded" />
          <Stat value={`${FACTS.contracts.versionSurfaces}`} label="Version surfaces" sub="single-version lockstep across the monorepo" />
          <Stat value={`${FACTS.contracts.ecodes}`} label="Stable E-codes" sub="additive-only: never reused, never remapped" />
          <Stat value={`${FACTS.contracts.apiPaths}`} label="API paths" sub="generated from the same contracts the CLI uses" />
        </div>
        <div className="mt-8 flex flex-col gap-5">
          <Callout kind="honesty" title="The honest corner of the register">
            ADR-0018 (TypeScript-on-Bun substrate) is explicitly provisional: ratification is a named human decision that has not been
            exercised, with a recorded migration path. Superseded records (ADR-0011) stay published — history is not rewritten.
          </Callout>
          <CTARow
            primary={
              <GoldButton href={`${FACTS.repoUrl}/tree/main/docs/adr`} external>
                Read the ADR register
              </GoldButton>
            }
            secondary={
              <GhostButton href="#/receipts">
                <FileText className="h-4 w-4" aria-hidden /> Receipts &amp; verification
              </GhostButton>
            }
          />
          <p className="flex items-center gap-2 text-sm text-mutedfg">
            <ShieldCheck className="h-4 w-4 text-trust" aria-hidden />
            The seams above are also the threat model's containment lines — see how they hold on the{" "}
            <a href="#/security" className="text-gold hover:text-gold-bright">
              security model
            </a>{" "}
            page.
          </p>
        </div>
      </Section>
    </>
  );
}
