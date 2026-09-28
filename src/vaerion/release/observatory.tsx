/**
 * Vaerion — Release / The Release Observatory
 *
 * "Build the command center. Not a dashboard. A Release Observatory."
 * (order Deliverable 9.) It displays: the release chain, the constitution
 * version, the registry evolution, the snapshot evolution, the artifact
 * graph, the integrity status, the deployment history, the rollback
 * history, the evidence graph, and the verification timeline.
 *
 * Law of this instrument: every visualization originates from real release
 * data — the props ARE the ledger, the receipts, the artifacts, the
 * distribution records. There is no demo data, no placeholder metric, no
 * invented number (Bible Art. XI; Constitution 1.6 applied to tooling).
 * Absence renders as an honest "none recorded" — never as a zero dressed
 * as data.
 *
 * Display path (IR-018): the observatory is generated as a pipeline
 * artifact (tools/vaerion-pipeline/observatory/index.html) and served
 * read-only; promoting it into the product surface set (4.6) is the
 * Founder's ruling to make.
 *
 * All visual values resolve to registry bindings through the generated CSS
 * custom properties (Constitution 1.3; 2.7; F-005).
 *
 * Citations: Constitution Part X, 10.3, 1.3, 1.6, P-4; Bible Art. III, XI;
 * order Deliverable 9.
 */

import type { ReleaseLedgerEntry } from './ledger';
import type { ReleaseReceipt } from './receipt';
import type { ArtifactRecord } from './artifacts';
import type { DistributionRecord } from './distribution';
import type { ArticleGateResult } from './verification';
import type { TrustFinding } from './trust';

/** One verification-timeline event (real gate evidence, recorded at gate time). */
export interface ObservatoryVerificationEvent {
  readonly area: string;
  readonly verdict: 'PASS' | 'FAIL';
  readonly evidence: string;
  readonly recordedAt: number;
}

/** The honest deployment state of a channel (never fabricated — IR-019). */
export interface ObservatoryDeploymentState {
  readonly channel: string;
  readonly stage: string;
  readonly packageIdentity: string;
}

/** Everything the observatory renders — and nothing else. */
export interface ObservatoryData {
  readonly releaseId: string;
  readonly version: string;
  readonly constitutionalVersion: string;
  readonly registryVersion: string;
  readonly registryTokenCount: number;
  readonly snapshotVersion: string;
  readonly snapshotCaptureCount: number;
  readonly ledgerEntries: readonly ReleaseLedgerEntry[];
  readonly receipts: readonly ReleaseReceipt[];
  readonly artifacts: readonly ArtifactRecord[];
  readonly distribution: readonly ObservatoryDeploymentState[];
  readonly rollbacks: readonly { readonly rollbackId: string; readonly supersedes: string; readonly reason: string }[];
  readonly trustFindings: readonly TrustFinding[];
  readonly verificationTimeline: readonly ObservatoryVerificationEvent[];
  readonly articles: readonly ArticleGateResult[];
  readonly generatedAt: number;
}

function Row(props: { readonly label: string; readonly value: string; readonly mono?: boolean }): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--vx-space-5)',
        padding: 'var(--vx-space-3) var(--vx-space-0)',
        borderBottom: '1px solid var(--vx-color-hairline, currentColor)',
        alignItems: 'baseline',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--vx-type-voice-machine)',
          fontSize: 'var(--vx-type-size--2, 0.75rem)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          minWidth: '14rem',
          color: 'var(--vx-color-ink-2, inherit)',
        }}
      >
        {props.label}
      </span>
      <span
        style={{
          fontFamily: props.mono ? 'var(--vx-type-voice-machine)' : 'var(--vx-type-voice-human)',
          wordBreak: 'break-all',
        }}
      >
        {props.value}
      </span>
    </div>
  );
}

