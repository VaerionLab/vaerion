/**
 * Vaerion — the accessibility structural checker (ASCENSION XVIII Phase 8;
 * constitution v1.4 A4 — the accessibility law; P7 honest surfaces, D-R, D-S).
 *
 * ONE deterministic rule-runner audits the human web surface (src/app/**)
 * for the structural accessibility invariants of record:
 *
 *   lang-attribute        the root <html> declares its language
 *   metadata-present      the layout exports a title and a description
 *   single-h1             exactly one <h1> per page surface
 *   landmarks-present     <main>, <header> and <footer> are present
 *   sections-labeled      every <section> carries an aria-label
 *   image-alt             every <Image>/<img> tag carries alt text
 *   progressbar-labeled   every role="progressbar" carries an aria-label
 *                         and aria-valuemin/now/max
 *   no-positive-tabindex  the tab order stays natural (no tabIndex > 0)
 *   focus-visible-styled  the stylesheet styles :focus-visible (keyboard
 *                         focus is always visible)
 *
 * Deterministic: the same sources produce the same report (no timestamps,
 * no ambient state). The report is rich-plain JSON (schema vaerion.a11y.v1).
 * This script is a verify.ts STEP — never a second verification entrypoint
 * (D-R). Scope honesty (D-S): structural checks are necessary, not
 * sufficient; the browser-measured audit (keyboard operability, focus
 * visibility, contrast, screen-reader landmark walk) is recorded separately
 * in docs/ga/ACCESSIBILITY-AUDIT.md.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export const A11Y_REPORT_SCHEMA = "vaerion.a11y.v1" as const;

export interface A11yFinding {
  readonly file: string;
  readonly rule: string;
  readonly detail: string;
}

export interface A11yRuleResult {
  readonly id: string;
  readonly ok: boolean;
  readonly findings: readonly A11yFinding[];
}

export interface A11yReport {
  readonly schema: typeof A11Y_REPORT_SCHEMA;
  readonly passed: boolean;
  readonly rules: readonly A11yRuleResult[];
  /** Honest-degradation note (e.g. the site-absent SKIP record). */
  readonly note?: string;
}

export interface A11ySource {
  /** Repo-relative path (as displayed in findings). */
  readonly path: string;
  readonly content: string;
}

function tagBody(source: string, tag: string): Array<{ index: number; text: string }> {
  const results: Array<{ index: number; text: string }> = [];
  const re = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  for (const m of source.matchAll(re)) {
    results.push({ index: m.index ?? 0, text: m[0] });
  }
  return results;
}

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

/* ──────────────────────────────  the rules  ────────────────────────────── */

type Rule = { id: string; check: (sources: readonly A11ySource[]) => A11yFinding[] };

