"use client";

/**
 * Vaerion — Vision (Phase 12, order section 3: "Vision").
 *
 * The thesis page. It quotes the constitutions of record rather than
 * paraphrasing them, and separates what EXISTS (measured) from what is
 * RESERVED (declared, not built) — the honesty law in site form.
 *
 * Citations: docs/constitution/VAERION_CONSTITUTION_v1.7.md (constitution
 * of record per site-data/vaerion-status.json); the Volume IV authority
 * tree (constitution/INDEX.md); ADR-0017 (reserved cloud seams);
 * FACTS.flow; docs/vaerion-master-blueprint.md.
 */

import { FACTS } from "../../site/facts";
import { ArrowLink, Bullets, Callout, CTARow, GhostButton, GoldButton, Panel, Pill, Section } from "../../site/primitives";

const PHASES = [
  {
    id: "01",
    name: "Proof",
    state: "exists",
    line: "The engine: event spine, broker, journals, receipts, verification — all local, all measured.",
  },
  {
    id: "02",
    name: "Adoption",
    state: "launching",
    line: "The distribution: signed releases, packaging channels, editor surfaces, the docs of record.",
  },
  {
    id: "03",
    name: "Trust",
    state: "reserved",
    line: "Federation of verification: third parties recompute receipts without trusting the runner.",
  },
  {
    id: "04",
    name: "Ecosystem",
    state: "reserved",
    line: "An economy of receipted capabilities — built on the extension kit, governed by the same law.",
  },
] as const;

export function VisionPage() {
  return (
    <>
      <Section className="border-b border-edge">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="gold">the vision</Pill>
          <Pill tone="neutral">constitution of record: v1.7</Pill>
        </div>
        <h1 className="mt-5 max-w-3xl text-balance text-2xl font-medium leading-[1.15] tracking-[-0.01em] text-body md:text-[2rem]">
          Autonomous AI should show its work — cryptographically, locally, forever.
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-mutedfg">
          Agents now act: they plan, execute, call tools, spend money, touch systems. And when someone asks{" "}
          <em className="text-body not-italic">&ldquo;what exactly did it do, and by what authority?&rdquo;</em> the honest answer is usually a
          log you cannot verify and a vendor you must trust. Vaerion exists to make that answer unnecessary — every action governed before it
          runs, journaled as it runs, and provable after it runs.
        </p>
        <div className="mt-8">
          <CTARow
            primary={<GoldButton href="#/download">Install the engine</GoldButton>}
            secondary={<GhostButton href="#/runtime">See the five moves</GhostButton>}
          />
        </div>
      </Section>

      <Section tight label="The thesis" title="Four movements, one chain of custody.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.flow.map((step, i) => (
            <Panel key={step} className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-sm font-semibold text-body">{step}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-mutedfg">
                {step === "Identity"
                  ? "Principals and capabilities are declared before anything runs — no anonymous actors."
                  : step === "Governance"
                    ? "A fail-closed permission broker decides every action; refusal is a first-class, journaled outcome."
                    : step === "Evidence"
                      ? "Everything that happens lands on an append-only blake3-chained journal no process can rewrite."
                      : "Verification recomputes the chain and folds the receipt — proof that outlives the process."}
              </p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section tight label="The law" title="Three documents, one authority tree, no exceptions.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="p-5">
            <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-body">The Design Bible</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-mutedfg">
              VAERION_DESIGN_BIBLE_v1.0 — the product law: what Vaerion is, the two-voice discipline (machine truth, human narrative), the
              honesty of absence.
            </p>
          </Panel>
          <Panel className="p-5">
            <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-body">The Visual System</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-mutedfg">
              VAERION_VISUAL_SYSTEM_v1.0.1 — the surface law: OLED-adjacent dark chambers, hairlines over shadows, gold reserved for verified
              evidence only.
            </p>
          </Panel>
          <Panel className="p-5">
            <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-body">The Implementation Constitution</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-mutedfg">
              The engineering law: registry before primitives, composition over redesign, citation-traced artifacts, silence filed — never
              improvised.
            </p>
          </Panel>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-mutedfg">
          The full tree — amendments, interpretation requests, the trace index binding citations to artifacts — is machine-readable under{" "}
          <code className="font-mono text-gold">constitution/</code> and verified by{" "}
          <code className="font-mono text-gold">bun run vaerion:verify-constitution</code>.
        </p>
      </Section>

      <Section tight label="The horizon" title="What exists, what is launching, what is reserved.">
        <div className="overflow-hidden rounded-md border border-edge">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Vision phases and their honest state</caption>
            <thead>
              <tr className="bg-surface-2/60">
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                  Phase
                </th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                  State
                </th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {PHASES.map((phase) => (
                <tr key={phase.id} className="border-t border-edge bg-surface">
                  <th scope="row" className="px-4 py-4 align-top font-mono text-[12px] text-body">
                    {phase.id} · {phase.name}
                  </th>
                  <td className="px-4 py-4 align-top">
                    {phase.state === "exists" ? (
                      <Pill tone="trust">exists — measured</Pill>
                    ) : phase.state === "launching" ? (
                      <Pill tone="gold">launching</Pill>
                    ) : (
                      <Pill tone="neutral">reserved — declared, not built</Pill>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-[13px] leading-relaxed text-mutedfg">{phase.line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="info" title="Reserved is a promise with a boundary">
          Cloud seams are reserved by ADR-0017 — declared in the architecture, absent from the binary. The engine sells nothing it has not
          built, and the surfaces of record list what is not yet true (see{" "}
          <a href="#/" className="text-gold underline decoration-gold/40 underline-offset-2">
            the home page
          </a>
          , &ldquo;What Vaerion is not&rdquo;).
        </Callout>
        <Panel className="mt-6 p-6">
          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mutedfg">Where to go deeper</p>
          <div className="mt-3">
            <Bullets
              items={[
                "The Knowledge Interface — the civilization archive, citation-first: #/knowledge",
                "The complete conformance record of all eleven stages: src/vaerion/docs/reports/VAERION_COMPLETE_CONFORMANCE_REPORT.md",
                "The master blueprint: docs/vaerion-master-blueprint.md",
              ]}
            />
          </div>
          <div className="mt-4">
            <ArrowLink href="#/knowledge">Enter the Knowledge Interface</ArrowLink>
          </div>
        </Panel>
        <p className="mt-6 font-mono text-[11px] leading-relaxed text-mutedfg">
          page authority: docs/constitution/VAERION_CONSTITUTION_v1.7.md · constitution/INDEX.md · ADR-0017 · FACTS — confidence: derived from
          the records cited
        </p>
      </Section>
    </>
  );
}
