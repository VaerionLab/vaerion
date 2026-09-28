"use client";

import { cn } from "@/lib/utils";

/** Desktop nav item — plain anchor, gold underline when active. */
export default function LinkNavItem({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-gold",
        active ? "text-gold" : "text-mutedfg hover:text-body",
      )}
    >
      {children}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-3 bottom-2 h-px bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
        />
      ) : null}
    </a>
  );
}
