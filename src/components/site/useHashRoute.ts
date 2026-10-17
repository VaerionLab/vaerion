"use client";

import { useSyncExternalStore } from "react";

/**
 * Minimal hash router — the site is a single Next.js route (/) with
 * client-side "pages" selected by location.hash. No dependencies.
 *
 *   #/            → landing (home)
 *   #/console     → the console-native index page
 *   #/docs/cli    → docs CLI page
 * Links are plain anchors (href="#/docs/cli"), so they work without JS
 * bootstrapping and are crawlable/copyable.
 *
 * Section anchors are NOT routes: the landing carries in-page addresses
 * (#hero, #install, #demo, …) and the shell carries the skip link
 * (#main). normalizePath resolves any hash that does not start with "/"
 * to the home route, so the page does not change and the browser
 * performs the native scroll to the section.
 *
 * Implemented with useSyncExternalStore: during hydration the server
 * snapshot ("/") is used, then the client re-renders with the real hash —
 * no hydration mismatch, no setState-in-effect. Scroll-to-top rides the
 * hashchange event itself (an external-system subscription, not state
 * sync) and fires only on real route changes — or when an explicit home
 * link ("#/" or bare "#") is clicked while already home.
 */

export function normalizePath(raw: string): string {
  let h = raw.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h === "" || h === "/") return "/";
  // In-page section anchor (e.g. "#install") — not a console route.
  if (!h.startsWith("/")) return "/";
  if (h.length > 1 && h.endsWith("/")) h = h.slice(0, -1);
  return h;
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

function subscribe(listener: () => void): () => void {
  let current = getSnapshot();
  const onHashChange = () => {
    const next = getSnapshot();
    if (next !== current) {
      current = next;
      listener();
      scrollToTop();
      return;
    }
    // Same route, different address: an in-page section anchor was
    // visited (native scroll proceeds — do not fight it), or an explicit
    // home link was clicked while already home (return to the top).
    const raw = window.location.hash;
    if (raw === "" || raw === "#" || raw === "#/") scrollToTop();
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