function Section(props: {
  readonly title: string;
  readonly citation: string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <section
      aria-labelledby={props.title.replace(/\s+/g, '-').toLowerCase()}
      style={{
        marginBottom: 'var(--vx-space-7)',
        border: '1px solid var(--vx-color-hairline, currentColor)',
        padding: 'var(--vx-space-5)',
      }}
    >
      <h2
        id={props.title.replace(/\s+/g, '-').toLowerCase()}
        style={{
          fontFamily: 'var(--vx-type-voice-machine)',
          fontSize: 'var(--vx-type-size-0, 1rem)',
          marginTop: 'var(--vx-space-0)',
          marginBottom: 'var(--vx-space-3)',
        }}
      >
        {props.title}
      </h2>
      <p
        style={{
          fontFamily: 'var(--vx-type-voice-machine)',
          fontSize: 'var(--vx-type-size--2, 0.75rem)',
          color: 'var(--vx-color-ink-2, inherit)',
          marginTop: 'var(--vx-space-0)',
          marginBottom: 'var(--vx-space-4)',
        }}
      >
        {props.citation}
      </p>
      {props.children}
    </section>
  );
}

function NoneRecorded(props: { readonly what: string }): React.ReactElement {
  return (
    <p style={{ fontFamily: 'var(--vx-type-voice-machine)', fontStyle: 'italic' }}>
      none recorded — absence is rendered honestly, never as a fabricated zero (Art. VIII)
    </p>
  );
}

/**
 * The Release Observatory. Pure: it renders the data it is given and
 * nothing else.
 */
