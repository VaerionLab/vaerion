"use client";

import { Github, MessagesSquare, Hash, ScrollText, LifeBuoy, Scale } from "lucide-react";
import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, Bullets, Honesty, ArrowLink, GoldButton, GhostButton, CTARow } from "../primitives";

/* The honest community plan. Channels that exist are linked; channels that
   do not exist yet carry their marker and no URL. */

const DISCORD_CHANNELS = [
  ["#announcements", "release notes and campaign closures, from the maintainer"],
  ["#general", "open discussion about the engine and agent verification"],
  ["#support", "usage help, pointed at by the support ladder below"],
  ["#bugs", "defect triage — public findings with their E-codes"],
  ["#feature-requests", "proposals before they take issue shape"],
  ["#showcase", "what you built with Vaerion"],
] as const;

const PILLARS = [
  {
    title: "The verification law",
    text: "Every change must leave all verification gates green before it is committed — through the single entrypoint, tools/verify.ts. If a gate fails, fix the root cause; never weaken a check to make a run pass.",
  },
  {
    title: "Contracts evolve additively",
    text: "Files under spec/ are contracts: additive-only within a major version, error codes never reused, and every contract change mirrored in the implementation the same commit. Generated files are regenerated, never hand-edited.",
  },
  {
    title: "Decisions are recorded",
    text: "Behavioral or structural decisions get an ADR in docs/adr/ — context, decision, consequences. Provisional decisions carry an explicit migration path.",
  },
  {
    title: "Commits are evidence",
    text: "A concise subject line, and a body that states what changed and how it was verified — authored under the project identity (Auren <auren@vaerion.dev>).",
  },
] as const;

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title="A community built on the same law as the engine: state what you measured."
        lead="Vaerion's community surfaces mirror its engineering culture — claims carry evidence, uncertainty is labeled, and review is a verification act. Here is where to be, and what is honest about each channel today."
      />

      {/* ─────────── github ─────────── */}
      <Section tight label="The repository" title="Where the work happens.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="flex flex-col p-6 md:p-8">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <Github className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-5 text-base font-semibold text-body">Issues and pull requests</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-mutedfg">
              Defects, feature requests, and changes all move through the public repository. Issue templates ask for the measured evidence: the
              verification record, exit codes, and the engine version. Pull requests stand or fall on the gates — the CI re-runs the full
              verification suite on every push and PR.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              <ArrowLink href={FACTS.issuesUrl} external>Issue tracker</ArrowLink>
              <ArrowLink href={`${FACTS.repoUrl}/blob/main/CONTRIBUTING.md`} external>CONTRIBUTING.md</ArrowLink>
            </div>
          </Panel>
          <Panel className="flex flex-col p-6 md:p-8">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <MessagesSquare className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-5 text-base font-semibold text-body">GitHub Discussions</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-mutedfg">
              Questions, ideas, announcements, and show-and-tell are organized into discussion categories: Q&amp;A for &quot;how do I&quot;,
              Ideas for proposals before they take issue shape, Announcements for release news, and Show and tell for what you built.
            </p>
            <div className="mt-4">
              <Honesty tone="info">being set up — link goes live with the launch</Honesty>
            </div>
            <div className="mt-5">
              <ArrowLink href={FACTS.discussionsUrl} external>Discussions</ArrowLink>
            </div>
          </Panel>
        </div>
      </Section>

      {/* ─────────── discord ─────────── */}
      <Section tight label="Discord" title="The planned channel layout.">
        <Callout kind="honesty" title="No invite URL exists yet — and none is published here">
          The Discord is structured for the launch but has not opened its doors. When it does, the invite will be published on this page and in
          the repository — nowhere else.
        </Callout>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Honesty>launching with the release train</Honesty>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DISCORD_CHANNELS.map(([channel, purpose]) => (
            <div key={channel} className="rounded-xl border border-edge bg-surface p-4">
              <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-gold">
                <Hash className="h-3 w-3" aria-hidden />
                {channel.slice(1)}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-mutedfg">{purpose}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─────────── contributing ─────────── */}
      <Section tight label="Contributing" title="Four pillars carry every accepted change.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PILLARS.map((p) => (
            <Panel key={p.title} className="p-6">
              <h3 className="text-base font-semibold text-body">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{p.text}</p>
            </Panel>
          ))}
        </div>
        <Callout kind="info" title="Where proposals start">
          Feature proposals begin in the Ideas discussion category — an issue is opened once a proposal has a concrete, testable shape. Usage
          questions belong in Q&amp;A. By contributing, you agree your contributions are licensed under {FACTS.license}.
        </Callout>
      </Section>

      {/* ─────────── conduct ─────────── */}
      <Section tight label="Code of conduct" title="Respectful, professional — and honest.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <ScrollText className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-5 text-base font-semibold text-body">The pledge</h3>
            <p className="mt-2 text-sm leading-relaxed text-mutedfg">
              Participation is harassment-free for everyone, regardless of background or identity. The code applies to all project spaces —
              repository, issues, pull requests, and future community surfaces — and to representation of the project in public.
            </p>
          </Panel>
          <Panel className="p-6">
            <h3 className="text-base font-semibold text-body">The engineering culture of record</h3>
            <p className="mt-2 text-sm leading-relaxed text-mutedfg">
              The project carries an explicit culture: honesty above appearance, claims backed by measured evidence, and uncertainty labeled
              rather than dressed. In discussion, the standard is the same — state what you measured; label what you did not.
            </p>
            <div className="mt-5">
              <ArrowLink href={`${FACTS.repoUrl}/blob/main/CODE_OF_CONDUCT.md`} external>
                Read the full code of conduct
              </ArrowLink>
            </div>
          </Panel>
        </div>
      </Section>

      {/* ─────────── support ─────────── */}
      <Section tight label="Support" title="Docs first, then the community, then issues.">
        <ol className="space-y-3">
          {[
            {
              n: "1",
              title: "Documentation",
              text: "QUICKSTART (the 15-minute journey), INSTALL (channels), TROUBLESHOOTING (exit codes and E-codes), FAQ. Most answers live here — the docs are generated from the engine's own registries.",
              href: "#/docs",
              link: "Documentation",
            },
            {
              n: "2",
              title: "Self-diagnostics",
              text: "vae doctor (full health check, no phone-home), vae journal verify (recompute a chain), vae explain (reconstruct a run), vae center (the operator cockpit), vae tour (the guided walk).",
              href: "#/docs/cli",
              link: "The diagnostic commands",
            },
            {
              n: "3",
              title: "Community help",
              text: "GitHub Discussions Q&A for usage questions — community answers above the issue queue, once the surfaces are live.",
              href: FACTS.discussionsUrl,
              link: "Discussions",
              external: true,
            },
            {
              n: "4",
              title: "Issue tracker",
              text: "When documentation and community do not resolve it: open an issue with the measured evidence — the command, the E-code, the verification record, and the engine version.",
              href: FACTS.issuesUrl,
              link: "Open an issue",
              external: true,
            },
          ].map((s) => (
            <li key={s.n} className="flex gap-4 rounded-2xl border border-edge bg-surface p-5">
              <span className="inline-flex h-9 shrink-0 items-center rounded-lg border border-gold/30 bg-gold/10 px-3 font-mono text-xs font-semibold text-gold">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-body">{s.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-mutedfg">{s.text}</p>
                <div className="mt-2">
                  <ArrowLink href={s.href} external={"external" in s ? s.external : false}>
                    {s.link}
                  </ArrowLink>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <Callout kind="security" title="Security findings are the exception">
          Never open a public issue for a security finding. Reports go directly and privately to the project owner at{" "}
          <a href={`mailto:${FACTS.contactEmail}`} className="text-gold underline-offset-4 hover:underline">
            {FACTS.contactEmail}
          </a>{" "}
          — the disclosure posture of record.
        </Callout>
        <div className="mt-8">
          <CTARow
            primary={
              <GoldButton href="#/docs/getting-started">Start with the docs</GoldButton>
            }
            secondary={
              <GhostButton href={FACTS.repoUrl} external>
                <LifeBuoy className="h-4 w-4" aria-hidden /> Browse the repository
              </GhostButton>
            }
          />
        </div>
        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-mutedfg">
          <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden />
          Everything on this page reflects the measured state of the project. When a channel opens, it is announced — never implied.
        </p>
      </Section>
    </>
  );
}
