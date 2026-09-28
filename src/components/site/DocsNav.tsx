"use client";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "#/docs", label: "Overview" },
  { href: "#/docs/getting-started", label: "Getting started" },
  { href: "#/docs/installation", label: "Installation" },
  { href: "#/docs/cli", label: "CLI" },
  { href: "#/docs/sdk", label: "SDK" },
  { href: "#/docs/architecture", label: "Architecture" },
  { href: "#/docs/security", label: "Security" },
  { href: "#/docs/faq", label: "FAQ" },
  { href: "#/docs/troubleshooting", label: "Troubleshooting" },
] as const;

/**
 * Chip-style sub-navigation for the docs section. `route` is the current
 * hash path (e.g. "/docs/cli"); the chip whose href.slice(1) equals it is
 * highlighted. Horizontally scrollable on mobile.
 */
export default function DocsNav({ route }: { route: string }) {
  return (
    <nav aria-label="Documentation section" className="vx-scroll -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex w-max items-center gap-2 py-1 sm:flex-wrap">
        {ITEMS.map((item) => {
          const active = route === item.href.slice(1);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border px-4 font-mono text-[12.5px] font-medium tracking-wide transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                  active
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-edge bg-surface text-mutedfg hover:border-gold/30 hover:text-body",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
