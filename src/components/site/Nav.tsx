"use client";

import { useState } from "react";
import LinkNavItem from "./LinkNavItem";
import { Menu, Github } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { FACTS } from "./facts";

/**
 * Protocol navigation — a flat index, not a menu system.
 *   00 CONSOLE · 01 PROTOCOL · 02 EVIDENCE · 03 OPERATE · 04 LIMITS
 * The full route inventory remains reachable in the compact index sheet.
 */

const INDEX_LINKS = [
  { href: "#/", label: "00 Console" },
  { href: "#/how-it-works", label: "01 Protocol" },
  { href: "#/receipts", label: "02 Evidence" },
  { href: "#/developers", label: "03 Operate" },
  { href: "#/status", label: "04 Limits" },
] as const;

const SHEET_GROUPS = [
  {
    label: "Index",
    links: INDEX_LINKS,
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
      { href: FACTS.repoUrl, label: "GitHub ↗" },
    ],
  },
] as const;

export default function Nav({ route }: { route: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-2 px-5 sm:px-8 md:px-12">
        {/* Identity — frozen brand assets */}
        <a href="#/" className="flex min-h-[44px] items-center gap-2.5 rounded-md pr-2 focus-visible:outline-2 focus-visible:outline-gold" aria-label="Vaerion home">
          <img src="/icon-192.png" alt="" width={22} height={22} className="rounded-[4px]" />
          <span className="font-mono text-[12px] font-semibold tracking-[0.28em] text-body">VAERION</span>
        </a>

        {/* Protocol index — desktop */}
        <nav aria-label="Primary" className="ml-8 hidden items-center gap-0.5 lg:flex">
          {INDEX_LINKS.map((l) => {
            const active = route === l.href.slice(1);
            return (
              <LinkNavItem key={l.href} href={l.href} active={active}>
                <span className="font-mono text-[11.5px] uppercase tracking-[0.1em]">{l.label}</span>
              </LinkNavItem>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <a
            href={FACTS.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vaerion on GitHub"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-mutedfg transition-colors hover:text-body focus-visible:outline-2 focus-visible:outline-gold"
          >
            <Github className="h-[17px] w-[17px]" aria-hidden />
          </a>
          <a
            href="#/playground"
            className="ml-1 hidden min-h-[36px] items-center rounded-md bg-[#F5F5F0] px-4 font-mono text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[#0A0E13] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:inline-flex"
          >
            Run demo
          </a>

          {/* Index sheet — compact, full inventory */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open index"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-body transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-gold lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="vx-root border-edge bg-ink text-body">
              <SheetTitle className="sr-only">Index</SheetTitle>
              <nav aria-label="Index" className="vx-scroll mt-2 overflow-y-auto px-1 pb-8">
                {SHEET_GROUPS.map((g) => (
                  <div key={g.label} className="mb-6">
                    <p className="mb-2 px-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-mutedfg">{g.label}</p>
                    <ul>
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <a
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="flex min-h-[44px] items-center rounded-md px-2 font-mono text-[13px] text-mutedfg transition-colors hover:bg-surface-2 hover:text-body"
                          >
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <a
                  href="#/playground"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-[#F5F5F0] px-4 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0A0E13]"
                >
                  Run demo
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
