import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

import { allTokens } from "@/vaerion/registry";
import { STAGES } from "@/vaerion/foundation/stages";
import { buildSearchIndex, searchKnowledge } from "@/vaerion/docs/search";
import { parseDocMeta } from "@/vaerion/docs/governance";

/**
 * HASH-FIRST SEARCH over the Vaerion knowledge system (Stage 11, order
 * Deliverable 6). Resolution priority (constitution/docs/GOVERNANCE.md §4):
 *
 *   1. exact authority references   (Art. VI, §5.7, P-4, Part II, T-067, IR-018)
 *   2. registry identifiers         (space.7 — dual naming honored)
 *   3. implementation symbols       (ConstitutionalViolationError)
 *   4. documentation                (free text, last)
 *
 * The index is built from the live sources at request time — the canonical
 * Registry, the stage manifest, the knowledge organ, the trace index, the
 * interpretation ledger, and the implementation exports. It never maintains
 * a second copy of any registry (GOVERNANCE.md §4).
 *
 * Citations: Stage 11 execution order Deliverable 6; Bible Art. VII (the
 * Machine Voice is canonical); Constitution P-4.
 */

export const dynamic = "force-dynamic";

const REPO = process.cwd();

const EXPORT_PATTERN = /export\s+(?:async\s+)?(function|const|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g;

function collectSymbols(): { name: string; module: string; kind: string }[] {
  const symbols: { name: string; module: string; kind: string }[] = [];
  const walk = (dir: string, moduleName: string): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full, `${moduleName}${moduleName.length === 0 ? '' : '/'}${entry}`);
        continue;
      }
      if (!/\.tsx?$/.test(entry)) continue;
      const text = readFileSync(full, "utf8");
      for (const match of text.matchAll(EXPORT_PATTERN)) {
        symbols.push({ name: match[2], module: `src/vaerion/${moduleName}${moduleName.length === 0 ? '' : '/'}${entry}`, kind: match[1] });
      }
    }
  };
  walk(join(REPO, "src", "vaerion"), "");
  return symbols;
}

function collectGovernance(): { key: string; title: string; location: string; citations: string[] }[] {
  const records: { key: string; title: string; location: string; citations: string[] }[] = [];
  const tracePath = join(REPO, "constitution", "trace-index", "trace-index.md");
  if (existsSync(tracePath)) {
    const text = readFileSync(tracePath, "utf8");
    for (const match of text.matchAll(/^\|\s*(T-\d{3})\s*\|\s*(.+?)\s*\|/gm)) {
      records.push({ key: match[1], title: match[2], location: "constitution/trace-index/trace-index.md", citations: ["Implementation Constitution P-4"] });
    }
  }
  const irPath = join(REPO, "constitution", "interpretations", "LEDGER.md");
  if (existsSync(irPath)) {
    const text = readFileSync(irPath, "utf8");
    for (const match of text.matchAll(/^## (IR-\d{3}) — (.+)$/gm)) {
      records.push({ key: match[1], title: match[2], location: "constitution/interpretations/LEDGER.md", citations: ["Implementation Constitution P-5"] });
    }
  }
  return records;
}

function collectDocuments(): { id: string; title: string; path: string; text: string }[] {
  const documents: { id: string; title: string; path: string; text: string }[] = [];
  const walk = (dir: string, prefix: string): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full, `${prefix}${entry}/`);
        continue;
      }
      if (!entry.endsWith(".md")) continue;
      const text = readFileSync(full, "utf8");
      const meta = parseDocMeta(text);
      documents.push({
        id: meta?.id ?? entry,
        title: meta?.title ?? entry,
        path: `constitution/docs/${prefix}${entry}`,
        text,
      });
    }
  };
  walk(join(REPO, "constitution", "docs"), "");
  return documents;
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const limitParam = Number(url.searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 12;

  const index = buildSearchIndex({
    documents: collectDocuments(),
    tokens: allTokens(),
    stages: STAGES,
    symbols: collectSymbols(),
    governance: collectGovernance(),
  });
  const hits = searchKnowledge(index, query, limit);

  return NextResponse.json(
    {
      query,
      priority: ["authority", "registry", "symbol", "documentation"],
      citations: ["constitution/docs/GOVERNANCE.md §4", "Bible Art. VII", "Implementation Constitution P-4"],
      hitCount: hits.length,
      hits: hits.map((hit) => ({
        tier: hit.tierOrdinal,
        tierName: hit.record.tier,
        key: hit.record.key,
        title: hit.record.title,
        location: hit.record.location,
        detail: hit.record.detail,
        citations: hit.record.citations,
      })),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
