"use client";

import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, Bullets, ArrowLink, Pill, Honesty } from "../primitives";
import { SecuritySeams } from "../diagrams";
import DocsNav from "../DocsNav";

/* Distilled from docs/security/THREAT-MODEL.md, MITIGATIONS.md,
   RISK-LEDGER.md, and SIGNING-CEREMONY.md. */

const PROPERTIES: [string, string][] = [
  ["P-LOOPBACK", "The daemon never binds a non-loopback address — E2001 is thrown before listen."],
  ["P-PAIRING", "Every state-changing route requires the pairing token (timing-safe compare); shutdown additionally requires the token echoed in the body (E2004)."],
  ["P-NO-EGRESS", "The engine contains exactly one transport egress site — the gateway's. The daemon surface has none; the SDK's single wire-client site is loopback-only (E2006). Enforced mechanically by constitutional check C7 on every verification run."],
  ["P-PIN-THEN-RUN", "An extension artifact whose sha256 does not match its pin is never executed (E2100 before any spawn); protocol violations kill the child; hangs are reaped by timeout."],
  ["P-SECRETS-NOWHERE", "Secrets resolve keychain-first (ADR-0013), are supplied via environment indirection, and are never written to journals, receipts, or bundles. C5 scans the tree for secret material."],
  ["P-PACKAGE-PURE", "verify and import are pure checks — digests recomputed, pins compared, content never executed. A digest swap must defeat config AND the generated lock seal simultaneously."],
  ["P-REPRODUCIBLE", "Identical inputs produce byte-identical bundles (blake3 identity, pinned compression) — so tampering with release artifacts is detectable by rebuild-and-compare."],
];

const ADVERSARIES: [string, string][] = [
  ["A1 — local co-resident process", "can reach TCP loopback and read world-readable files; targets the daemon API and journals"],
  ["A2 — malicious extension publisher", "ships an artifact + manifest; wants execution beyond granted capabilities"],
  ["A3 — malicious workspace author", "a manifest or swapped bundle a victim is asked to build/verify; wants import to execute content or digest-swap fraud"],
  ["A4 — network attacker / compromised provider", "controls gateway traffic; wants secret exfiltration or prompt/response tampering"],
  ["A5 — artifact tamperer", "modifies release artifacts in transit or at rest; wants a backdoored engine or bundle shipped"],
];

const LEDGER_HEADLINE: [string, string, string][] = [
  ["R-1", "high", "Exec sandbox — the v0.1 profile ships; OS-level sandbox profiles for arbitrary third-party extensions are not yet enforced on every platform. Open, tracked for post-rc hardening."],
  ["R-2", "high", "Release signing trust anchor — CLOSED by the production key ceremony; the residual is labeled (generated under written directive, not air-gapped; a hardware-custodied re-ceremony remains available via the recorded rotation path)."],
  ["R-3", "medium", "Gateway — per-process circuit breaker state does not share across daemon restarts. Open."],
  ["R-4", "medium", "Evals — no real-provider cassette recorded (no credentials in the build environment); hermetic evals run on cassettes and mockbrain. Open — Founder-gated."],
  ["R-5", "medium", "Daemon — SSE replay cursors are read windows for token holders; a leaked token grants read access until rotated. Open."],
  ["R-6", "low", "Packaging — re-verification against a newer extension artifact requires a rebuild rather than an in-place upgrade. Open."],
  ["R-7", "low", "Disclosure — no automated public security-reporting channel until the hosted infrastructure exists; the private email route is live. Open — Founder-gated."],
];