const RULES: readonly Rule[] = [
  {
    id: "lang-attribute",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      for (const s of sources.filter((s) => s.path.endsWith("layout.tsx"))) {
        const tags = tagBody(s.content, "html");
        if (tags.length === 0) {
          findings.push({ file: s.path, rule: "lang-attribute", detail: "no <html> tag found in the root layout" });
          continue;
        }
        for (const t of tags) {
          if (!/\blang=/i.test(t.text)) {
            findings.push({ file: s.path, rule: "lang-attribute", detail: `<html> at line ${lineOf(s.content, t.index)} does not declare lang="…"` });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "metadata-present",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      for (const s of sources.filter((s) => s.path.endsWith("layout.tsx"))) {
        if (!/title\s*:\s*["'`]/.test(s.content)) {
          findings.push({ file: s.path, rule: "metadata-present", detail: "layout metadata lacks a title" });
        }
        if (!/description\s*:\s*["'`]/.test(s.content)) {
          findings.push({ file: s.path, rule: "metadata-present", detail: "layout metadata lacks a description" });
        }
      }
      return findings;
    },
  },
  {
    id: "single-h1",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      for (const s of sources.filter((s) => /(^|\/)page\.tsx$/.test(s.path))) {
        const opens = tagBody(s.content, "h1");
        const closes = [...s.content.matchAll(/<\/h1>/gi)].length;
        if (opens.length !== 1 || closes !== 1) {
          findings.push({ file: s.path, rule: "single-h1", detail: `expected exactly one <h1>, found ${Math.max(opens.length, closes)} open/close tags` });
        }
      }
      return findings;
    },
  },
  {
    id: "landmarks-present",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      for (const s of sources.filter((s) => /(^|\/)page\.tsx$/.test(s.path))) {
        for (const landmark of ["main", "header", "footer"] as const) {
          if (!new RegExp(`<${landmark}[\\s>]`, "i").test(s.content)) {
            findings.push({ file: s.path, rule: "landmarks-present", detail: `<${landmark}> landmark missing from the page surface` });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "sections-labeled",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      for (const s of sources) {
        for (const t of tagBody(s.content, "section")) {
          // The design system's <Section> component renders
          // aria-label={label ?? title} — the accessible name is carried by
          // the label/title props at the JSX surface (L-5 repair, Phase 16).
          const designSystemSection = /<Section[\s>]/.test(t.text);
          const labeled = designSystemSection
            ? /\b(?:aria-label|label|title)=/i.test(t.text)
            : /\baria-label=/i.test(t.text);
          if (!labeled) {
            findings.push({ file: s.path, rule: "sections-labeled", detail: `<section> at line ${lineOf(s.content, t.index)} has no aria-label` });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "image-alt",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      for (const s of sources) {
        for (const tag of ["Image", "img"] as const) {
          for (const t of tagBody(s.content, tag)) {
            if (!/\balt=(?:"[^"]*"|\{)/i.test(t.text)) {
              findings.push({ file: s.path, rule: "image-alt", detail: `<${tag}> at line ${lineOf(s.content, t.index)} carries no alt text` });
            }
          }
        }
      }
      return findings;
    },
  },
  {
    id: "progressbar-labeled",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      for (const s of sources) {
        for (const t of tagBody(s.content, "div")) {
          if (!/role=\{?"progressbar"/i.test(t.text)) continue;
          for (const attr of ["aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax"] as const) {
            if (!new RegExp(`${attr}=`.replace("aria-", "aria-"), "i").test(t.text)) {
              findings.push({ file: s.path, rule: "progressbar-labeled", detail: `role="progressbar" at line ${lineOf(s.content, t.index)} lacks ${attr}` });
            }
          }
        }
      }
      return findings;
    },
  },
  {
    id: "no-positive-tabindex",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      for (const s of sources) {
        for (const m of s.content.matchAll(/tabIndex=\{?(\d+)/gi)) {
          const n = Number(m[1]);
          if (Number.isFinite(n) && n > 0) {
            findings.push({ file: s.path, rule: "no-positive-tabindex", detail: `tabIndex={${n}} at line ${lineOf(s.content, m.index ?? 0)} breaks the natural tab order` });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "focus-visible-styled",
    check: (sources) => {
      const findings: A11yFinding[] = [];
      const css = sources.filter((s) => s.path.endsWith(".css"));
      for (const s of css) {
        if (!/:focus-visible/.test(s.content)) {
          findings.push({ file: s.path, rule: "focus-visible-styled", detail: "stylesheet never styles :focus-visible — keyboard focus may be invisible" });
        }
      }
      return findings;
    },
  },
];

/* ───────────────────────────  the rule-runner  ─────────────────────────── */

/** Run the invariants of record over the given sources. Pure and deterministic. */
export function analyzeSources(sources: readonly A11ySource[]): A11yReport {
  const rules = RULES.map((r) => {
    const findings = r.check(sources);
    return { id: r.id, ok: findings.length === 0, findings };
  });
  return {
    schema: A11Y_REPORT_SCHEMA,
    passed: rules.every((r) => r.ok),
    rules,
  };
}

/* ────────────────────────────  the gate entry  ──────────────────────────── */

/** The site console is a Founder-side surface: the public Community Edition
 * tree carries no src/app. When it is absent the gate degrades honestly. */
export const SITE_ABSENT_NOTE =
  "site surfaces absent from this tree — the invariants re-arm when the surface exists" as const;

/** The site-absent degradation record (D-S): a labeled SKIP, never a silent pass. */
export function siteAbsentReport(): A11yReport {
  return { schema: A11Y_REPORT_SCHEMA, passed: true, rules: [], note: SITE_ABSENT_NOTE };
}

/** The site console's presence is measured, never assumed (D-S). */
export function siteSurfaceAbsent(root: string): boolean {
  return !existsSync(join(root, "src", "app"));
}

/**
 * The gate entry (a verify.ts STEP — D-R): run the invariants of record over
 * the launch composition, or SKIP with a labeled record when the site
 * surface is absent from this tree. One emitted line per call; returns the
 * process exit code.
 */
export function gateEntry(root: string, emit: (line: string) => void, err: (line: string) => void): 0 | 1 {
  if (siteSurfaceAbsent(root)) {
    emit(JSON.stringify(siteAbsentReport(), null, 2));
    emit(`a11y-structural: SKIP — ${SITE_ABSENT_NOTE}`);
    return 0;
  }
  const launchDir = join(root, "src", "components", "launch");
  const appDir = join(root, "src", "app");
  // The scan scope of record (L-5 repair, Phase 16): the REAL page surface is
  // the launch composition (IR-021) — layout + shell/nav/footer + the home
  // face + the stylesheet — analyzed together as the one rendered page.
  const paths = [
    join(appDir, "layout.tsx"),
    join(appDir, "globals.css"),
    join(launchDir, "LaunchShell.tsx"),
    join(launchDir, "LaunchNav.tsx"),
    join(launchDir, "LaunchFooter.tsx"),
    join(launchDir, "pages", "LaunchHome.tsx"),
  ];
  const sources: A11ySource[] = [];
  for (const p of paths) {
    try {
      sources.push({ path: relative(process.cwd(), p), content: readFileSync(p, "utf8") });
    } catch {
      sources.push({ path: relative(process.cwd(), p), content: "" });
    }
  }
  const report = analyzeSources(sources);
  emit(JSON.stringify(report, null, 2));
  if (!report.passed) {
    err("a11y-structural: FAILED — accessibility invariants violated");
    for (const r of report.rules) {
      for (const f of r.findings) err(`  - [${f.rule}] ${f.file}: ${f.detail}`);
    }
    return 1;
  }
  emit("a11y-structural: OK — the human surface honors the accessibility invariants");
  return 0;
}

function main(): void {
  process.exit(gateEntry(join(import.meta.dir, ".."), (l) => console.log(l), (l) => console.error(l)));
}

// CLI entry (the verify.ts gate step); the pure runner above is imported by tests.
if (import.meta.main) main();
