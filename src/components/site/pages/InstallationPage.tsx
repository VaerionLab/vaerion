"use client";

import { Check } from "lucide-react";
import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, CodeBlock, Honesty, Pill, Bullets, ArrowLink } from "../primitives";
import DocsNav from "../DocsNav";

/* The honest channel map — mirrors docs/INSTALL.md and FACTS.install. */

function ChannelStatus({ status }: { status: string }) {
  if (status === "VERIFIED") {
    return (
      <Pill tone="trust">
        <Check className="h-3 w-3" aria-hidden /> VERIFIED
      </Pill>
    );
  }
  if (status.includes("UNVERIFIED")) {
    return <Honesty>UNVERIFIED — host-gated</Honesty>;
  }
  return <Honesty>Founder-gated</Honesty>;
}

export default function InstallationPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · Installation"
        title="Every channel delivers the same engine — and the map tells you which are proven."
        lead="The engine executes on the Bun runtime (ADR-0018). Any channel that does not find Bun teaches instead of guessing: E1600, exit 2, with the exact install command for your OS."
      >
        <DocsNav route="/docs/installation" />
      </PageHero>

      <Section tight label="Channel map" title="The honest status of every channel.">
        <div className="overflow-hidden rounded-2xl border border-edge">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Installation channels and their measured status</caption>
            <thead>
              <tr className="bg-surface-2/60">
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                  Channel
                </th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                  Command
                </th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {FACTS.install.channels.map((c) => (
                <tr key={c.name} className="border-t border-edge bg-surface">
                  <th scope="row" className="px-4 py-4 align-top font-medium text-body">
                    {c.name}
                    {!c.available ? <span className="sr-only"> — not published yet</span> : null}
                  </th>
                  <td className="px-4 py-4 align-top font-mono text-[12px] leading-relaxed text-mutedfg">{c.command}</td>
                  <td className="px-4 py-4 align-top">
                    <ChannelStatus status={c.status} />
                    <p className="mt-1.5 max-w-[26ch] text-xs leading-relaxed text-mutedfg">{c.status}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="honesty" title="The universal installer URL is not live yet">
          <code className="font-mono">curl -fsSL https://vaerion.dev/install | sh</code> is verified end-to-end (install → update → uninstall,
          nothing left behind), but the vaerion.dev URL goes live with the release train. Until then, GitHub Releases and the source paths are
          the real download surface.
        </Callout>
      </Section>

      <Section tight label="Option E" title="From source — the audit path.">
        <CodeBlock
          title="from source (verified)"
          code={`git clone <repository-url> vaerion && cd vaerion
bun install                      # workspace-internal resolution, no global state
bun run tools/verify.ts          # the verification gates
bun run packages/vaerion/src/cli/vae.ts --version
alias vae="bun run packages/vaerion/src/cli/vae.ts"`}
        />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          <code className="font-mono text-gold">tools/verify.ts</code> must print <code className="font-mono">ALL GATES GREEN</code> and writes
          its measured result to <code className="font-mono">.vaerion-verification.json</code>. If any gate fails, the engine is not verified on
          your machine.
        </p>
      </Section>

      <Section tight label="Option F" title="GitHub Releases — signed, offline, no account needed.">
        <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg md:text-base">
          Every release publishes its full signed artifact set: the source tarball, the vaerion-demo.vxn bundle, SHA256SUMS, MANIFEST.json with
          its Ed25519 signature, the public key, and VERIFY.md. Three verification legs, exactly as a fresh consumer runs them:
        </p>
        <CodeBlock
          title="release verification — three legs"
          code={`# leg 1: artifact integrity
sha256sum --check SHA256SUMS

# leg 2: the engine's own verifier — needs only bun, no repository:
tar -xzf vaerion-<version>-source.tar.gz
bun run vaerion-<version>/tools/dist-verify.ts \\
  --manifest MANIFEST.json --sig MANIFEST.json.sig --pub release-signing.pub

# leg 3: an independent implementation (openssl, raw decoded signature):
base64 -d MANIFEST.json.sig > sig.raw
openssl pkeyutl -verify -pubin -inkey release-signing.pub \\
  -rawin -sigfile sig.raw -in MANIFEST.json`}
        />
        <div className="mt-6">
          <ArrowLink href={FACTS.releasesUrl} external>
            GitHub Releases — {FACTS.release.tag} ({FACTS.release.status})
          </ArrowLink>
        </div>
      </Section>

      <Section tight label="Requirements" title="What your machine needs.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <Bullets
              items={[
                "Runtime: Bun 1.3+ (engine and CLI). The npm channel line documents Bun 1.2+ on PATH as its floor.",
                "OS: Linux / macOS / Windows (WSL2 for the POSIX channels; a native winget channel is prepared).",
                "Network: none required for local operation — the model gateway is the single sanctioned egress and only runs when you invoke it.",
                "Disk: a workspace-local .vaerion/ store.",
              ]}
            />
          </Panel>
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">What installation does NOT do</h3>
            <div className="mt-4">
              <Bullets
                tone="trust"
                items={[
                  "No global daemons, no background services, no launch agents.",
                  "No telemetry — the config guard accepts exactly one value (telemetry.enabled: false); constitutional check C1/C6 enforces no undeclared network primitives.",
                  "No writes outside your workspace directory (.vaerion/ and vaerion.lock live in the workspace root) and the install prefix you chose.",
                ]}
              />
            </div>
          </Panel>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href="#/docs/getting-started">Continue: the 15-minute journey</ArrowLink>
          <ArrowLink href="#/docs/troubleshooting">Something refused? Troubleshooting</ArrowLink>
        </div>
      </Section>
    </>
  );
}