export default function SecurityDocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · Security"
        title="Security as an architectural property — enforced by code, not by promise."
        lead="The threat model states the trust boundaries and the properties the architecture is required to hold; the mitigation record maps each adversary to its implemented control and its evidence class. Nothing here asks to be believed."
      >
        <DocsNav route="/docs/security" />
      </PageHero>

      <Section tight label="The seams" title="Where trust boundaries sit.">
        <SecuritySeams />
      </Section>

      <Section tight label="Guarantees" title="The properties the architecture is required to hold.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PROPERTIES.map(([id, text]) => (
            <div key={id} className="rounded-2xl border border-edge bg-surface p-5">
              <p className="font-mono text-xs font-semibold tracking-wide text-trust">{id}</p>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tight label="Adversaries" title="Who the design defends against.">
        <Panel className="p-6">
          <Bullets items={ADVERSARIES.map(([a, t]) => `${a} — ${t}`)} />
          <p className="mt-4 text-sm leading-relaxed text-mutedfg">
            The mitigation record (MITIGATIONS.md) maps every adversary to its control and evidence class: T = automated test in the
            verification suite, C = constitutional check on every run, L = layerlint boundary, I = code inspection at the cited module.
          </p>
        </Panel>
      </Section>

      <Section
        tight
        label="Remaining risk"
        title="A seven-item ledger — known, bounded, tracked. No critical finding is open."
        lead="Anything not mitigated is an open item with a severity, an owner, and an exit criterion. The ledger is the honest cost of the honesty law."
      >
        <div className="space-y-2">
          {LEDGER_HEADLINE.map(([id, sev, text]) => (
            <div key={id} className="flex flex-col gap-2 rounded-xl border border-edge bg-surface p-4 sm:flex-row sm:items-start sm:gap-4">
              <div className="flex shrink-0 items-center gap-2 sm:w-36">
                <span className="font-mono text-xs font-semibold text-gold">{id}</span>
                <Pill tone={sev === "high" ? "warn" : "neutral"}>{sev}</Pill>
              </div>
              <p className="text-sm leading-relaxed text-mutedfg">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Callout kind="info" title="Owner structure">
            Founders own decisions and resources outside engineering (publication, credentials, ceremonies); engineering owns everything with an
            exit criterion that code can close. Each item in RISK-LEDGER.md names its owner and its exit criterion.
          </Callout>
        </div>
      </Section>

      <Section tight label="Release signing" title="The ceremony, summarized.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">How releases are signed</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "A production Ed25519 key lives in exactly one place: the GitHub Actions secret RELEASE_SIGNING_KEY (sealed-box encrypted at rest).",
                  "The public key of record lives in the repository and travels inside every release artifact set, manifest-bound — consumer verification needs nothing but the artifacts themselves.",
                  "The key fingerprint is recorded in docs/security/SIGNING-CEREMONY.md — the ceremony document is the source of record.",
                  "The private key cannot be recovered — from GitHub, the repository, or any session. A recoverable key is a stealable key.",
                  "Rotation never rewrites history: old tags keep verifying against the keys shipped beside them.",
                  "Posture check: a release whose pack report says the bootstrap key was generated was NOT signed by this ceremony's key — treat it as unsigned and stop.",
                ]}
              />
            </div>
          </Panel>
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">The three verification legs</h3>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-mutedfg">
              <li>
                <span className="font-mono text-gold">1</span> — <code className="font-mono">sha256sum --check SHA256SUMS</code>: artifact
                integrity.
              </li>
              <li>
                <span className="font-mono text-gold">2</span> — the engine&apos;s own verifier (
                <code className="font-mono">tools/dist-verify.ts</code>) over the manifest, signature, and public key; needs only Bun, no
                repository.
              </li>
              <li>
                <span className="font-mono text-gold">3</span> — an independent implementation cross-check (openssl Ed25519 over the canonical
                manifest): the leg that catches a defect in leg 2 itself.
              </li>
            </ol>
            <div className="mt-5">
              <ArrowLink href="#/docs/installation">Run the three legs yourself</ArrowLink>
            </div>
          </Panel>
        </div>
      </Section>

      <Section tight label="Disclosure" title="Report privately. Never a public issue.">
        <Callout kind="security" title="The reporting route of record (SECURITY.md)">
          Security findings go directly and privately to the project owner at{" "}
          <a href={`mailto:${FACTS.contactEmail}`} className="text-gold underline-offset-4 hover:underline">
            {FACTS.contactEmail}
          </a>
          . Include the command or API call, observed versus expected behavior, reproduction steps from a clean state, and — where possible —
          journal or receipt output demonstrating the finding.
        </Callout>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Honesty tone="info">automated channel not yet provisioned — tracked as R-7</Honesty>
          <span className="max-w-2xl text-sm leading-relaxed text-mutedfg">
            No security.txt or private-vulnerability-reporting toggle exists yet; this page does not claim a channel that does not exist. The
            private email route is live and taught.
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href={`${FACTS.repoUrl}/blob/main/docs/security/THREAT-MODEL.md`} external>
            THREAT-MODEL.md
          </ArrowLink>
          <ArrowLink href={`${FACTS.repoUrl}/blob/main/docs/security/MITIGATIONS.md`} external>
            MITIGATIONS.md
          </ArrowLink>
          <ArrowLink href={`${FACTS.repoUrl}/blob/main/docs/security/RISK-LEDGER.md`} external>
            RISK-LEDGER.md
          </ArrowLink>
          <ArrowLink href={`${FACTS.repoUrl}/blob/main/docs/security/SIGNING-CEREMONY.md`} external>
            SIGNING-CEREMONY.md
          </ArrowLink>
        </div>
      </Section>
    </>
  );
}
