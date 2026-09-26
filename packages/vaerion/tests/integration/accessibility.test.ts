/**
 * The accessibility structural checker (ASCENSION XVIII Phase 8; v1.4 A4 —
 * the accessibility law).
 *
 * Matrix: every rule demonstrably FAILS on a violating surface and PASSES on
 * a compliant one (failure-path + contract), the report is deterministic
 * rich-plain JSON, the REAL web face passes (the invariant holds on this
 * tree), and the gate is wired through the single verification authority
 * (D-R) with no engine-internal imports (independence).
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { A11Y_REPORT_SCHEMA, analyzeSources, gateEntry, siteSurfaceAbsent, type A11ySource } from "../../../../tools/a11y-check.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..", "..", "..");

/** The site console (src/**) is a Founder-side surface (excluded from the
 * public Community Edition tree). The REAL-face tests exercise it wherever
 * it exists; where it does not, they SKIP with this label — never a silent
 * pass (D-S). The a11y-structural gate applies the same law. */
const WEB_FACE_PRESENT = existsSync(join(REPO_ROOT, "src", "app", "layout.tsx"));

function src(path: string, content: string): A11ySource {
  return { path, content };
}

const COMPLIANT_PAGE = `export default function Page() {
  return (
    <div>
      <main>
        <header><h1>Title</h1></header>
        <section aria-label="Alpha"><p>hi</p></section>
        <div role="progressbar" aria-label="Loading" aria-valuenow={5} aria-valuemin={0} aria-valuemax={100} />
      </main>
      <footer>fine</footer>
    </div>
  );
}`;

describe("the accessibility invariants — every rule fails closed", () => {
  test("lang-attribute: a root <html> without lang is a finding", () => {
    const r = analyzeSources([src("src/app/layout.tsx", '<html suppressHydrationWarning><body /></html>')]);
    expect(r.passed).toBe(false);
    expect(r.rules.find((x) => x.id === "lang-attribute")!.ok).toBe(false);
  });

  test("metadata-present: a layout without title/description is a finding", () => {
    const r = analyzeSources([src("src/app/layout.tsx", '<html lang="en"></html>')]);
    expect(r.rules.find((x) => x.id === "metadata-present")!.findings.length).toBe(2);
  });

  test("single-h1: zero or multiple h1 elements are findings", () => {
    const none = analyzeSources([src("src/app/page.tsx", "<main><p>no heading</p></main>")]);
    expect(none.rules.find((x) => x.id === "single-h1")!.ok).toBe(false);
    const two = analyzeSources([src("src/app/page.tsx", "<main><h1>a</h1><h1>b</h1></main>")]);
    expect(two.rules.find((x) => x.id === "single-h1")!.ok).toBe(false);
  });

  test("landmarks-present: a page without main/header/footer is a finding", () => {
    const r = analyzeSources([src("src/app/page.tsx", "<div><h1>x</h1></div>")]);
    expect(r.rules.find((x) => x.id === "landmarks-present")!.findings.length).toBe(3);
  });

  test("sections-labeled: an unlabeled <section> is a finding", () => {
    const r = analyzeSources([src("src/app/page.tsx", '<main><header><h1>t</h1></header><section><p>x</p></section><footer>f</footer></main>')]);
    const rule = r.rules.find((x) => x.id === "sections-labeled")!;
    expect(rule.ok).toBe(false);
    expect(rule.findings[0]!.detail).toContain("aria-label");
  });

  test("image-alt: an <Image> without alt is a finding", () => {
    const r = analyzeSources([src("src/app/page.tsx", '<main><header><h1>t</h1></header><footer>f</footer><Image src="/x.png" width={1} height={1} /></main>')]);
    expect(r.rules.find((x) => x.id === "image-alt")!.ok).toBe(false);
  });

  test("progressbar-labeled: a progressbar without label or value semantics is a finding", () => {
    const bare = analyzeSources([src("src/app/page.tsx", '<main><header><h1>t</h1></header><footer>f</footer><div role="progressbar" /></main>')]);
    const rule = bare.rules.find((x) => x.id === "progressbar-labeled")!;
    expect(rule.ok).toBe(false);
    expect(rule.findings.length).toBe(4); // label + now + min + max
  });

  test("no-positive-tabindex: tabIndex>0 breaks the natural order", () => {
    const r = analyzeSources([src("src/app/page.tsx", '<main><header><h1>t</h1></header><footer>f</footer><button tabIndex={3}>x</button></main>')]);
    expect(r.rules.find((x) => x.id === "no-positive-tabindex")!.ok).toBe(false);
  });

  test("focus-visible-styled: a stylesheet without :focus-visible is a finding", () => {
    const r = analyzeSources([src("src/app/globals.css", "body { margin: 0; }")]);
    expect(r.rules.find((x) => x.id === "focus-visible-styled")!.ok).toBe(false);
  });

  test("a fully compliant surface passes every rule", () => {
    const r = analyzeSources([
      src("src/app/layout.tsx", 'export const metadata = { title: "T", description: "D" };\n<html lang="en"><body /></html>'),
      src("src/app/page.tsx", COMPLIANT_PAGE),
      src("src/app/globals.css", ":focus-visible { outline: 2px solid currentColor; }"),
    ]);
    expect(r.passed).toBe(true);
    expect(r.rules.every((x) => x.ok)).toBe(true);
    expect(r.rules.length).toBe(9);
  });
});

