import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

import { STAGES } from "@/vaerion/foundation/stages";
import { parseDocMeta } from "@/vaerion/docs/governance";

/**
 * READ-ONLY delivery of the Vaerion Knowledge Interface data (Stage 11,
 * order Deliverable 3). Everything served here is read from the real
 * sources at request time — the stage manifest, the knowledge organ
 * (constitution/docs/), the F-006 release record, the trace index, and the
 * interpretation ledger. The route fabricates nothing: absence renders as
 * absence (Bible Art. VIII; XI).
 *
 * Display path (IR-020): the interface is documentation delivery rendered
 * at the host route's documented hash path (#/knowledge); it adds no
 * eleventh surface to SURFACE_REGISTRY (Constitution 4.6; 3.11).
 *
 * Citations: Stage 11 execution order Deliverables 1-6;
 * constitution/docs/GOVERNANCE.md; Constitution 4.6, 1.6, P-4, P-5; F-006.
 */

export const dynamic = "force-dynamic";

const REPO = process.cwd();
const ORGAN = join(REPO, "constitution", "docs");
const RECEIPTS_DIR = join(REPO, "constitution", "releases", "receipts");

interface OrganPageDto {
  path: string;
  id: string;
  title: string;
  owningSystem: string;
  confidence: string;
  lastVerified: string;
  verificationCommand: string;
  sections: readonly string[];
  relatedArtifacts: readonly string[];
  authorityCitations: readonly string[];
}

function collectOrganPages(): OrganPageDto[] {
  const pages: OrganPageDto[] = [];
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
      const sections = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
      pages.push({
        path: `constitution/docs/${prefix}${entry}`,
        id: meta?.id ?? "",
        title: meta?.title ?? entry,
        owningSystem: meta?.owningSystem ?? "",
        confidence: meta?.confidence ?? "",
        lastVerified: meta?.lastVerified ?? "",
        verificationCommand: meta?.verificationCommand ?? "",
        sections,
        relatedArtifacts: meta?.relatedArtifacts ?? [],
        authorityCitations: meta?.authorityCitations ?? [],
      });
    }
  };
  walk(ORGAN, "");
  return pages;
}

interface CodexChapter {
  number: string;
  title: string;
  anchor: string;
  body: string;
}

function readCodexChapters(): CodexChapter[] {
  const codexPath = join(ORGAN, "VAERION_CODEX_v1.0.md");
  if (!existsSync(codexPath)) return [];
  const text = readFileSync(codexPath, "utf8");
  const chapters: CodexChapter[] = [];
  const matches = [...text.matchAll(/^# (CHAPTER ([IVX]+) — .+)$/gm)];
  for (let index = 0; index < matches.length; index += 1) {
    const start = (matches[index].index ?? 0) + matches[index][0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length;
    chapters.push({
      number: matches[index][2],
      title: matches[index][1].replace(/^CHAPTER [IVX]+ — /, ""),
      anchor: `chapter-${matches[index][2].toLowerCase()}`,
      body: text.slice(start, end).trim(),
    });
  }
  return chapters;
}

export function GET() {
  // The stage manifest — the live build order.
  const stages = STAGES.map((stage) => ({
    id: stage.id,
    name: stage.name,
    root: stage.root,
    status: stage.status,
    dependsOn: stage.dependsOn,
    purpose: stage.purpose,
  }));

  // The F-006 release record — the real receipts, artifacts, channels.
  let release: Record<string, unknown> | null = null;
  const releasesIndexPath = join(REPO, "constitution", "releases", "index.json");
  if (existsSync(releasesIndexPath)) {
    const index = JSON.parse(readFileSync(releasesIndexPath, "utf8")) as {
      entries: { releaseId: string; version: string; seq: number; appendedAt: number; parentReleaseId: string | null; receiptsFile: string }[];
    };
    const first = index.entries[0];
    if (first && existsSync(join(RECEIPTS_DIR, first.receiptsFile))) {
      const record = JSON.parse(readFileSync(join(RECEIPTS_DIR, first.receiptsFile), "utf8")) as {
        receipts: { kind: string; receiptId: string; sha256: string; signatureAlgorithm: string; authority: string }[];
        artifacts: { artifactId: string; kind: string; name: string; sha256: string; origin: string; owningRelease: string }[];
        distribution: { distributionId: string; channel: string; stage: string; packageIdentity: string }[];
      };
      release = {
        releaseId: first.releaseId,
        version: first.version,
        seq: first.seq,
        appendedAt: first.appendedAt,
        parentReleaseId: first.parentReleaseId,
        receipts: record.receipts.map((receipt) => ({
          kind: receipt.kind,
          receiptId: receipt.receiptId,
          sha256Prefix: receipt.sha256.slice(0, 16),
          signatureAlgorithm: receipt.signatureAlgorithm,
          authority: receipt.authority,
        })),
        artifacts: record.artifacts.map((artifact) => ({
          artifactId: artifact.artifactId,
          kind: artifact.kind,
          name: artifact.name,
          sha256Prefix: artifact.sha256.slice(0, 16),
          origin: artifact.origin,
          owningRelease: artifact.owningRelease,
        })),
        channels: record.distribution.map((channel) => ({
          channel: channel.channel,
          stage: channel.stage,
          packageIdentity: channel.packageIdentity,
        })),
      };
    }
  }

  // The trace index — parsed live from the ledger of record.
  const tracePath = join(REPO, "constitution", "trace-index", "trace-index.md");
  const traceText = existsSync(tracePath) ? readFileSync(tracePath, "utf8") : "";
  const traceEntries = [...traceText.matchAll(/^\|\s*(T-\d{3})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/gm)]
    .map((m) => ({ id: m[1], citation: m[2], governed: m[3], kind: m[4] }));

  // The interpretation ledger.
  const irPath = join(REPO, "constitution", "interpretations", "LEDGER.md");
  const irText = existsSync(irPath) ? readFileSync(irPath, "utf8") : "";
  const interpretations = [...irText.matchAll(/^## (IR-\d{3}) — (.+)$/gm)]
    .map((m) => ({ id: m[1], title: m[2] }));

  const pages = collectOrganPages();
  const organPages = pages.filter((page) => !page.path.includes("/pathways/"));
  const pathwayPages = pages.filter((page) => page.path.includes("/pathways/"));

  const counts = {
    stages: STAGES.length,
    stagesConformant: STAGES.filter((stage) => stage.status === "conformant").length,
    organPages: organPages.length,
    pathways: pathwayPages.length,
    traceEntries: traceEntries.length,
    interpretations: interpretations.length,
    receipts: release ? (release.receipts as unknown[]).length : 0,
    artifacts: release ? (release.artifacts as unknown[]).length : 0,
    channels: release ? (release.channels as unknown[]).length : 0,
  };

  return NextResponse.json(
    {
      generatedAt: Date.now(),
      displayPath: {
        note: "documentation delivery — not a registered product surface (Constitution 4.6)",
        ruling: "IR-020",
        citations: ["Constitution 4.6; 3.11; P-5", "constitution/docs/GOVERNANCE.md §6"],
      },
      counts,
      stages,
      release,
      codex: {
        path: "constitution/docs/VAERION_CODEX_v1.0.md",
        chapters: readCodexChapters(),
      },
      organPages,
      pathways: pathwayPages,
      trace: { path: "constitution/trace-index/trace-index.md", entries: traceEntries },
      interpretations: { path: "constitution/interpretations/LEDGER.md", entries: interpretations },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
