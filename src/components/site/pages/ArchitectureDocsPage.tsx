"use client";

import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, Bullets, ArrowLink, Pill } from "../primitives";
import { LayerDiagram, ReceiptChain } from "../diagrams";
import DocsNav from "../DocsNav";

type AdrStatus = "ratified" | "provisional" | "superseded";

const ADRS: { n: string; title: string; status: AdrStatus; note?: string }[] = [
  { n: "0001", title: "Monorepo + workspace single-version policy", status: "ratified", note: "lockstep versioning is the release law" },
  { n: "0002", title: "Versioned event spine envelope", status: "ratified", note: "registry + golden-enforced envelopes" },
  { n: "0003", title: "Contract-first specs drive SDK generation", status: "ratified", note: "the C4 contract-sync gate" },
  { n: "0004", title: "Centralized permission broker", status: "ratified", note: "fail-closed broker, journaled decisions" },
  { n: "0005", title: "Tiered intelligence, progressive enhancement", status: "ratified" },
  { n: "0006", title: "Event-sourced run journals, checkpoint chaining", status: "ratified", note: "blake3 chain, single writer" },
  { n: "0007", title: "Strict-subset YAML (vaerion.yaml) manifests", status: "ratified", note: "schema-enforced manifests" },
  { n: "0008", title: "SQLite WAL/FTS5 local store", status: "ratified" },
  { n: "0009", title: "WASI P2 components through the capability broker", status: "ratified", note: "extension kit alpha; native WASI hosting remains on the substrate migration path" },
  { n: "0010", title: "Loopback daemon with pairing token", status: "ratified", note: "first-run pairing test-proven" },
  { n: "0011", title: "tokio + axum + tower stack", status: "superseded", note: "by ADR-0018 (substrate) and ADR-0020 (daemon HTTP mechanism)" },
  { n: "0012", title: "Cassettes / hermetic evals", status: "ratified", note: "for the contract layer; real provider recordings remain an open item in the risk ledger" },
  { n: "0013", title: "OS keychain first, env fallback", status: "ratified", note: "secrets never enter journals or bundles" },
  { n: "0014", title: "Stable diagnostics catalog (E-codes)", status: "ratified", note: "additive codes, never reused" },
  { n: "0015", title: "Per-platform exec sandbox matrix", status: "ratified", note: "for the v0.1 profile; hardening matrix tracked in the risk ledger" },
  { n: "0016", title: "Reproducible .vxn bundles", status: "ratified", note: "byte-identical rebuild test-proven; digest-swap defense enforced" },
  { n: "0017", title: "Reserved cloud-seam interfaces, intentionally unimplemented in v0.1", status: "ratified", note: "C1/C7 fail the run if transport appears without a superseding ADR" },
  { n: "0018", title: "Engine substrate: TypeScript on Bun", status: "provisional", note: "pending Founder ratification; explicit migration path recorded in the ADR" },
  { n: "0019", title: "Single sanctioned gateway transport egress", status: "ratified", note: "C7 proves the single egress site" },
  { n: "0020", title: "Daemon HTTP stack on the TypeScript substrate", status: "ratified", note: "loopback-only binding, pairing token, single wire-client site" },
];

function StatusPill({ status }: { status: AdrStatus }) {
  if (status === "ratified") return <Pill tone="trust">ratified</Pill>;
  if (status === "provisional") return <Pill tone="warn">provisional</Pill>;
  return <Pill>superseded</Pill>;
}

export default function ArchitectureDocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · Architecture"
        title="Four layers, one spine — and every decision written down."
        lead="Dependencies point one way: downward. The kernel is deterministic, the spine is append-only, surfaces are thin, and the layer law is enforced by layerlint on every build. Below the diagram: the full decision register, with each record's status."
      >
        <DocsNav route="/docs/architecture" />
      </PageHero>

      <Section tight label="The layers" title="L4 → L0, no ambient behavior anywhere.">
        <LayerDiagram />
      </Section>

      <Section tight label="Philosophy" title="Three laws carry the whole design.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Panel className="p-6">
            <h3 className="font-mono text-sm font-semibold text-gold">ADR-0003 · Contracts first</h3>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              Specs under <code className="font-mono">spec/</code> are contracts: the error catalog, event registry, schemas, OpenAPI, and the
              WIT world. Evolution within a major version is additive-only — nothing removed or renamed — and every contract change is mirrored
              in the implementation the same commit.
            </p>
          </Panel>
          <Panel className="p-6">
            <h3 className="font-mono text-sm font-semibold text-gold">ADR-0006 · The single-writer spine</h3>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              One event spine: append-only, blake3-chained journals with exactly one writer. Every step is attributed and hash-chained; a torn
              crash tail is the only thing recovery may truncate, and it re-seals with an auditable note.
            </p>
          </Panel>
          <Panel className="p-6">
            <h3 className="font-mono text-sm font-semibold text-gold">L0 · The deterministic kernel</h3>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              Envelope, clock, errors, config — deterministic primitives with nothing ambient and nothing hidden. Golden fixtures produced by
              the engine double as conformance vectors for any future substrate.
            </p>
          </Panel>
        </div>
      </Section>

      <Section tight label="Proof, constructed" title="How a run becomes evidence.">
        <ReceiptChain />
      </Section>

      <Section
        label="Decision register"
        title="Every architectural decision, and its status — no decision left unclear."
        lead="Each record carries exactly one of three states: Ratified (accepted, implemented, enforced by the verification gates), Provisional (explicitly provisional with a recorded migration path), or Superseded (the record states what replaced it)."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {ADRS.map((a) => (
            <div key={a.n} className="flex h-full flex-col rounded-2xl border border-edge bg-surface p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-gold">ADR-{a.n}</span>
                <StatusPill status={a.status} />
              </div>
              <p className="mt-2 text-sm font-medium leading-snug text-body">{a.title}</p>
              {a.note ? <p className="mt-1.5 text-xs leading-relaxed text-mutedfg">{a.note}</p> : null}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Callout kind="honesty" title="The substrate is provisional — stated in the register, not footnoted">
            ADR-0018 binds behavior, not the language: the journal format, envelope schema, event registry, error catalog, and bundle format are
            defined in <code className="font-mono">spec/</code> and are language-neutral. If the Founder ratifies a different substrate for the
            shipping milestones, the migration is derivational — port the mirror against stable law, replay the golden fixtures, rebuild the
            reference bundle byte-identically, pass the parity suites. A port that cannot reproduce the goldens is a fork, not the migration.
          </Callout>
        </div>

        <div className="mt-6">
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">Read the records themselves</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "docs/adr/README.md — the register of record with links to every ADR",
                  "docs/adr/0018-engine-substrate-typescript-bun.md — the provisional substrate and its migration path",
                  "docs/adr/0019 + 0020 — the security seams: one egress site, loopback daemon",
                ]}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              <ArrowLink href={`${FACTS.repoUrl}/tree/main/docs/adr`} external>
                docs/adr/ in the repository
              </ArrowLink>
              <ArrowLink href="#/docs/security">The security model</ArrowLink>
            </div>
          </Panel>
        </div>
      </Section>
    </>
  );
}
