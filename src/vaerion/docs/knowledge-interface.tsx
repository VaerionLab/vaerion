'use client';

/**
 * Vaerion — Documentation Architecture / The Knowledge Interface
 *
 * Stage 11 — Deliverable 3. The 2090 experience layer: a developer command
 * center for the Vaerion civilization archive. It renders ONLY data served
 * from the real sources (/api/knowledge — the stage manifest, the knowledge
 * organ, the F-006 release record, the trace index, the interpretation
 * ledger). No invented metric, no placeholder, no demo value (Bible Art.
 * XI; Constitution 1.6). Absence renders as absence.
 *
 * Design law it obeys: deep-OLED environment via the dark chamber (VS §4.1)
 * with every value resolved to generated tokens (1.3); the two voices
 * (VS §2.1); hierarchy by voice, caps, hairlines, ink, and space — no
 * font-size and no font-weight anywhere (IR-005 discipline); motion within
 * the 400 ms bound (Art. V); honest loading and error states (Art. VIII).
 *
 * Display path (IR-020): documentation delivery at the host route's
 * documented hash path (#/knowledge); the ten-surface product registry
 * (4.6) is untouched.
 *
 * Citations: Stage 11 execution order Deliverables 3, 6;
 * constitution/docs/GOVERNANCE.md; Constitution 1.3, 1.6, 4.6; Bible Art.
 * II, V, VII, VIII, XI; Visual System §2.1, §4.1.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

interface StageDto {
  readonly id: number;
  readonly name: string;
  readonly root: string;
  readonly status: string;
  readonly dependsOn: readonly number[];
  readonly purpose: string;
}

interface ReceiptDto {
  readonly kind: string;
  readonly receiptId: string;
  readonly sha256Prefix: string;
  readonly signatureAlgorithm: string;
  readonly authority: string;
}

interface ArtifactDto {
  readonly artifactId: string;
  readonly kind: string;
  readonly name: string;
  readonly sha256Prefix: string;
  readonly origin: string;
  readonly owningRelease: string;
}

interface ChannelDto {
  readonly channel: string;
  readonly stage: string;
  readonly packageIdentity: string;
}

interface ReleaseDto {
  readonly releaseId: string;
  readonly version: string;
  readonly seq: number;
  readonly appendedAt: number;
  readonly parentReleaseId: string | null;
  readonly receipts: readonly ReceiptDto[];
  readonly artifacts: readonly ArtifactDto[];
  readonly channels: readonly ChannelDto[];
}

interface PageDto {
  readonly path: string;
  readonly id: string;
  readonly title: string;
  readonly owningSystem: string;
  readonly confidence: string;
  readonly lastVerified: string;
  readonly verificationCommand: string;
  readonly sections: readonly string[];
  readonly relatedArtifacts: readonly string[];
  readonly authorityCitations: readonly string[];
}

interface TraceEntryDto {
  readonly id: string;
  readonly citation: string;
  readonly governed: string;
  readonly kind: string;
}

interface InterpretationDto {
  readonly id: string;
  readonly title: string;
}

interface CodexChapterDto {
  readonly number: string;
  readonly title: string;
  readonly anchor: string;
  readonly body: string;
}

interface KnowledgePayload {
  readonly generatedAt: number;
  readonly displayPath: { readonly note: string; readonly ruling: string };
  readonly counts: {
    readonly stages: number;
    readonly stagesConformant: number;
    readonly organPages: number;
    readonly pathways: number;
    readonly traceEntries: number;
    readonly interpretations: number;
    readonly receipts: number;
    readonly artifacts: number;
    readonly channels: number;
  };
  readonly stages: readonly StageDto[];
  readonly release: ReleaseDto | null;
  readonly codex: { readonly path: string; readonly chapters: readonly CodexChapterDto[] };
  readonly organPages: readonly PageDto[];
  readonly pathways: readonly PageDto[];
  readonly trace: { readonly path: string; readonly entries: readonly TraceEntryDto[] };
  readonly interpretations: { readonly path: string; readonly entries: readonly InterpretationDto[] };
}

interface SearchHitDto {
  readonly tier: number;
  readonly tierName: string;
  readonly key: string;
  readonly title: string;
  readonly location: string;
  readonly detail: string;
}

const SECTIONS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'codex', label: 'THE CODEX' },
  { id: 'knowledge', label: 'KNOWLEDGE ORGAN' },
  { id: 'stages', label: 'STAGE MANIFEST' },
  { id: 'release', label: 'RELEASE RECORD' },
  { id: 'evidence', label: 'EVIDENCE & GOVERNANCE' },
  { id: 'pathways', label: 'DEVELOPER PATHWAYS' },
  { id: 'search', label: 'HASH-FIRST SEARCH' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

// ─── Machine-voice atoms (tokens only — Constitution 1.3) ───────────────────

function MachineRow(props: { readonly label: string; readonly value: string; readonly mono?: boolean; readonly stack?: boolean }) {
  if (props.stack === true) {
    // Narrow honest degradation (VS §9): the label stacks above the value —
    // never a squeezed measurement column.
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--vx-space-1)',
          padding: 'var(--vx-space-2) var(--vx-space-0)',
          borderBottom: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
        }}
      >
        <span style={{ fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)' }}>{props.label}</span>
        <span
          className="vx-machine"
          style={{
            fontFamily: 'var(--vx-type-voice-machine)',
            fontVariantNumeric: 'var(--vx-type-numeric-tabular)',
            overflowWrap: 'anywhere',
            color: 'var(--vx-color-ink-100)',
          }}
        >
          {props.value}
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--vx-space-2) var(--vx-space-5)',
        padding: 'var(--vx-space-2) var(--vx-space-0)',
        borderBottom: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
        alignItems: 'baseline',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--vx-type-voice-human)',
          color: 'var(--vx-color-ink-32)',
          flexBasis: 'var(--vx-space-margin-rail)',
          flexGrow: 0,
          flexShrink: 1,
          minWidth: 'var(--vx-space-9)',
        }}
      >
        {props.label}
      </span>
      <span
        className="vx-machine"
        style={{
          fontFamily: 'var(--vx-type-voice-machine)',
          fontVariantNumeric: 'var(--vx-type-numeric-tabular)',
          overflowWrap: 'anywhere',
          color: 'var(--vx-color-ink-100)',
          flex: '1 1 0',
          minWidth: 0,
        }}
      >
        {props.value}
      </span>
    </div>
  );
}

function SectionHeading(props: { readonly human: string; readonly machine: string }) {
  return (
    <div style={{ marginBottom: 'var(--vx-space-6)' }}>
      <div style={{ fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-100)' }}>{props.human}</div>
      <div className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', letterSpacing: '0.08em' }}>
        {props.machine}
      </div>
      <div style={{ height: 'var(--vx-shape-hairline-width)', background: 'var(--vx-color-ink-16)', marginTop: 'var(--vx-space-3)' }} />
    </div>
  );
}

function Card(props: { readonly title: string; readonly children: React.ReactNode; readonly onClick?: () => void; readonly active?: boolean }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.active}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
        borderRadius: 'var(--vx-shape-radius-2)',
        padding: 'var(--vx-space-5)',
        cursor: props.onClick ? 'pointer' : 'default',
        color: 'inherit',
        transition: `border-color var(--vx-motion-bound-max) var(--vx-motion-curve-settle-out)`,
      }}
    >
      <div className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-32)' }}>{props.title}</div>
      <div style={{ marginTop: 'var(--vx-space-3)', fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-100)' }}>{props.children}</div>
    </button>
  );
}

// ─── The interface ──────────────────────────────────────────────────────────

export function KnowledgeInterface() {
  const [payload, setPayload] = useState<KnowledgePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<SectionId>('overview');
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const [openPage, setOpenPage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [hits, setHits] = useState<readonly SearchHitDto[]>([]);
  // Honest degradation (VS §9; IR-010 pins): below the registered 768 px
  // breakpoint the rail goes horizontal and the measure tightens.
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = (): void => setNarrow(!query.matches);
    update();
    query.addEventListener('change', update);
    return () => {
      query.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/knowledge')
      .then((response) => {
        if (!response.ok) throw new Error(`the knowledge service answered ${response.status}`);
        return response.json() as Promise<KnowledgePayload>;
      })
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'the knowledge service could not be reached');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    fetch(`/api/knowledge/search?q=${encodeURIComponent(trimmed)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`search answered ${response.status}`);
        return response.json() as Promise<{ hits: readonly SearchHitDto[] }>;
      })
      .then((data) => {
        setHits(data.hits);
        setSearched(true);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'search could not be reached');
      });
  }, [query]);

  const activeSection = useMemo(() => SECTIONS.find((entry) => entry.id === section) ?? SECTIONS[0], [section]);
  const chapter = openChapter === null ? null : payload?.codex.chapters.find((entry) => entry.anchor === openChapter) ?? null;
  const page = openPage === null ? null : [...(payload?.organPages ?? []), ...(payload?.pathways ?? [])].find((entry) => entry.path === openPage) ?? null;

  return (
    <div
      data-chamber="dark"
      role="main"
      aria-label="Vaerion Knowledge Interface (documentation delivery — IR-020)"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--vx-color-ground)',
        color: 'var(--vx-color-ink-100)',
      }}
    >
      {/* ── Header: identity of the archive (Machine Voice) ── */}
      <header
        style={{
          borderBottom: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
          padding: narrow ? 'var(--vx-space-5) var(--vx-space-5)' : 'var(--vx-space-6) var(--vx-space-9)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--vx-space-3)',
        }}
      >
        <div className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-32)', overflowWrap: 'anywhere' }}>
          VAERION KNOWLEDGE INTERFACE · STAGE 11 — DOCUMENTATION · PROTOCOL 1.6.0 · REGISTRY 1.0.0
        </div>
        <div style={{ fontFamily: 'var(--vx-type-voice-human)' }}>
          The operating manual of a verifiable runtime. Every statement below is
          served from the system of record and mechanically checked by
          <span className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)' }}> bun run vaerion:verify-documentation</span>.
        </div>
        <div className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', letterSpacing: '0.08em' }}>
          {payload?.displayPath.note ?? 'documentation delivery'} · display path: {payload?.displayPath.ruling ?? 'IR-020'} · constitution 4.6 (the ten registered surfaces are untouched)
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', flex: 1, alignItems: 'stretch', minHeight: 0 }}>
        {/* ── The rail: intelligent navigation ── */}
        <nav
          aria-label="Knowledge Interface sections"
          style={
            narrow
              ? {
                  width: '100%',
                  minWidth: 0,
                  flexShrink: 1,
                  borderBottom: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
                  padding: 'var(--vx-space-2) var(--vx-space-3)',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 'var(--vx-space-1)',
                  overflowX: 'auto',
                }
              : {
                  width: 'var(--vx-space-margin-rail)',
                  flexShrink: 0,
                  borderRight: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
                  padding: 'var(--vx-space-6) var(--vx-space-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--vx-space-1)',
                }
          }
        >
          {SECTIONS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSection(entry.id)}
              aria-current={section === entry.id}
              style={{
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderLeft: narrow
                  ? undefined
                  : (section === entry.id ? '2px solid var(--vx-color-accent-brass-glyph)' : '2px solid transparent'),
                borderTop: narrow
                  ? (section === entry.id ? '2px solid var(--vx-color-accent-brass-glyph)' : '2px solid transparent')
                  : undefined,
                padding: 'var(--vx-space-3) var(--vx-space-4)',
                color: section === entry.id ? 'var(--vx-color-ink-100)' : 'var(--vx-color-ink-32)',
                fontFamily: 'var(--vx-type-voice-machine)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                minHeight: 'var(--vx-space-touch-minimum)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: `color var(--vx-motion-bound-max) var(--vx-motion-curve-settle-out)`,
              }}
            >
              {entry.label}
            </button>
          ))}
          {!narrow && (
            <div style={{ marginTop: 'var(--vx-space-6)', fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-32)', overflowWrap: 'anywhere' }}>
              {payload === null ? '· · ·' : `${payload.counts.stagesConformant}/${payload.counts.stages} stages conformant · ${payload.counts.organPages} organ pages · ${payload.counts.traceEntries} trace entries`}
            </div>
          )}
        </nav>

        {/* ── The reading column ── */}
        <main
          key={activeSection.id}
          style={{
            flex: 1,
            minWidth: 0,
            padding: narrow ? 'var(--vx-space-5)' : 'var(--vx-space-9)',
            opacity: 1,
            transition: `opacity var(--vx-motion-bound-max) var(--vx-motion-curve-settle-out)`,
            overflowY: 'auto',
          }}
        >
          {error !== null && (
            <div role="alert" style={{ border: 'var(--vx-shape-hairline-width) solid var(--vx-color-verdict-failed)', borderRadius: 'var(--vx-shape-radius-2)', padding: 'var(--vx-space-5)' }}>
              <div className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)' }}>the archive could not be read — honesty before comfort (Art. VIII)</div>
              <div style={{ marginTop: 'var(--vx-space-3)', fontFamily: 'var(--vx-type-voice-human)' }}>{error}</div>
              <div className="vx-machine" style={{ marginTop: 'var(--vx-space-3)', fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-32)' }}>
                the archive verifies its own sources: bun run vaerion:publish-docs &amp;&amp; bun run vaerion:verify-documentation
              </div>
            </div>
          )}

          {error === null && payload === null && (
            <div style={{ fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)' }}>
              Reading the archive from the system of record — no progress is
              claimed before it is measured (Art. VIII).
            </div>
          )}

          {payload !== null && section === 'overview' && (
            <Overview payload={payload} narrow={narrow} />
          )}

          {payload !== null && section === 'codex' && (
            <CodexSection
              chapters={payload.codex.chapters}
              path={payload.codex.path}
              chapter={chapter}
              onOpenChapter={setOpenChapter}
              onClose={() => setOpenChapter(null)}
            />
          )}

          {payload !== null && section === 'knowledge' && (
            <OrganSection pages={payload.organPages} page={page} narrow={narrow} onOpenPage={setOpenPage} onClose={() => setOpenPage(null)} />
          )}

          {payload !== null && section === 'stages' && <StagesSection stages={payload.stages} />}

          {payload !== null && section === 'release' && <ReleaseSection release={payload.release} narrow={narrow} />}

          {payload !== null && section === 'evidence' && (
            <EvidenceSection trace={payload.trace} interpretations={payload.interpretations} />
          )}

          {payload !== null && section === 'pathways' && (
            <OrganSection pages={payload.pathways} page={page} narrow={narrow} onOpenPage={setOpenPage} onClose={() => setOpenPage(null)} />
          )}

          {payload !== null && section === 'search' && (
            <SearchSection
              query={query}
              onQueryChange={setQuery}
              onSearch={runSearch}
              hits={hits}
              searched={searched}
            />
          )}
        </main>
      </div>

      {/* ── Sticky footer: the memory law ── */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
          padding: narrow ? 'var(--vx-space-4) var(--vx-space-5)' : 'var(--vx-space-4) var(--vx-space-9)',
          display: 'flex',
          gap: 'var(--vx-space-6)',
          alignItems: 'baseline',
          flexWrap: 'wrap',
        }}
      >
        <span className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-32)' }}>
          "Documentation is the memory of the system."
        </span>
        <span className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', letterSpacing: '0.08em' }}>
          GOVERNANCE.md §1 · verified by bun run vaerion:verify-documentation · nothing is believed; everything is verified
        </span>
      </footer>
    </div>
  );
}