describe("the report contract", () => {
  test.skipIf(!WEB_FACE_PRESENT)("schema, determinism, and rich-plain-JSON round-trip", () => {
    const sources = [
      src("src/app/layout.tsx", readFileSync(join(REPO_ROOT, "src", "app", "layout.tsx"), "utf8")),
      src("src/app/page.tsx", readFileSync(join(REPO_ROOT, "src", "app", "page.tsx"), "utf8")),
      src("src/app/globals.css", readFileSync(join(REPO_ROOT, "src", "app", "globals.css"), "utf8")),
    ];
    const a = analyzeSources(sources);
    const b = analyzeSources(sources);
    expect(a.schema).toBe("vaerion.a11y.v1");
    expect(a).toEqual(b); // deterministic: same sources → byte-equal report
    expect(JSON.parse(JSON.stringify(a))).toEqual(a); // rich-plain JSON round-trip
  });

  test.skipIf(!WEB_FACE_PRESENT)("THE REAL WEB FACE passes the invariants of record", () => {
    // The REAL web face is the launch composition (IR-021): the same set the
    // a11y-structural gate scans (L-5 repair, Phase 16).
    const launch = (...p: string[]) => readFileSync(join(REPO_ROOT, "src", "components", "launch", ...p), "utf8");
    const r = analyzeSources([
      src("src/app/layout.tsx", readFileSync(join(REPO_ROOT, "src", "app", "layout.tsx"), "utf8")),
      src("src/app/globals.css", readFileSync(join(REPO_ROOT, "src", "app", "globals.css"), "utf8")),
      src("src/components/launch/LaunchShell.tsx", launch("LaunchShell.tsx")),
      src("src/components/launch/LaunchNav.tsx", launch("LaunchNav.tsx")),
      src("src/components/launch/LaunchFooter.tsx", launch("LaunchFooter.tsx")),
      src("src/components/launch/pages/LaunchHome.tsx", launch("pages", "LaunchHome.tsx")),
    ]);
    if (!r.passed) {
      const bad = r.rules.flatMap((x) => x.findings).map((f) => `[${f.rule}] ${f.file}: ${f.detail}`);
      throw new Error(`real web face violated the a11y invariants:\n${bad.join("\n")}`);
    }
    expect(r.passed).toBe(true);
  });
});

describe("the site-absent degradation (public Community Edition tree)", () => {
  test.skipIf(WEB_FACE_PRESENT)("the gate SKIPS with a labeled record when the site console is absent", () => {
    expect(siteSurfaceAbsent(REPO_ROOT)).toBe(true);
    const out: string[] = [];
    const errs: string[] = [];
    const code = gateEntry(REPO_ROOT, (l) => out.push(l), (l) => errs.push(l));
    expect(code).toBe(0);
    expect(out[1]).toContain("a11y-structural: SKIP");
    expect(errs).toEqual([]);
    const record = JSON.parse(out[0]!) as { schema: string; passed: boolean; note: string };
    expect(record.schema).toBe(A11Y_REPORT_SCHEMA);
    expect(record.passed).toBe(true);
    expect(record.note).toContain("re-arm when the surface exists");
  });
});

describe("the single verification authority (D-R)", () => {
  test("a11y-structural is a verify.ts gate STEP; the checker imports no engine internals", () => {
    const verify = readFileSync(join(REPO_ROOT, "tools", "verify.ts"), "utf8");
    expect(verify).toContain('run("a11y-structural"');
    expect(verify).toContain('"a11y-check.ts"');
    const checker = readFileSync(join(REPO_ROOT, "tools", "a11y-check.ts"), "utf8");
    expect(checker).not.toMatch(/from "\.\.\/packages\//); // independent of the engine — it audits sources as text
  });
});
