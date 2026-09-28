"use client";

import { Scale, UserCheck, Ban, ScrollText, Gavel, ReceiptText } from "lucide-react";
import { FACTS } from "../facts";
import {
  Section,
  PageHero,
  Panel,
  Pill,
  Bullets,
  CodeBlock,
  ArrowLink,
  Callout,
  CTARow,
  GoldButton,
  GhostButton,
} from "../primitives";
import { BrokerSequence } from "../diagrams";

/* E-code examples — transcribed from spec/errors.yaml and docs/CLI.md (measured). */
const ECODES = [
  {
    code: "E1300",
    name: "broker_denied",
    text: "The broker denied the requested capability. Fix: inspect the recorded decision (vae explain); request the narrowest needed grant.",
  },
  {
    code: "E1301",
    name: "broker_fail_closed",
    text: "The broker could not evaluate the request and denied it. Un-evaluable requests are never allowed by law.",
  },
  {
    code: "E1600",
    name: "usage_error",
    text: "A taught error: the fix hint says re-run with --help — help always teaches and never executes.",
  },
  {
    code: "E1801",
    name: "undeclared tool call",
    text: "In the agent loop, a tool not declared in vaerion.yaml and granted by policy is refused fail-closed.",
  },
  {
    code: "E2100",
    name: "extension_artifact_digest_mismatch",
    text: "The artifact does not match its pinned digest — it is never executed.",
  },
  {
    code: "E2206",
    name: "vxn_verify_failed",
    text: "Bundle verification completed with findings: the bundle must not be imported, distributed, or executed.",
  },
] as const;

