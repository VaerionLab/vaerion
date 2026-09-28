"use client";

import { useSyncExternalStore } from "react";

/**
 * Minimal hash router — the site is a single Next.js route (/) with
 * client-side "pages" selected by location.hash. No dependencies.
 *
 *   #/            → home
 *   #/docs/cli    → docs CLI page
 * Links are plain anchors (href="#/docs/cli"), so they work without JS
 * bootstrapping and are crawlable/copyable.
 *
 * Implemented with useSyncExternalStore: during hydration the server
 * snapshot ("/") is used, then the client re-renders with the real hash —
 * no hydration mismatch, no setState-in-effect. Scroll-to-top rides the
 * hashchange event itself (an external-system subscription, not state sync).
 */

export function normalizePath(raw: string): string {
  let h = raw.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h === "" || h === "/") return "/";
  if (!h.startsWith("/")) h = `/${h}`;
  if (h.length > 1 && h.endsWith("/")) h = h.slice(0, -1);
  return h;
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

function subscribe(listener: () => void): () => void {
  const onHashChange = () => {
    listener();
    scrollToTop();
  };
  window.addEventListener("hashchange", onHashChange);
  return () => window.removeEventListener("hashchange", onHashChange);
}

function getSnapshot(): string {
  return normalizePath(window.location.hash);
}

export function useHashRoute(): string {
  return useSyncExternalStore(subscribe, getSnapshot, () => "/");
}
