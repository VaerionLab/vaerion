"use client";

import { FileWarning, CircleCheck, Lock, PackageCheck, Scale, ExternalLink } from "lucide-react";
import { FACTS } from "../facts";
import {
  Section,
  PageHero,
  Panel,
  Pill,
  Honesty,
  Bullets,
  CodeBlock,
  ArrowLink,
  Callout,
  CTARow,
  GoldButton,
  GhostButton,
} from "../primitives";
import { SecuritySeams } from "../diagrams";

/* Adversaries — transcribed from docs/security/THREAT-MODEL.md (measured). */
const ADVERSARIES = [
  {
    id: "A1",
    who: "Local co-resident process",
    wants: "The daemon API; workspace journals",
    held: "Loopback-only bind refused before listen (E2001); pairing token with timing-safe compare; shutdown requires the token echoed in the body.",
  },
  {
    id: "A2",
    who: "Malicious extension publisher",
    wants: "Code execution beyond granted capabilities",
    held: "sha256 digest verified before any spawn (E2100); every host call is a broker evaluation; protocol violations kill the child (E2102).",
  },
  {
    id: "A3",
    who: "Malicious workspace author",
    wants: "Package import executing content; digest-swap fraud",
    held: "verify/import are pure checks — content never executes; pins compared both directions against config AND the lock seal (E2201–E2205); fail-closed path law (E2204).",
  },
  {
    id: "A4",
    who: "Network attacker / compromised provider",
    wants: "Secret exfiltration; payload tampering; telemetry leak",
    held: "One egress site (C7 fails the build on any other); outbound payloads pass redaction middleware; keychain-first secrets never serialized into evidence.",
  },
  {
    id: "A5",
    who: "Artifact tamperer",
    wants: "Shipping backdoored engine or bundles",
    held: "Reproducible build — identical inputs are byte-identical, so tampering is detectable by rebuild-and-compare; sha256 + blake3 manifests with an Ed25519 signature over the manifest.",
  },
] as const;

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security model"
        title="A threat model first. Architecture second. Marketing never."
        lead="Vaerion's security posture is written down as adversaries and containment lines, and every mitigation carries evidence: an automated test, a constitutional check, or an architecture boundary that runs on every build."
      >
        <CTARow
          primary={
            <GoldButton href={`${FACTS.repoUrl}/blob/main/docs/security/THREAT-MODEL.md`} external>
              Read the threat model
            </GoldButton>
          }
          secondary={<GhostButton href="#/governance">How governance enforces it</GhostButton>}
        />
      </PageHero>

      {/* ───────────────────  adversaries  ─────────────────── */}
      <Section
        label="Posture"
        title="Five adversaries, five containment lines."
        lead="From docs/security/THREAT-MODEL.md: what each adversary can do, what they target, and the property the architecture is required to hold."
      >
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-edge">
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                    Adversary
                  </th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                    Primary target
                  </th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                    What holds
                  </th>
                </tr>
              </thead>
              <tbody>
                {ADVERSARIES.map((a) => (
                  <tr key={a.id} className="border-b border-edge/60 last:border-b-0 align-top">
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs font-semibold text-gold">{a.id}</p>
                      <p className="mt-1 font-medium text-body">{a.who}</p>
                    </td>
                    <td className="px-4 py-4 text-mutedfg">{a.wants}</td>
                    <td className="px-4 py-4 leading-relaxed text-mutedfg">{a.held}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </Section>

      {/* ───────────────────  seams  ─────────────────── */}
      <Section
        label="Mechanism"
        title="The seams that make the guarantees true."
        lead="Each seam is a single reviewed place in the code — one egress, one secrets port, one daemon listener, one extension boundary. Misuse is made difficult by architecture, not by policy documents."
      >
        <SecuritySeams />
        <div className="mt-6">
          <ArrowLink href="#/architecture">The same seams, as architecture</ArrowLink>
        </div>
      </Section>

      {/* ───────────────────  enforced mechanically  ─────────────────── */}
      <Section
        label="Enforcement"
        title="The build is the auditor."
        lead="The constitutional checks run on every verification run — locally and in CI. If a guarantee regresses, the build fails; no release train can outrun it."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-5">
            <Bullets
              tone="trust"
              items={[
                "C1/C5/C7: the egress-confinement, secret-material, and single-egress checks scan the engine on every run.",
                "Zero telemetry enforced mechanically: no analytics, no phone-home, no undeclared network — the check fails the build if that ever changes.",
                "Fail-closed readiness: unmeasurable means blocked. Exit 0 means READY; exit 5 prints the blocker list with a Fix for each.",
                "CI workflows are SHA-pinned and must re-run the single verification authority — no surface may re-implement the gates.",
              ]}
            />
            <Panel className="p-5">
              <div className="flex items-center gap-3">
                <PackageCheck className="h-5 w-5 text-gold" aria-hidden />
                <h3 className="text-sm font-semibold text-body">Release signing</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{FACTS.release.signing}.</p>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">
                Release distribution publishes sha256 + blake3 manifests and an Ed25519 signature over the manifest; verification is
                documented so it can be done independently.
              </p>
              <div className="mt-3">
                <Pill tone="warn">{FACTS.release.status}</Pill>
              </div>
            </Panel>
          </div>
          <CodeBlock
            title="verify a release yourself (docs/INSTALL.md path)"
            code={`# digests first — then the signature, independently
sha256sum -c MANIFEST.sha256
# Ed25519 verification per docs/ga/RELEASE-VERIFICATION.md
# (openssl pkeyutl -verify over the signed manifest)`}
          />
        </div>
      </Section>

      {/* ───────────────────  honesty  ─────────────────── */}
      <Section
        label="Honesty"
        title="Markers are a security control."
        lead="Every check in this project carries a label — VERIFIED (measured here), UNVERIFIED (not measurable in this environment), NEVER EXECUTED. A claim without evidence is marked, never smoothed over."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Panel className="p-5">
            <Honesty>UNVERIFIED — host-gated</Honesty>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              Single-binary installers (Homebrew / winget / dmg / rpm) are authored in packaging/ but cannot be measured on the hosts that
              would run them. Install from source or signed release tarballs today.
            </p>
          </Panel>
          <Panel className="p-5">
            <Honesty>Founder-gated</Honesty>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              npm and PyPI publish are release-train steps gated on a named human decision. The builds are verified; the publish is not
              claimed until it happens.
            </p>
          </Panel>
          <Panel className="p-5">
            <Honesty>Disclosure channel</Honesty>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              No automated private-vulnerability-reporting channel (security.txt) is provisioned yet. That gap is tracked openly in
              docs/security/RISK-LEDGER.md as R-7 — it is not claimed to exist.
            </p>
          </Panel>
        </div>
      </Section>

      {/* ───────────────────  disclosure  ─────────────────── */}
      <Section
        label="Disclosure"
        title="Found something? It goes to the project owner, privately."
        lead="Security findings are not public issues. The disclosure posture of record — docs/security/RISK-LEDGER.md — routes reports directly and privately to the project owner, Auren, at auren@vaerion.dev."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Bullets
              items={[
                "Include the command or API call, and the observed versus expected behavior.",
                "Reproduction steps from a clean state.",
                "Where possible, journal or receipt output demonstrating the finding.",
              ]}
            />
            <Callout kind="security" title="Residual exposures have owners">
              Anything not listed as mitigated in MITIGATIONS.md is an open item in docs/security/RISK-LEDGER.md with a severity, an
              owner, and an exit criterion. No critical finding is open at this release.
            </Callout>
            <CTARow
              primary={
                <GoldButton href={`${FACTS.repoUrl}/blob/main/SECURITY.md`} external>
                  SECURITY.md <ExternalLink className="h-4 w-4" aria-hidden />
                </GoldButton>
              }
              secondary={
                <GhostButton href={`${FACTS.repoUrl}/tree/main/docs/security`} external>
                  <Lock className="h-4 w-4" aria-hidden /> security docs
                </GhostButton>
              }
            />
          </div>
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-gold" aria-hidden />
              <h3 className="text-sm font-semibold text-body">Evidence classes in MITIGATIONS.md</h3>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["T", "an automated test in the verification suite"],
                ["C", "a constitutional check executed on every verification run"],
                ["L", "a layerlint architecture boundary"],
                ["I", "code inspection at the cited module"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start gap-3">
                  <dt className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gold/10 font-mono text-xs font-semibold text-gold">
                    {k}
                  </dt>
                  <dd className="leading-relaxed text-mutedfg">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-mutedfg">
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-trust" aria-hidden />
              Every threat-model row maps to a control and one of these evidence classes — the mapping is the document.
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-mutedfg">
              <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-warnx" aria-hidden />
              Security documentation of record lives in the repository; this page summarizes it and does not replace it.
            </p>
          </Panel>
        </div>
      </Section>
    </>
  );
}
