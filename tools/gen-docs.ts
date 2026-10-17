/**
 * Vaerion docs generator — the AI corpus (blueprint §13: "llms.txt +
 * llms-full.txt generated from book"; drift protection: "generated-reference-
 * freshness gates (fails CI on mismatch)").
 *
 * Deterministic by construction:
 *   - fixed document discovery order (sorted relative paths)
 *   - no timestamps, no environment data, no absolute paths
 *   - llms.txt     = the index (title + one-line summary per document)
 *   - llms-full.txt = the full corpus, sectioned, in the same order
 *
 * Usage:
 *   bun run tools/gen-docs.ts           regenerate the corpus files
 *   bun run tools/gen-docs.ts --check   verify byte-freshness (exit 1 on drift)
 *
 * Constitutional check C8 calls --check logic: the committed corpus must
 * match the book exactly, or the gate fails.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const BOOK = join(ROOT, "docs", "book");

interface BookDoc {
  rel: string;
  title: string;
  summary: string;
  body: string;
}

function walkMd(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkMd(p, out);
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

/** First markdown heading = title; first non-heading paragraph = summary. */
function parseDoc(absPath: string): BookDoc {
  const body = readFileSync(absPath, "utf8");
  const lines = body.split("\n");
  let title = "";
  let summary = "";
  for (const line of lines) {
    if (title === "" && line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }
    if (title !== "" && summary === "" && line.trim().length > 0 && !line.startsWith("#") && !line.startsWith("|") && !line.startsWith("```")) {
      summary = line.trim().replace(/\s+/g, " ");
      break;
    }
  }
  const rel = relative(ROOT, absPath).replaceAll("\\", "/");
  return { rel, title: title || rel, summary, body };
}

function collectBook(): BookDoc[] {
  return walkMd(BOOK)
    .map(parseDoc)
    .sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
}

function renderIndex(docs: BookDoc[]): string {
  const lines: string[] = [
    "# Vaerion",
    "",
    "The AI-native development engine that is local-first, deterministic, and provable:",
    "a permission broker that fails closed, hash-chained journals that replay byte-identically,",
    "a model gateway with honest micro-USD metering, and reproducible packaging.",
    "This corpus is generated from the repository book; the book is the source.",
    "",
    "## Documents",
    "",
  ];
  for (const d of docs) {
    lines.push(`- [${d.title}](${d.rel}): ${d.summary}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderFull(docs: BookDoc[]): string {
  const header = [
    "# Vaerion — full documentation corpus",
    "",
    "Generated from docs/book (sorted by path). Section order is stable;",
    "regenerate with `bun run tools/gen-docs.ts`.",
    "",
  ];
  const sections: string[] = [];
  for (const d of docs) {
    sections.push(`\n\n---\n\n<!-- ${d.rel} -->\n\n${d.body.trimEnd()}\n`);
  }
  return header.join("\n") + sections.join("");
}

function main(): number {
  const check = process.argv.includes("--check");
  const corpus = buildCorpus();
  const llmsPath = join(ROOT, "llms.txt");
  const fullPath = join(ROOT, "llms-full.txt");
  if (check) {
    const drift: string[] = [];
    const currentLlms = readFileSync(llmsPath, "utf8");
    const currentFull = readFileSync(fullPath, "utf8");
    if (currentLlms !== corpus.llms) drift.push("llms.txt");
    if (currentFull !== corpus.full) drift.push("llms-full.txt");
    if (drift.length > 0) {
      console.error(`gen-docs: corpus DRIFT in ${drift.join(", ")} — regenerate with: bun run tools/gen-docs.ts`);
      return 1;
    }
    console.log(`gen-docs: corpus fresh (${corpus.count} documents)`);
    return 0;
  }
  writeFileSync(llmsPath, corpus.llms, "utf8");
  writeFileSync(fullPath, corpus.full, "utf8");
  console.log(`gen-docs: wrote llms.txt + llms-full.txt (${corpus.count} documents)`);
  return 0;
}

export interface DocsCorpus {
  llms: string;
  full: string;
  count: number;
  docs: Array<{ rel: string; title: string }>;
}

/** Deterministically build the corpus (also used by constitutional check C8). */
export function buildCorpus(): DocsCorpus {
  const docs = collectBook();
  return {
    llms: renderIndex(docs),
    full: renderFull(docs),
    count: docs.length,
    docs: docs.map((d) => ({ rel: d.rel, title: d.title })),
  };
}

if (import.meta.main) {
  process.exit(main());
}