// ─── Sections ───────────────────────────────────────────────────────────────

function Overview(props: { readonly payload: KnowledgePayload; readonly narrow: boolean }) {
  const { payload } = props;
  const release = payload.release;
  return (
    <div>
      <SectionHeading human="The system at a glance" machine="OVERVIEW · EVERY VALUE SERVED FROM THE SYSTEM OF RECORD" />
      <div style={{ minWidth: 0 }}>
        <MachineRow stack={props.narrow} label="Stages conformant" value={`${payload.counts.stagesConformant} of ${payload.counts.stages}`} />
        <MachineRow stack={props.narrow} label="Knowledge organ pages" value={String(payload.counts.organPages)} />
        <MachineRow stack={props.narrow} label="Developer pathways" value={String(payload.counts.pathways)} />
        <MachineRow stack={props.narrow} label="Trace index entries" value={`T-001 … T-${String(payload.counts.traceEntries).padStart(3, '0')}`} />
        <MachineRow stack={props.narrow} label="Interpretation requests" value={String(payload.counts.interpretations)} />
        <MachineRow stack={props.narrow} label="Release receipts on record" value={String(payload.counts.receipts)} />
        <MachineRow stack={props.narrow} label="Provenanced artifacts" value={String(payload.counts.artifacts)} />
        <MachineRow stack={props.narrow} label="Distribution channels" value={`${payload.counts.channels} (all signed — delivery evidence pending, IR-019)`} />
        {release !== null && (
          <>
            <MachineRow stack={props.narrow} label="First release" value={`${release.releaseId} · ${release.version} · ledger seq ${release.seq} · parent ${release.parentReleaseId ?? 'genesis'}`} />
            <MachineRow stack={props.narrow} label="Signature discipline" value="sha256-deterministic-placeholder bound to keys/release-signing.pub (IR-017)" />
          </>
        )}
        {release === null && (
          <MachineRow stack={props.narrow} label="First release" value="none recorded — the ceremony has not issued a release on this tree (Constitution 10.3)" />
        )}
      </div>
      <div style={{ marginTop: 'var(--vx-space-9)', fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)' }}>
        Four pathways carry a developer from first contact to constitutional
        engineering; the Codex holds the twelve-chapter archive; the evidence
        section exposes the trace index and the interpretation ledger exactly
        as governance keeps them.
      </div>
    </div>
  );
}

function CodexSection(props: {
  readonly chapters: readonly CodexChapterDto[];
  readonly path: string;
  readonly chapter: CodexChapterDto | null;
  readonly onOpenChapter: (anchor: string) => void;
  readonly onClose: () => void;
}) {
  if (props.chapter !== null) {
    return (
      <div>
        <SectionHeading human={`Chapter ${props.chapter.number} — ${props.chapter.title}`} machine={`THE VAERION CODEX · ${props.path}`} />
        <CodexBody body={props.chapter.body} />
        <div style={{ marginTop: 'var(--vx-space-6)' }}>
          <ReturnButton onClick={props.onClose} label="Return to the chapter index" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionHeading human="The Vaerion Codex — twelve chapters" machine="VAERION_CODEX_v1.0 · EVERY CHAPTER REFERENCES REAL IMPLEMENTATION" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'var(--vx-space-4)' }}>
        {props.chapters.map((entry) => (
          <Card key={entry.anchor} title={`CHAPTER ${entry.number}`} onClick={() => props.onOpenChapter(entry.anchor)}>
            {entry.title}
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrganSection(props: {
  readonly pages: readonly PageDto[];
  readonly page: PageDto | null;
  readonly narrow: boolean;
  readonly onOpenPage: (path: string) => void;
  readonly onClose: () => void;
}) {
  if (props.page !== null) {
    return (
      <div>
        <SectionHeading human={props.page.title} machine={`${props.page.path} · DOC-META id: ${props.page.id || 'unparsed'}`} />
        <div style={{ minWidth: 0 }}>
          <MachineRow stack={props.narrow} label="Owning system" value={props.page.owningSystem || 'not declared'} />
          <MachineRow stack={props.narrow} label="Confidence state" value={props.page.confidence || 'not declared'} />
          <MachineRow stack={props.narrow} label="Last verified" value={props.page.lastVerified || 'not declared'} />
          <MachineRow stack={props.narrow} label="Verification command" value={props.page.verificationCommand || 'not declared'} />
          <MachineRow stack={props.narrow} label="Authority citations" value={props.page.authorityCitations.join(' · ') || 'none declared'} />
          <MachineRow stack={props.narrow} label="Related artifacts" value={props.page.relatedArtifacts.join(' · ') || 'none declared'} />
          <MachineRow stack={props.narrow} label="Sections" value={props.page.sections.join(' · ') || 'none'} />
        </div>
        <div style={{ marginTop: 'var(--vx-space-6)' }}>
          <ReturnButton onClick={props.onClose} label="Return to the page index" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionHeading
        human="The knowledge organ"
        machine="CONSTITUTION/DOCS · EVERY PAGE CARRIES DOC-META: AUTHORITY · OWNER · ARTIFACTS · CONFIDENCE · VERIFICATION"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'var(--vx-space-4)' }}>
        {props.pages.map((entry) => (
          <Card key={entry.path} title={entry.id || entry.path} onClick={() => props.onOpenPage(entry.path)}>
            {entry.title}
            <div className="vx-machine" style={{ marginTop: 'var(--vx-space-2)', fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-32)' }}>
              {entry.confidence || '?'} · verified {entry.lastVerified || '?'} · {entry.sections.length} section(s)
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StagesSection(props: { readonly stages: readonly StageDto[] }) {
  return (
    <div>
      <SectionHeading human="The stage manifest" machine="SRC/VAERION/FOUNDATION/STAGES.TS · F-007 DEPENDENCY GRAPH · SKIPPING IS STRUCTURALLY IMPOSSIBLE" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-3)' }}>
        {props.stages.map((stage) => (
          <div
            key={stage.id}
            style={{
              border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
              borderRadius: 'var(--vx-shape-radius-2)',
              padding: 'var(--vx-space-5)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--vx-space-5)', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)' }}>
                STAGE {stage.id}
              </span>
              <span style={{ fontFamily: 'var(--vx-type-voice-human)' }}>{stage.name}</span>
              <span className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', letterSpacing: '0.08em' }}>
                {stage.status} · depends on [{stage.dependsOn.join(', ') || '—'}] · {stage.root}
              </span>
            </div>
            <div style={{ marginTop: 'var(--vx-space-3)', fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)' }}>{stage.purpose}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReleaseSection(props: { readonly release: ReleaseDto | null; readonly narrow: boolean }) {
  const release = props.release;
  return (
    <div>
      <SectionHeading human="The release record" machine="CONSTITUTION/RELEASES (F-006) · SEVEN RECEIPTS · EIGHT CHANNELS · NOTHING IS BELIEVED" />
      {release === null ? (
        <div style={{ fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)' }}>
          No release is recorded. The Release Engine issues receipts only after
          the full graph verifies (Constitution 10.1–10.3); absence is rendered
          as absence, never as a fabricated zero.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-6)' }}>
          <div>
            <div className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', marginBottom: 'var(--vx-space-3)' }}>THE CEREMONY</div>
            <MachineRow stack={props.narrow} label="Release" value={`${release.releaseId} · ${release.version}`} />
            <MachineRow stack={props.narrow} label="Ledger" value={`seq ${release.seq} · parent ${release.parentReleaseId ?? 'genesis'} · appended at ${release.appendedAt} ms epoch`} />
          </div>
          <div>
            <div className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', marginBottom: 'var(--vx-space-3)' }}>THE SEVEN RECEIPTS (10.3)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-2)' }}>
              {release.receipts.map((receipt) => (
                <div
                  key={receipt.receiptId}
                  className="vx-machine"
                  style={{
                    fontFamily: 'var(--vx-type-voice-machine)',
                    border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
                    borderRadius: 'var(--vx-shape-radius-2)',
                    padding: 'var(--vx-space-3) var(--vx-space-4)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {receipt.kind.toUpperCase()} · {receipt.receiptId} · sha256:{receipt.sha256Prefix}… · {receipt.signatureAlgorithm}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', marginBottom: 'var(--vx-space-3)' }}>ARTIFACT INTELLIGENCE — NOTHING ANONYMOUS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-2)' }}>
              {release.artifacts.map((artifact) => (
                <div
                  key={artifact.artifactId}
                  className="vx-machine"
                  style={{
                    fontFamily: 'var(--vx-type-voice-machine)',
                    border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)',
                    borderRadius: 'var(--vx-shape-radius-2)',
                    padding: 'var(--vx-space-3) var(--vx-space-4)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {artifact.kind} · {artifact.name} · sha256:{artifact.sha256Prefix}… · origin: {artifact.origin}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', marginBottom: 'var(--vx-space-3)' }}>DISTRIBUTION — EIGHT CHANNELS, ALL SIGNED (DELIVERY EVIDENCE PENDING — IR-019)</div>
            <div className="vx-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - var(--vx-space-10))' }}>
              {release.channels.map((channel) => (
                <MachineRow key={channel.channel} stack={props.narrow} label={channel.channel} value={`${channel.stage} · ${channel.packageIdentity}`} mono />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceSection(props: {
  readonly trace: { readonly path: string; readonly entries: readonly TraceEntryDto[] };
  readonly interpretations: { readonly path: string; readonly entries: readonly InterpretationDto[] };
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-8)' }}>
      <div>
        <SectionHeading
          human="The Constitutional Trace Index"
          machine={`${props.trace.path} · P-4 · AN UNCITABLE DECISION IS A VIOLATION BY DEFINITION`}
        />
        <div className="vx-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - var(--vx-space-10))', border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)', borderRadius: 'var(--vx-shape-radius-2)', padding: 'var(--vx-space-4)' }}>
          {props.trace.entries.map((entry) => (
            <div key={entry.id} style={{ padding: 'var(--vx-space-2) var(--vx-space-0)', borderBottom: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)' }}>
              <span className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-accent-brass-text)' }}>{entry.id}</span>
              <span className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-32)' }}> — {entry.citation}</span>
              <div style={{ fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)', overflowWrap: 'anywhere' }}>{entry.governed}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionHeading
          human="The interpretation ledger"
          machine={`${props.interpretations.path} · P-5 · IMPROVISED RESOLUTION OF SILENCE IS A VIOLATION`}
        />
        <div className="vx-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - var(--vx-space-10))', border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)', borderRadius: 'var(--vx-shape-radius-2)', padding: 'var(--vx-space-4)' }}>
          {props.interpretations.entries.map((entry) => (
            <div key={entry.id} style={{ padding: 'var(--vx-space-2) var(--vx-space-0)', borderBottom: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)' }}>
              <span className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-accent-brass-text)' }}>{entry.id}</span>
              <span style={{ fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)' }}> — {entry.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TIER_NAMES: Readonly<Record<number, string>> = {
  1: 'TIER 1 — EXACT AUTHORITY REFERENCES',
  2: 'TIER 2 — REGISTRY IDENTIFIERS',
  3: 'TIER 3 — IMPLEMENTATION SYMBOLS',
  4: 'TIER 4 — DOCUMENTATION',
};

function SearchSection(props: {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly onSearch: () => void;
  readonly hits: readonly SearchHitDto[];
  readonly searched: boolean;
}) {
  return (
    <div>
      <SectionHeading
        human="Hash-first search"
        machine="GOVERNANCE.md §4 · A QUERY THAT IS A MEASUREMENT MUST HIT THE MEASUREMENT, NOT PROSE"
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onSearch();
        }}
        style={{ display: 'flex', gap: 'var(--vx-space-3)', maxWidth: 'var(--vx-space-margin-rail)' }}
      >
        <input
          type="search"
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder="Art. VI · §5.7 · P-4 · space.7 · ConstitutionalViolationError · release"
          aria-label="Search the knowledge system (hash-first: authority references, registry identifiers, symbols, then documentation)"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-32)',
            borderRadius: 'var(--vx-shape-radius-2)',
            padding: 'var(--vx-space-3) var(--vx-space-4)',
            color: 'var(--vx-color-ink-100)',
            fontFamily: 'var(--vx-type-voice-machine)',
            minHeight: 'var(--vx-space-touch-minimum)',
          }}
        />
        <button
          type="submit"
          className="vx-button"
          style={{
            border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-32)',
            borderRadius: 'var(--vx-shape-radius-2)',
            background: 'transparent',
            color: 'var(--vx-color-ink-100)',
            fontFamily: 'var(--vx-type-voice-machine)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: 'var(--vx-space-3) var(--vx-space-5)',
            cursor: 'pointer',
            minHeight: 'var(--vx-space-touch-minimum)',
          }}
        >
          RESOLVE
        </button>
      </form>
      <div className="vx-micro" style={{ marginTop: 'var(--vx-space-3)', fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', letterSpacing: '0.08em' }}>
        try: Art. XII · §5.7 · P-4 · space.7 · motion.life.return · ConstitutionalViolationError · rel_769da4b7bf84ad3b · IR-020
      </div>
      {props.searched && props.hits.length === 0 && (
        <div style={{ marginTop: 'var(--vx-space-6)', fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)' }}>
          No record resolves for that query. The index invents nothing — an
          empty result is rendered as the empty result it is (Art. VIII).
        </div>
      )}
      {props.hits.length > 0 && (
        <div style={{ marginTop: 'var(--vx-space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-6)' }}>
          {[1, 2, 3, 4].map((tier) => {
            const tierHits = props.hits.filter((hit) => hit.tier === tier);
            if (tierHits.length === 0) return null;
            return (
              <div key={tier}>
                <div className="vx-micro" style={{ fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', marginBottom: 'var(--vx-space-3)', letterSpacing: '0.08em' }}>
                  {TIER_NAMES[tier]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-2)' }}>
                  {tierHits.map((hit) => (
                    <div
                      key={`${hit.tier}-${hit.key}`}
                      style={{ border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-16)', borderRadius: 'var(--vx-shape-radius-2)', padding: 'var(--vx-space-3) var(--vx-space-4)' }}
                    >
                      <div className="vx-machine" style={{ fontFamily: 'var(--vx-type-voice-machine)', overflowWrap: 'anywhere' }}>
                        {hit.key}
                        <span style={{ color: 'var(--vx-color-ink-32)' }}> — {hit.title}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-32)', overflowWrap: 'anywhere' }}>
                        {hit.location} · {hit.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the markdown subset the Codex uses (**bold**, `code`, ## headings,
 * - lists) with token-lawful emphasis only: strength is carried by brass ink
 * and the machine voice — never by font-weight (IR-005 discipline; VS §2.1).
 * Paragraphs are blank-line separated; the source's fixed-width line wraps
 * are joined so sentences read as sentences.
 */
function CodexBody(props: { readonly body: string }) {
  const renderInline = (line: string, keyPrefix: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let index = 0;
    while ((match = pattern.exec(line)) !== null) {
      if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
      const tokenText = match[0];
      if (tokenText.startsWith('**')) {
        parts.push(
          <span key={`${keyPrefix}-s${index}`} style={{ color: 'var(--vx-color-accent-brass-text)' }}>
            {tokenText.slice(2, -2)}
          </span>,
        );
      } else {
        parts.push(
          <span key={`${keyPrefix}-c${index}`} style={{ fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-100)' }}>
            {tokenText.slice(1, -1)}
          </span>,
        );
      }
      lastIndex = match.index + tokenText.length;
      index += 1;
    }
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return parts;
  };

  // Join wrapped lines into blocks: a block ends at a blank line or at a
  // structural line (heading / list / fence).
  const isStructural = (line: string): boolean =>
    line.startsWith('# ') || line.startsWith('## ') || line.startsWith('- ') || line.startsWith('* ') || line.startsWith('```');
  const blocks: { readonly kind: 'heading1' | 'heading2' | 'list' | 'paragraph'; readonly text: string }[] = [];
  let buffer: string[] = [];
  const flush = (): void => {
    if (buffer.length > 0) {
      blocks.push({ kind: 'paragraph', text: buffer.join(' ').trim() });
      buffer = [];
    }
  };
  for (const rawLine of props.body.split('\n')) {
    const line = rawLine.trimEnd();
    if (isStructural(line) || line.trim().length === 0) {
      flush();
      if (line.startsWith('## ')) blocks.push({ kind: 'heading2', text: line.slice(3) });
      else if (line.startsWith('# ')) blocks.push({ kind: 'heading1', text: line.slice(2) });
      else if (line.startsWith('- ') || line.startsWith('* ')) blocks.push({ kind: 'list', text: line.slice(2) });
      continue;
    }
    buffer.push(line.trim());
  }
  flush();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-4)' }}>
      {blocks.map((block, blockIndex) => {
        const key = `b${blockIndex}`;
        if (block.kind === 'heading2') {
          return (
            <div key={key} className="vx-micro" style={{ marginTop: 'var(--vx-space-6)', fontFamily: 'var(--vx-type-voice-machine)', textTransform: 'uppercase', color: 'var(--vx-color-ink-32)', letterSpacing: '0.08em' }}>
              {renderInline(block.text, key)}
            </div>
          );
        }
        if (block.kind === 'heading1') {
          return (
            <div key={key} style={{ marginTop: 'var(--vx-space-6)', fontFamily: 'var(--vx-type-voice-human)', color: 'var(--vx-color-ink-100)' }}>
              {renderInline(block.text, key)}
            </div>
          );
        }
        if (block.kind === 'list') {
          return (
            <div key={key} style={{ display: 'flex', gap: 'var(--vx-space-3)', fontFamily: 'var(--vx-type-voice-human)', lineHeight: 'var(--vx-type-leading-human)' }}>
              <span style={{ color: 'var(--vx-color-ink-32)' }}>—</span>
              <span>{renderInline(block.text, key)}</span>
            </div>
          );
        }
        return (
          <p key={key} style={{ margin: 0, fontFamily: 'var(--vx-type-voice-human)', lineHeight: 'var(--vx-type-leading-human)', color: 'var(--vx-color-ink-100)' }}>
            {renderInline(block.text, key)}
          </p>
        );
      })}
    </div>
  );
}

function ReturnButton(props: { readonly onClick: () => void; readonly label: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-label={props.label}
      className="vx-button"
      style={{
        border: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-32)',
        borderRadius: 'var(--vx-shape-radius-2)',
        background: 'transparent',
        color: 'var(--vx-color-ink-100)',
        fontFamily: 'var(--vx-type-voice-machine)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: 'var(--vx-space-3) var(--vx-space-5)',
        cursor: 'pointer',
        minHeight: 'var(--vx-space-touch-minimum)',
      }}
    >
      ← RETURN
    </button>
  );
}
