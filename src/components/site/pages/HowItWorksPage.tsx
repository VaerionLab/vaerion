"use client";

import { Package, CircleCheck, FileText, ReceiptText, Lock, ShieldCheck } from "lucide-react";
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
import { TrustPipeline } from "../diagrams";

/* The annotated demo manifest — verbatim from examples/vaerion-demo/DEMO.md. */
const MANIFEST = `schemaVersion: "0.1"          # config schema version (E1202 otherwise)
project:
  name: vaerion-demo          # lowercase kebab; used in policy ids + bundles
research:
  capabilities:
    - name: demo-docs         # a named capability: sources + fencing + caps
      sources:
        - { kind: local, path: "./sources" }
      fencing: untrusted      # content is data, never instructions
      maxItems: 100
telemetry:
  enabled: false              # constitutional guard: false is the only value
                              # the engine accepts`;

const PIPELINE =
  "declared capability → broker decision per source (journaled) → fingerprint → fence → blob CAS → evidence → local index → query → citations → context pack → snapshot → receipt";

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From a declared capability to a byte-identical bundle — five moves, all local."
        lead="Vaerion turns an agent action into evidence by construction: identity is declared, work runs through a fail-closed broker, every step journals, receipts fold from the journal, and the output verifies independently of the process that made it."
      >
        <CTARow
          primary={
            <GoldButton href="#/developers">
              Get started <CircleCheck className="h-4 w-4" aria-hidden />
            </GoldButton>
          }
          secondary={<GhostButton href="#/architecture">See the architecture</GhostButton>}
        />
      </PageHero>

      {/* ───────────────────  the path at a glance  ─────────────────── */}
      <Section
        label="The path"
        title="Agent → Governance → Decision → Execution → Receipt → Verification."
        lead="The six stages below are not documentation aspirations — they are the run pipeline itself, journaled end to end and closed by a receipt. The final stage is drawn solid because it is the deposit: the process ends, the evidence remains."
      >
        <TrustPipeline />
      </Section>

      {/* ───────────────────  step 1 — declare  ─────────────────── */}
      <Section
        id="declare"
        label="Step 1 · Declare"
        title="Write the agent's identity into vaerion.yaml."
        lead="Capabilities are declared before they can be requested. The manifest is a strict-schema contract — unknown keys are rejected (E1201), drift is refused instead of guessed."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <CodeBlock title="vaerion.yaml — demo workspace" code={MANIFEST} />
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "vae init scaffolds vaerion.yaml plus the .vaerion/ workspace — templates: minimal (default), demo, agent.",
                "Declarations are ceilings, not promises: a declared capability can still be denied by policy.",
                "Fencing marks untrusted content as data, never instructions — prompt injection has no path to authority.",
                "telemetry.enabled is a constitutional guard: false is the only value the engine accepts.",
              ]}
            />
            <p className="text-sm text-mutedfg">
              Every template is byte-stable and validates against the strict config law. Unknown templates are a usage error (E1203);
              an existing manifest is never overwritten.
            </p>
          </div>
        </div>
      </Section>

      {/* ───────────────────  step 2 — broker-gated run  ─────────────────── */}
      <Section
        id="run"
        label="Step 2 · Run"
        title="The work executes through the fail-closed broker."
        lead="A run is not a prompt with hopes attached. Each privileged step is decided by the broker, the decision is journaled, and only then does anything execute."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center gap-5">
            <Terminal
              title="vae — a broker-gated run"
              lines={[...FACTS.heroTerminal.slice(0, 5)]}
            />
            <p className="font-mono text-[11px] leading-relaxed text-mutedfg">
              output shape distilled from docs/QUICKSTART.md — your machine prints your run id
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <Panel className="p-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">The one research pipeline</p>
              <p className="mt-3 break-words font-mono text-xs leading-relaxed text-mutedfg">{PIPELINE}</p>
              <p className="mt-3 text-sm leading-relaxed text-mutedfg">
                Every stage is attributed and hash-chained. A policy deny stops the run (exit 3); a prompt policy pauses it with a durable
                gate for <span className="font-mono text-body">vae resume</span>.
              </p>
            </Panel>
            <Bullets
              tone="trust"
              items={[
                "Law of sequence: decide → journal → act. An action without a journaled decision is a defect (E1304).",
                "Fail-closed: an undecided or un-evaluable request is a deny (E1301) — absence of permission is permission's absence.",
                "Action parameters are redacted before journaling; secrets never become journal content.",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ───────────────────  step 3 — the journal  ─────────────────── */}
      <Section
        id="journal"
        label="Step 3 · Journal"
        title="Every step lands on an append-only, blake3-chained journal."
        lead="One NDJSON file per run under .vaerion/journal/, written by exactly one writer holding an exclusive-create lock. Sequence numbers are gapless and monotonic; call sites never choose them."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Terminal
            title="vae — inspect and verify"
            lines={[
              { kind: "cmd", text: "vae journal ls                       # your run is here" },
              { kind: "cmd", text: "vae journal show <RUN_ID>            # the full event narrative" },
              { kind: "cmd", text: "vae journal verify <RUN_ID>          # the blake3 chain holds — measured, now" },
              { kind: "ok", text: "ok: true  chain: intact  events: 42  blake3 ✓" },
              { kind: "cmd", text: "vae explain <RUN_ID>                 # the same run, as a human story" },
            ]}
          />
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "Record kinds are fixed by contract: meta, evt, decision, gate, snapshot, receipt.",
                "Each record links to the previous record's blake3 hash — retroactive edits are impossible by design.",
                "verify walks the chain and reports the first broken index; silent truncation is forbidden.",
                "explain reconstructs decisions, gates, events, and the gateway metering rollup from the same journal.",
              ]}
            />
            <ArrowLink href="#/receipts">What verification recomputes</ArrowLink>
          </div>
        </div>
      </Section>

      {/* ───────────────────  step 4 — receipt + bundle  ─────────────────── */}
      <Section
        id="package"
        label="Step 4 · Seal"
        title="The receipt folds. The bundle builds. The bytes match."
        lead="The run closes with a receipt computed as a fold over its journal — it can never disagree with it. Packaging (ADR-0016) extends the same determinism to deliverables."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <CodeBlock
              title="reproducible output"
              code={`vae package build                              # → .vaerion/package/vaerion-demo.vxn + vaerion.lock
vae package build --out second.vxn             # build it again
vae package verify .vaerion/package/vaerion-demo.vxn`}
            />
            <p className="text-sm leading-relaxed text-mutedfg">
              The two bundles are byte-identical — same inputs, same bytes. Entries are canonically ordered, compression is zstd at a
              pinned level, and content identity is blake3. The build is journaled and closes with its own receipt.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <Bullets
              tone="trust"
              items={[
                "vaerion.lock is regenerated by the build — generated, committed, never hand-edited.",
                "Extension artifacts are pin-verified before they are bundled into the .vxn.",
                "verify is a pure check: digests recomputed, pins compared, content never executed.",
                "A digest that disagrees with config AND the generated lock seal is a hard failure — the digest-swap defense.",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ───────────────────  step 5 — verify independently  ─────────────────── */}
      <Section
        id="receive"
        label="Step 5 · Verify"
        title="What the developer receives."
        lead="Verification needs nothing from the process that produced the artifacts — any later process, on any machine with the same toolchain, recomputes the evidence from the bytes."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ReceiptText,
              title: "A receipt",
              text: "The closing record of the run — folded from the journal, tamper-evident, portable.",
            },
            {
              icon: FileText,
              title: "A verified journal",
              text: "An append-only blake3 chain you can re-check years later with vae journal verify.",
            },
            {
              icon: Package,
              title: "A byte-identical .vxn",
              text: "Rebuild it twice and compare digests yourself — reproducibility is the proof.",
            },
            {
              icon: Lock,
              title: "vaerion.lock",
              text: "The generated seal over config, extension pins, and the bundle digest.",
            },
          ].map((c) => (
            <Panel key={c.title} className="p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-body">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{c.text}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "vae provenance recomputes every digest that can be recomputed from an artifact's bytes.",
                "vae doctor verifies config, every journal chain, the CAS, evidence triangulation, and both audit chains — no network.",
                "vae tour walks the engine read-only: it points at real commands, it never executes them.",
              ]}
            />
            <Callout kind="security" title="Trust becomes a property of the bytes">
              The receipt on disk verifies independently of the process that produced it. Whether the run happened five minutes or five
              months ago makes no difference to the check.
            </Callout>
            <CTARow
              primary={
                <GoldButton href="#/receipts">
                  Receipts &amp; verification <ShieldCheck className="h-4 w-4" aria-hidden />
                </GoldButton>
              }
              secondary={<GhostButton href="#/governance">How the broker decides</GhostButton>}
            />
          </div>
          <Terminal
            title="vae — independent verification"
            lines={[
              { kind: "cmd", text: "vae journal verify <RUN_ID>                        # chain holds" },
              { kind: "cmd", text: "vae package verify .vaerion/package/vaerion-demo.vxn" },
              { kind: "ok", text: "digests recomputed · pins compared · pure check ✓" },
              { kind: "cmd", text: "vae provenance .vaerion/package/vaerion-demo.vxn    # evidence, from the bytes" },
              { kind: "cmd", text: "vae doctor                                          # the whole workspace, no network" },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
