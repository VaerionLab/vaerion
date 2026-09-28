"use client";

/**
 * Vaerion — Launch Navigation (Phase 12, order section 3; PHASE 17 —
 * EXPERIENCE AWAKENING).
 *
 * The nine mandated launch sections in order — Home, Vision, Runtime,
 * Architecture, Developers, Security, Documentation, Release Observatory,
 * Download — plus the deeper archive (system surfaces, documents, the
 * constitutional instrument, the Knowledge Interface) in the mobile
 * index. Active state and the gold underline follow the existing
 * LinkNavItem law. Identity renders through the Logo component slot —
 * the official Founder raster (brand/official/MANIFEST.md), presented
 * in a small glass tile with an ambient halo. PHASE 17 lifts the bar
 * into a floating glass dock: frosted, luminous-haired, detached from
 * the page edge — mission-control chrome, not a website header.
 *
 * Citations: Phase 12 execution order section 3 (required sections);
 * IR-021 (display path); PHASE 17 mission (glass navigation); site
 * Nav.tsx (the interaction precedent); brand/official/MANIFEST.md.
 */

import { Github, Menu } from "lucide-react";

import { FACTS } from "../site/facts";
import LinkNavItem from "../site/LinkNavItem";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { Logo, Wordmark } from "./Logo";

export const LAUNCH_SECTIONS = [
  { href: "#/", label: "Home" },
  { href: "#/vision", label: "Vision" },
  { href: "#/runtime", label: "Runtime" },
  { href: "#/architecture", label: "Architecture" },
  { href: "#/developers", label: "Developers" },
  { href: "#/security", label: "Security" },
  { href: "#/documentation", label: "Documentation" },
  { href: "#/observatory", label: "Observatory" },
  { href: "#/download", label: "Download" },
] as const;

const SYSTEM_LINKS = [
  { href: "#/playground", label: "Playground — the live governance simulation" },
  { href: "#/laws", label: "Laws — the eight rules the engine cannot break" },
  { href: "#/receipts", label: "Receipts — proof that outlives the process" },
  { href: "#/governance", label: "Governance — the broker, in order" },
  { href: "#/status", label: "Status — the measured dashboard" },
] as const;

const DOCUMENT_LINKS = [
  { href: "#/knowledge", label: "Knowledge Interface — the civilization archive" },
  { href: "#/docs/getting-started", label: "Getting started — the 15-minute journey" },
  { href: "#/docs/installation", label: "Installation — every channel, honestly mapped" },
  { href: "#/docs/cli", label: "CLI — the vae command registry" },
  { href: "#/docs/sdk", label: "SDK — @vaerion/sdk reference" },
  { href: "#/docs/architecture", label: "Architecture — the ADR register" },
  { href: "#/docs/security", label: "Security — properties and adversaries" },
  { href: "#/docs/faq", label: "FAQ — short answers, runnable evidence" },
  { href: "#/docs/troubleshooting", label: "Troubleshooting — exit codes and E-codes" },
] as const;

const PROJECT_LINKS = [
  { href: "#/about", label: "About — the founder's thesis" },
  { href: "#/community", label: "Community — built on the same law" },
  { href: "#/instrument", label: "The Instrument — the ten-surface console" },
  { href: FACTS.releasesUrl, label: "GitHub Releases ↗" },
  { href: FACTS.repoUrl, label: "Repository ↗" },
] as const;

function isActive(route: string, href: string): boolean {
  const target = href.replace(/^#/, "") || "/";
  if (target === "/") return route === "/";
  return route === target || route.startsWith(`${target}/`);
}

export function LaunchNav({ route }: { route: string }) {
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-body"
      >
        Skip to content
      </a>
      <div className="glass-dock edge-light mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3 rounded-2xl px-3 sm:gap-4 sm:px-4">
        <a href="#/" className="group flex shrink-0 items-center gap-2.5" aria-label="Vaerion home">
          <span className="relative inline-flex rounded-lg bg-well/80 p-1 ring-1 ring-edge transition-shadow duration-500 group-hover:shadow-[0_0_18px_rgba(212,175,55,0.35)]">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.28), transparent 70%)" }}
            />
            <Logo size={20} />
          </span>
          <Wordmark />
          <span className="hidden rounded-sm border border-edge bg-well/60 px-1.5 py-0.5 font-mono text-[10px] text-mutedfg md:inline">
            v{FACTS.version}
          </span>
        </a>

        <nav aria-label="Launch sections" className="ml-auto hidden min-w-0 items-center gap-0.5 xl:flex">
          {LAUNCH_SECTIONS.map((s) => (
            <LinkNavItem key={s.href} href={s.href} active={isActive(route, s.href)}>
              {s.label}
            </LinkNavItem>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-3">
          <a
            href="#/knowledge"
            className="hidden min-h-[36px] items-center rounded-md border border-edge bg-well/50 px-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-body transition-all duration-300 hover:border-gold/50 hover:text-gold hover:shadow-[0_0_16px_rgba(212,175,55,0.2)] sm:inline-flex"
          >
            Knowledge
          </a>
          <a
            href={FACTS.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vaerion on GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-mutedfg transition-colors hover:bg-surface-2 hover:text-body focus-visible:outline-2 focus-visible:outline-gold"
          >
            <Github className="h-4 w-4" aria-hidden />
          </a>

          <Sheet>
            <SheetTrigger
              aria-label="Open index"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-edge text-mutedfg transition-colors hover:text-body focus-visible:outline-2 focus-visible:outline-gold xl:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden />
            </SheetTrigger>
            {/* No description exists for the index sheet — the documented
                Radix suppression keeps the accessibility contract honest. */}
            <SheetContent aria-describedby={undefined} side="right" className="w-[86vw] max-w-sm overflow-y-auto border-edge bg-ink px-0">
              <SheetHeader className="border-b border-edge px-5 pb-4 pt-5 text-left">
                <SheetTitle className="flex items-center gap-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-body">
                  <Logo size={18} /> Index
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-6 px-5 py-5">
                <IndexGroup label="Launch" items={LAUNCH_SECTIONS.map((s) => ({ href: s.href, label: s.label }))} route={route} />
                <IndexGroup label="System" items={[...SYSTEM_LINKS]} route={route} />
                <IndexGroup label="Documents" items={[...DOCUMENT_LINKS]} route={route} />
                <IndexGroup label="Project" items={[...PROJECT_LINKS]} route={route} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function IndexGroup({
  label,
  items,
  route,
}: {
  label: string;
  items: readonly { href: string; label: string }[];
  route: string;
}) {
  return (
    <section aria-label={label}>
      <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mutedfg">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={`block rounded-sm px-2 py-2 text-[13px] leading-snug transition-colors hover:bg-surface-2 hover:text-body ${
                isActive(route, item.href) ? "text-gold" : "text-mutedfg"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
