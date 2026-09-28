"use client";

import { FACTS } from "./facts";

/**
 * System footer — one hairline, one dense mono index. Every route stays
 * reachable; nothing is decorated. The footer sticks to the viewport
 * bottom on short pages (mt-auto inside the shell's flex column).
 */

const INDEX_COLS = [
  {
    label: "Console",
    links: [
      { href: "#/", label: "00 Console" },
      { href: "#/how-it-works", label: "01 Protocol" },
      { href: "#/receipts", label: "02 Evidence" },
      { href: "#/developers", label: "03 Operate" },
      { href: "#/status", label: "04 Limits" },
    ],
  },
  {
    label: "System",
    links: [
      { href: "#/playground", label: "Trust playground" },
      { href: "#/laws", label: "Vaerion laws" },
      { href: "#/architecture", label: "Architecture" },
      { href: "#/security", label: "Security model" },
      { href: "#/governance", label: "Governance" },
    ],
  },
  {
    label: "Documents",
    links: [
      { href: "#/docs", label: "Documentation" },
      { href: "#/docs/installation", label: "Install" },
      { href: "#/docs/cli", label: "CLI reference" },
      { href: "#/docs/sdk", label: "TypeScript SDK" },
      { href: "#/docs/faq", label: "FAQ" },
      { href: "#/docs/troubleshooting", label: "Troubleshooting" },
    ],
  },
  {
    label: "Project",
    links: [
      { href: "#/about", label: "About" },
      { href: "#/community", label: "Community" },
      { href: FACTS.repoUrl, label: "GitHub", external: true },
      { href: FACTS.releasesUrl, label: "Releases", external: true },
      { href: FACTS.issuesUrl, label: "Issues", external: true },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-edge bg-ink" role="contentinfo">
      <div className="mx-auto w-full max-w-[1200px] px-5 pb-8 pt-10 sm:px-8 md:px-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <img src="/icon-192.png" alt="" width={22} height={22} className="rounded-[4px]" />
              <span className="font-mono text-[12px] font-semibold tracking-[0.28em] text-body">VAERION</span>
            </div>
            <p className="mt-3 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.12em] text-mutedfg">
              v{FACTS.version} · {FACTS.license} · local-first · zero telemetry
            </p>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-mutedfg">
              9/9 verification gates green
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-4">
            {INDEX_COLS.map((c) => (
              <nav key={c.label} aria-label={c.label}>
                <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mutedfg/70">{c.label}</p>
                <ul className="space-y-1">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...("external" in l && l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="inline-flex min-h-[28px] items-center font-mono text-[11.5px] text-mutedfg transition-colors hover:text-body"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-edge pt-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mutedfg">
            © 2026 Vaerion · built by {FACTS.author} · <span className="text-mutedfg/70">every action journaled · every decision provable</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
