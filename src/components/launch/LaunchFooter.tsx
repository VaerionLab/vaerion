"use client";

/**
 * Vaerion — Launch Footer (Phase 12, order section 3).
 *
 * Sticky-bottom law: the shell is `min-h-screen flex flex-col`; this
 * footer carries `mt-auto`, so it sits at the viewport floor on short
 * pages and is pushed down naturally when content overflows. The gate
 * line names the verification-gate SET of record (nine gates in
 * tools/verify.ts) without asserting a live pass state — pass state is
 * the verification record's job, not the footer's.
 *
 * Citations: Phase 12 execution order section 3; FACTS (site law);
 * docs/operations/DEPLOYMENT.md.
 */

import { FACTS } from "../site/facts";

import { Logo, Wordmark } from "./Logo";

const COLUMNS = [
  {
    label: "Launch",
    links: [
      { href: "#/vision", label: "Vision" },
      { href: "#/runtime", label: "Runtime" },
      { href: "#/architecture", label: "Architecture" },
      { href: "#/developers", label: "Developers" },
      { href: "#/security", label: "Security" },
    ],
  },
  {
    label: "Evidence",
    links: [
      { href: "#/observatory", label: "Release Observatory" },
      { href: "#/receipts", label: "Receipts" },
      { href: "#/laws", label: "Laws" },
      { href: "#/governance", label: "Governance" },
      { href: "#/playground", label: "Playground" },
    ],
  },
  {
    label: "Documents",
    links: [
      { href: "#/knowledge", label: "Knowledge Interface" },
      { href: "#/documentation", label: "Documentation" },
      { href: "#/docs/getting-started", label: "Getting started" },
      { href: "#/docs/cli", label: "CLI manual" },
      { href: "#/docs/sdk", label: "SDK reference" },
    ],
  },
  {
    label: "Project",
    links: [
      { href: "#/download", label: "Download" },
      { href: "#/about", label: "About" },
      { href: "#/community", label: "Community" },
      { href: FACTS.releasesUrl, label: "Releases ↗" },
      { href: FACTS.issuesUrl, label: "Issues ↗" },
    ],
  },
] as const;

export function LaunchFooter() {
  return (
    <footer className="edge-light mt-auto bg-gradient-to-b from-transparent via-[rgba(139,124,246,0.03)] to-[rgba(212,175,55,0.045)] pb-[env(safe-area-inset-bottom)]">
      <div className="border-t border-edge">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 md:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.label} aria-label={col.label}>
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mutedfg">{col.label}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <a
                      href={l.href}
                      {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-[13px] text-mutedfg transition-colors hover:text-body"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-edge pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex rounded-md bg-well/70 p-1 ring-1 ring-edge">
              <Logo size={20} />
            </span>
            <Wordmark />
            <span className="font-mono text-[11px] text-mutedfg">
              v{FACTS.version} · {FACTS.license} · local-first · zero telemetry
            </span>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-mutedfg">
            nine verification gates stand guard (tools/verify.ts) · © 2026 Vaerion · built by {FACTS.author}
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}