export function ReleaseObservatory(props: { readonly data: ObservatoryData }): React.ReactElement {
  const { data } = props;
  const trustFailures = data.trustFindings.filter((finding) => finding.verdict === 'FAIL');
  const integrityOk = trustFailures.length === 0 && data.ledgerEntries.length > 0;
  const releases = data.ledgerEntries.filter((entry) => entry.kind === 'release');
  const rollbackEntries = data.ledgerEntries.filter((entry) => entry.kind === 'rollback');

  return (
    <main
      style={{
        maxWidth: '72rem',
        margin: 'var(--vx-space-6) auto',
        padding: 'var(--vx-space-5)',
        fontFamily: 'var(--vx-type-voice-human)',
        color: 'var(--vx-color-ink, inherit)',
        lineHeight: 1.6,
      }}
    >
      <header style={{ marginBottom: 'var(--vx-space-7)' }}>
        <h1 style={{ fontFamily: 'var(--vx-type-voice-machine)', fontSize: 'var(--vx-type-size-3, 1.5rem)' }}>
          VAERION RELEASE OBSERVATORY
        </h1>
        <p style={{ fontFamily: 'var(--vx-type-voice-machine)', color: 'var(--vx-color-ink-2, inherit)' }}>
          every visualization originates from real release ledger data — no fabricated metrics (Art. XI)
        </p>
      </header>

      <Section title="Release Chain" citation="Constitution 10.4 — the release chain is append-only and auditable">
        {releases.length === 0 ? (
          <NoneRecorded what="releases" />
        ) : (
          data.ledgerEntries.map((entry) => (
            <Row
              key={entry.seq}
              label={`seq ${entry.seq} · ${entry.kind}`}
              value={`${entry.releaseId} — ${entry.version}${
                entry.supersedes ? ` (supersedes ${entry.supersedes})` : ''
              } — receipts: ${entry.receiptDigests.length} — ${new Date(entry.appendedAt).toISOString()}`}
              mono
            />
          ))
        )}
      </Section>

      <Section title="Constitution Version" citation="Constitution 2.8; 11.3 — the declared law set of this release">
        <Row label="constitutional version" value={data.constitutionalVersion} mono />
        <Row label="registry version" value={`${data.registryVersion} — ${data.registryTokenCount} ratified tokens`} mono />
        <Row label="snapshot version" value={`${data.snapshotVersion} — ${data.snapshotCaptureCount} capture(s) in the working set`} mono />
      </Section>

      <Section title="Registry Evolution" citation="Constitution 2.8 — the Registry version is auditable at release runtime">
        <Row label="declared registry version" value={data.registryVersion} mono />
        <Row label="token count at issuance" value={String(data.registryTokenCount)} mono />
      </Section>

      <Section title="Snapshot Evolution" citation="Constitution 9.3; F-002 — the Snapshot Authority state the gates demonstrated against">
        <Row label="working capture set" value={`${data.snapshotVersion} — ${data.snapshotCaptureCount} capture(s)`} mono />
      </Section>

      <Section title="Artifact Graph" citation="order Deliverable 4 — nothing may exist anonymously">
        {data.artifacts.length === 0 ? (
          <NoneRecorded what="artifacts" />
        ) : (
          data.artifacts.map((artifact) => (
            <Row
              key={artifact.artifactId}
              label={artifact.kind}
              value={`${artifact.name} — ${artifact.artifactId} — owned by ${artifact.owningRelease} — proven by ${artifact.provingSnapshots.join(', ')} — approved by ${artifact.approvingAuthorities.join(', ')}`}
              mono
            />
          ))
        )}
      </Section>

      <Section title="Integrity Status" citation="Constitution 8.5; 8.8 — continuously attestable; brokenness never silent">
        <Row
          label="release ledger"
          value={integrityOk ? 'INTACT — every entry recomputes' : 'BROKEN — a failure is rendered as a failure'}
          mono
        />
        {data.trustFindings.map((finding, index) => (
          <Row key={index} label={`trust · ${finding.check}`} value={`${finding.verdict} — ${finding.detail}`} mono />
        ))}
      </Section>

      <Section title="Deployment History" citation="Art. VIII — deployment history is never fabricated (IR-019)">
        {data.distribution.length === 0 ? (
          <NoneRecorded what="distribution packages" />
        ) : (
          data.distribution.map((record) => (
            <Row key={record.channel} label={record.channel} value={`${record.stage} — ${record.packageIdentity}`} mono />
          ))
        )}
      </Section>

      <Section title="Rollback History" citation="Constitution 10.4 — rollbacks are recorded as superseding receipts">
        {data.rollbacks.length === 0 && rollbackEntries.length === 0 ? (
          <NoneRecorded what="rollbacks" />
        ) : (
          <>
            {data.rollbacks.map((rollback) => (
              <Row key={rollback.rollbackId} label={rollback.rollbackId} value={`supersedes ${rollback.supersedes} — ${rollback.reason}`} mono />
            ))}
            {rollbackEntries.map((entry) => (
              <Row key={`entry-${entry.seq}`} label={`ledger seq ${entry.seq}`} value={`${entry.releaseId} supersedes ${entry.supersedes}`} mono />
            ))}
          </>
        )}
      </Section>

      <Section title="Evidence Graph" citation="Bible Art. II — evidence or silence">
        {data.receipts.map((receipt) => (
          <Row
            key={receipt.receiptId}
            label={receipt.kind}
            value={`${receipt.receiptId} — sha256:${receipt.sha256.slice(0, 16)}… — evidence: ${receipt.evidenceReferences.join(' + ')}`}
            mono
          />
        ))}
      </Section>

      <Section title="Verification Timeline" citation="Constitution 10.1 — gate results recorded against the release record">
        {data.verificationTimeline.map((event, index) => (
          <Row
            key={index}
            label={`${event.area} · ${event.verdict}`}
            value={`${event.evidence} — ${new Date(event.recordedAt).toISOString()}`}
            mono
          />
        ))}
      </Section>

      <Section title="Article Gate" citation="Constitution 10.2 — demonstrated per constitutional Article">
        {data.articles.map((article) => (
          <Row
            key={article.article}
            label={`Art. ${article.article}`}
            value={`${article.passed ? 'DEMONSTRATED' : 'NOT DEMONSTRATED'} — ${article.requirement} — ${article.evidence}`}
            mono
          />
        ))}
      </Section>

      <footer
        style={{
          marginTop: 'var(--vx-space-8)',
          fontFamily: 'var(--vx-type-voice-machine)',
          fontSize: 'var(--vx-type-size--2, 0.75rem)',
          color: 'var(--vx-color-ink-2, inherit)',
        }}
      >
        generated {new Date(data.generatedAt).toISOString()} — release {data.version} ({data.releaseId}) — nothing is
        believed; everything is verified
      </footer>
    </main>
  );
}