export default function GovernancePage() {
  return (
    <>
      <PageHero
        eyebrow="Governance"
        title="Governance is code, not suggestions."
        lead="Agent frameworks put rules in prompts. Vaerion puts them in an engine: capabilities declared in a manifest, decisions made by a fail-closed broker, every outcome — allow or refuse — preserved as evidence."
      >
        <CTARow
          primary={
            <GoldButton href="#/how-it-works">See it in the developer journey</GoldButton>
          }
          secondary={<GhostButton href="#/security">The security model behind it</GhostButton>}
        />
      </PageHero>

      {/* ───────────────────  the broker law  ─────────────────── */}
      <Section
        label="The law"
        title="Decide → journal → act. In that order, every time."
        lead="One PermissionBroker mediates every privileged operation — filesystem, network, exec, model invocation, secret read, tool call — identically for every principal, including the human's own tools (ADR-0004)."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <BrokerSequence />
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "Six principal kinds: human, agent, tool, extension, research, system — checks never live at call sites.",
                "Capabilities are declared before they can be requested; grants are ceilings that only ever narrow.",
                "A declaration is never a guarantee of yes — policy evaluates first, and a deny stops the run (exit 3).",
                "An action fires only after its decision record exists in the journal (E1304 otherwise); parameters are redacted before journaling.",
              ]}
            />
            <Callout kind="security" title="Why one broker">
              Scattered checks drift and favor the trusted path. One broker is a single place to enforce fail-closed semantics — and a
              containment point against prompt injection: untrusted content can never mint authority.
            </Callout>
          </div>
        </div>
      </Section>

      {/* ───────────────────  human gates  ─────────────────── */}
      <Section
        label="Human authority"
        title="Durable gates that survive process death."
        lead="Ambiguous or irreversible power resolves through a durable human gate. The gate is a record on the spine — a crashed process does not erase it, and resolution is journaled and idempotent."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <CodeBlock
              title="resolving a gate (docs/CLI.md)"
              code={`vae resume <RUN_ID>                        # renders the pending human review:
                                           # question, options, the linked decision
vae resume <RUN_ID> --answer '{"approved": true}'`}
            />
            <p className="text-sm leading-relaxed text-mutedfg">
              Resume without <span className="font-mono text-body">--answer</span> first: the run restores deterministically from its
              journal and shows the review. A pending gate pauses the run (exit 0, awaiting) — nothing is silently skipped while it waits.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              tone="trust"
              items={[
                "Approval records an elevation — journaled and audited; agent runs continue after approval.",
                "A denial ends the run (exit 3); a duplicate resolution is refused (E1303) — the existing resolution is authoritative.",
                "Gates surface over the daemon API identically to the CLI — pollable and answerable through the runs endpoints (ADR-0010 §5).",
              ]}
            />
            <Panel className="p-5">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-gold" aria-hidden />
                <h3 className="text-sm font-semibold text-body">The only approval authority</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">
                For irreversible or ambiguous power, a human is the only approval authority — an agent cannot promote itself, and no
                prompt can re-roll a gate.
              </p>
            </Panel>
          </div>
        </div>
      </Section>

      {/* ───────────────────  refusal log  ─────────────────── */}
      <Section
        label="Refusals"
        title="Rejection is evidence too."
        lead="Denials are first-class observable facts. They land on their own hash-chained log — .vaerion/refusals.log — checked by doctor alongside the journals, never suppressed."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <Ban className="h-5 w-5 text-failx" aria-hidden />
              <h3 className="text-sm font-semibold text-body">What lands there</h3>
            </div>
            <div className="mt-4">
              <Bullets
                items={[
                  "Every broker deny — with the principal, the capability, and the reason.",
                  "The refusal-log chain verifies like a journal: same hash-chain law, same evidence status.",
                  "The SDK exposes refusals(runId) and verifyRefusals() — machine parity with the doctor's refusal view.",
                  "vae doctor walks both chains (audit ledger + refusal log) on every health check.",
                ]}
              />
            </div>
          </Panel>
          <div className="flex flex-col justify-center gap-5">
            <Callout kind="info" title="The inversion that matters">
              In most tooling, a refusal is an error to be retried or silenced. Here it is a durable fact you can later point to: the
              system refused, here is when, here is why, and here is the hash that proves the record was not edited.
            </Callout>
            <p className="text-sm leading-relaxed text-mutedfg">
              An agent that tries to exceed its grants leaves a trail — which is exactly what you want when the question is{" "}
              <span className="text-body">what did it attempt, and what stopped it</span>.
            </p>
          </div>
        </div>
      </Section>

      {/* ───────────────────  E-codes  ─────────────────── */}
      <Section
        label="Diagnostics"
        title="E-codes are a stable contract, not log noise."
        lead={`${FACTS.contracts.ecodes} codes live in spec/errors.yaml — additive-only within v1: never reused, never remapped. Every entry carries a name, a summary, and a fix; the CLI renders the Fix: hint and a Docs: anchor next to each error.`}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ECODES.map((e) => (
            <Panel key={e.code} className="p-5">
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4 text-gold" aria-hidden />
                <span className="font-mono text-sm font-semibold text-gold">{e.code}</span>
                <span className="font-mono text-xs text-mutedfg">{e.name}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{e.text}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-6">
          <ArrowLink href="#/docs/cli">Exit codes and diagnostics in the CLI reference</ArrowLink>
        </div>
      </Section>

      {/* ───────────────────  receipts as evidence  ─────────────────── */}
      <Section
        label="Evidence"
        title="Governance you can prove years later."
        lead="Because every decision lands on the hash-chained spine, the run's closing receipt folds from the same records. The governance trail and the verification trail are one artifact."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              tone="trust"
              items={[
                "The receipt can never disagree with the journal — it is computed as a fold over it.",
                "Refusals, gates, and elevations are part of the same chain — governance history is evidence history.",
                "A policy you cannot prove was enforced is a suggestion; Vaerion's governance output is a receipt.",
              ]}
            />
            <CTARow
              primary={
                <GoldButton href="#/receipts">
                  Receipts &amp; verification <ReceiptText className="h-4 w-4" aria-hidden />
                </GoldButton>
              }
              secondary={
                <GhostButton href={`${FACTS.repoUrl}/blob/main/docs/adr/0004-centralized-permission-broker.md`} external>
                  <ScrollText className="h-4 w-4" aria-hidden /> ADR-0004
                </GhostButton>
              }
            />
          </div>
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-gold" aria-hidden />
              <h3 className="text-sm font-semibold text-body">Policies over prompts, in one line each</h3>
            </div>
            <ul className="mt-4 space-y-3 font-mono text-xs leading-relaxed text-mutedfg">
              <li>prompt: "please don't touch files outside ./sources"</li>
              <li className="text-gold">policy: broker deny → journaled → exit 3 → refusal log</li>
              <li>prompt: "ask me before anything destructive"</li>
              <li className="text-gold">policy: durable gate → survives crash → vae resume</li>
            </ul>
          </Panel>
        </div>
      </Section>
    </>
  );
}
