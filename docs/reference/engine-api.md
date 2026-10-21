# Engine API Reference — `@vaerion/engine`

> **Honesty header.** Generated against engine `0.1.15` (version-register alignment 2026-10-17, re-verified 2026-10-17; signatures verified at `f6e328b`);
> every signature verified against source. The public surface of record is
> the barrel [`packages/vaerion/src/index.ts`](../../packages/vaerion/src/index.ts)
> — everything exported there is contract; everything not exported is
> internal and may change. If this page and the barrel ever disagree, the
> barrel wins and this page must be fixed.

```ts
import {
  VaerionError, ERROR_CATALOG, canonicalJson, blake3HexOf,
  EVENT_TYPES, draftEnvelope, EventBus,
  JournalWriter, readJournal, verifyJournal, recoverJournal, replayJournal,
  exportRedacted, RECORD_KINDS,
  BlobStore, buildReceiptFromRecords,
  evaluatePolicy, BrokerEngine, graphFromConfig, RefusalLogWriter,
  GatewayService, cassetteTransport,
  RunHarness, AgentRuntime, ToolRegistry, InlinePlanner,
  WorkflowEngine, assertWorkflowDag,
  loadConfig, policyFromConfig,
} from "@vaerion/engine";
```

Layer law (enforced by `layerlint` on every build): L0 `kernel`/`config` →
L1 `spine`/`journal`/`store`/`receipts`/`broker`/`gateway` → L2
`runtime`/`research`/`agents`/`workflow` → L4 `cli`/`api`. Lower layers
never import higher.

---

## 1. Kernel (L0) — identity, errors, ports

### `VaerionError` — the one error type

```ts
class VaerionError extends Error {
  readonly code: ErrorCode;      // "E1000" … "E2312"
  readonly fix: string;          // the actionable Fix: line
  readonly detail?: Record<string, unknown>;
  constructor(code: ErrorCode, message?: string, detail?: Record<string, unknown>, cause?: unknown);
  toLine(): string;   // "E1600 <message> {"detail"} Fix: <fix>" — machine-parseable
  toJSON(): { error: { code, name, message, fix, detail } };  // --json NDJSON shape
}
function isVaerionError(e: unknown): e is VaerionError;
```

The error culture is: **stable code + what failed + why likely + a `Fix:`
next step**. `ERROR_CATALOG: Readonly<Record<ErrorCode, ErrorDescriptor>>`
is the runtime mirror of `spec/errors.yaml` (82 codes, `E1000`–`E2312`;
`tools/verify.ts` asserts the two stay in sync). Each descriptor carries
`{ code, name, summary, fix }`. Families: `E10xx` journal/persistence,
`E11xx` spine, `E12xx` config, `E13xx` broker, `E14xx` research,
`E15xx` runtime/restore, `E16xx` surface/usage, `E17xx` gateway,
`E18xx` agents/workflow/evals, `E19xx` internal invariants, `E20xx` daemon,
`E21xx` extensions, `E22xx` `.vxn` bundles, `E23xx` repo/CI/release.
Full human catalog: [`errors.md`](errors.md).

### Canonical bytes and hashing

```ts
function canonicalJson(value: unknown): string;              // sorted keys, no whitespace — the byte law
function canonicalBytes(value: unknown): Uint8Array;
function blake3HexOf(data: string | Uint8Array): Promise<HashHex>;  // 64 lowercase hex chars
const GENESIS_HASH: HashHex;                                 // 64 zeros — the chain root
function isHashHex(value: string): boolean;
```

Every journal record, receipt, blob, audit entry, and refusal entry is
identified by `blake3` over `canonicalJson` of its content.

### Ports — Clock, Rng, IdGen (the determinism seams)

```ts
interface Clock { nowMs(): number; nowIso(): string; }   // RFC3339 UTC, ms precision
class SystemClock implements Clock {}
class FixedClock implements Clock {}                     // tests: frozen time

interface Rng { nextBytes(n: number): Uint8Array; }
class SystemRng implements Rng {}
class SeededRng implements Rng {}                        // tests: deterministic bytes

interface IdGen { next(): string; }                      // ULID strings
class SystemIdGen implements IdGen {}
class SeededIdGen implements IdGen {}
```

Run IDs are CRNs over ULIDs: `crn_run_<ulid>` (`RUN_ID_RE`:
`^crn_run_[0-9ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz]{26}$`).

```ts
function encodeUlid(timeMs: number, randomness80Bit: Uint8Array): Ulid;
function decodeUlid(ulid: string): { timeMs: number; randomness: Uint8Array };
function crn(namespace: string, id: Ulid): Crn;          // e.g. crn("run", ulid) → "crn_run_…"
function parseCrn(value: string): { namespace: string; ulid: Ulid } | null;
```

Redaction (`redactString`, `redactDeep` in `kernel/redact.ts`) is applied to
journal payloads, decision actions, results, and exports — secrets never
enter the chain.

---

## 2. Spine (L1) — events

### Envelope — the one event shape

```ts
const ENVELOPE_VERSION = 1;

interface Envelope {
  v: 1;
  type: EventType | (string & {});
  seq: number;              // per-run, monotonic, GAPLESS; allocated by JournalWriter (0 = unassigned)
  ts: string;               // RFC3339 UTC, ms precision
  trace_id: string;
  span_id: string;
  actor: Actor;             // { kind: "human"|"agent"|"tool"|"extension"|"research"|"system", id }
  cause: Cause;             // { kind: "envelope"|"decision"|"gate"|"external"|"origin", ref: string | null }
  payload: Record<string, unknown>;
}

function draftEnvelope(input: NewEnvelopeInput): Envelope;  // seq stays 0; the writer stamps it
function assertValidEnvelopeShape(value: unknown, opts?: ValidateOptions): asserts value is Envelope;
function assertEmittable(env: Envelope): void;
function encodeEnvelope(env: Envelope): string;   // canonical NDJSON line
function decodeEnvelope(line: string): Envelope;
```

### Event type registry

```ts
const EVENT_TYPES: readonly string[];               // 42 types, additive-only (ADR-0002)
function isKnownEventType(t: string): t is EventType;
function assertKnownEventType(t: string): EventType; // unknown type ⇒ E1101 at emit time
```

Groups: `run.*`, `journal.*`, `receipt.issued`, `broker.*`, `research.*`,
`gateway.invoke.*`, `tool.call.*`, `agent.*`, `workflow.*`, `reasoning.*`,
`extension.*`, `package.*`. Unknown types can never be emitted; read-time
forwarding of unknown types is untouched (forward compatibility duty).

### EventBus — in-memory fan-out

```ts
type EventFilter = { types?: ReadonlySet<string>; all?: boolean };
class EventBus {
  async publish(env: Envelope): Promise<number>;   // returns the single spine order; re-entrant publish is forbidden (E1900)
  subscribe(filter: EventFilter, handler: SubscriptionHandler, opts?: SubscribeOptions): Subscription;
}
function matches(filter: EventFilter, env: Envelope): boolean;
```

Backpressure is block-policy with a fixed buffer (1024): no silent drops.
`SpinePersistence` bridges bus → journal.

---

## 3. Journal (L1) — the append-only hash chain

A journal is one NDJSON file per run:
`.vaerion/journal/<run_id>.ndjson`. Every record is
`{ k, i, prev, hash, …body }` where `i` is the 1-based chain index, `prev`
the previous record's hash (genesis = 64 zeros), and
`hash = blake3(canonicalJson(record without hash))`.

### Record kinds

```ts
const RECORD_KINDS = ["meta", "evt", "decision", "gate", "snapshot", "receipt"] as const;
```

| Kind | Body | Meaning |
|---|---|---|
| `meta` | `note: "header"\|"recovery"\|"export"`, `run_id`, `opened_at?`, `engine_version?`, `config_fingerprint?` | journal header / recovery note / export derivation |
| `evt` | `env: Envelope` | one spine envelope (per-run seq allocated by the writer) |
| `decision` | `decision: BrokerDecisionRecord` | a journaled broker decision (decide → journal → act) |
| `gate` | `gate: GateRecord` | a durable human gate (open / resolved / cancelled) |
| `snapshot` | `seq_at`, `label`, `state` | checkpoint state bag — accelerator for restore, never truth |
| `receipt` | `receipt: RunReceipt` | the run's closing receipt (terminal record) |

### Writer

```ts
const ENGINE_VERSION = "0.1.15";

interface OpenJournalOptions {
  journalPath: string; runId: string; configFingerprint: string;
  clock: Clock; verifyOnOpen?: boolean;   // re-verify existing chain on open (default true)
}
class JournalWriter {
  static async open(opts: OpenJournalOptions): Promise<JournalWriter>;  // creates header or resumes; refuses torn tails (E1002)
  readonly runId: string;
  async appendEvent(env: Envelope): Promise<number>;                    // assigns per-run seq, seals, links, fsyncs
  async appendDecision(decision: BrokerDecisionRecord): Promise<void>;
  async appendGate(gate: GateRecord): Promise<void>;
  async appendSnapshot(seqAt: number, label: string, state: Record<string, unknown>): Promise<void>;
  async appendReceipt(receipt: RunReceipt): Promise<void>;
  async appendMeta(meta: Omit<MetaRecord, "hash" | "i" | "prev">): Promise<void>;
  async close(): Promise<void>;
}
async function acquireJournalLock(journalPath: string): Promise<JournalLockHandle>;  // single-writer (O_EXCL)
async function lockOwnerDead(lockPath: string): Promise<boolean>;
async function hashRecord(unsealed: UnsealedRecord): Promise<HashHex>;
async function sealRecord(unsealed: UnsealedRecord): Promise<JournalRecord>;
```

### Reading and verification

```ts
interface ReadResult { records: JournalRecord[]; completeByteLength: number; torn: boolean; tornTailBytes?: Uint8Array; tornTailMessage?: string; }
async function readJournal(journalPath: string): Promise<ReadResult>;   // unknown path ⇒ E1502
function* envelopesFrom(records: JournalRecord[], fromSeq: number): AsyncGenerator<Envelope>;

interface VerifyIssue { i: number | null; code: "E1001" | "E1002" | "E1003" | "E1005" | "E1006" | "E1009"; message: string; }
interface VerifyReport {
  ok: boolean;          // issues.length === 0
  path: string;
  records: number;
  events: number;       // evt records
  maxSeq: number;       // highest per-run envelope seq
  headHash: string | null;   // hash of the last record — the integrity commitment
  torn: boolean;
  issues: VerifyIssue[];
}
async function verifyJournal(journalPath: string): Promise<VerifyReport>;
```

Verification order: shape (`E1003`) → 1-based index continuity (`E1001`) →
blake3 linkage + content hash (`E1001`) → gapless per-run seq (`E1005`) →
export-derivation note (`E1009`). Unreadable files report `E1003`; torn
tails `E1002`; empty journals `E1006`. The same primitive verifies the audit
ledger (a journal of meta records).

### Recovery, replay, export, listing

```ts
interface RecoveryReport { journalPath: string; tornTailRemoved: boolean; bytesRemoved: number; recordsRecovered: number; recoveryRecordIndex: number | null; lockCleared: boolean; }
async function recoverJournal(journalPath: string, runId: string, configFingerprint: string, clock?: Clock): Promise<RecoveryReport>;
// truncates ONLY a torn crash tail and re-seals the chain with an auditable meta note

function replayRecords<S>(opts: { records: JournalRecord[]; reducer: Reducer<S>; initial: S; snapshotValidator?: (rec, stateAtSeq) => boolean }): ReplayResult<S>;
async function replayJournal<S>(journalPath: string, reducer: Reducer<S>, initial: S): Promise<ReplayResult<S> & { read: ReadResult }>;  // torn tail ⇒ E1002

interface ExportOptions { sourceJournalPath: string; exportPath: string; runId: string; requireVerifiedSource?: boolean; }
interface ExportReport { exportPath: string; sourceRecords: number; exportedRecords: number; sourceHeadHash: HashHex | null; exportHeadHash: HashHex; verified: boolean; }
async function exportRedacted(opts: ExportOptions): Promise<ExportReport>;   // redacted, independently re-chained derivation
async function readExportVerified(exportPath: string): Promise<JournalRecord[]>;

interface JournalListItem { run_id: string; records: number; events: number; head_hash: string | null; bytes: number; }
async function listJournals(journalDir: string): Promise<JournalListItem[]>;
```

---

## 4. Store (L1) — the content-addressed blob store

```ts
interface BlobRef { alg: "blake3"; hash: HashHex; size: number; }
class BlobStore {
  constructor(root: string);                                   // <workspace>/.vaerion/blobs
  async put(content: Uint8Array | string): Promise<BlobRef>;   // blake3-addressed; dedupes; CAS (never overwrites)
  async open(ref: BlobRef | BlobRefInput): Promise<Uint8Array>;         // E1007 missing · E1008 size/digest mismatch
  async exists(ref: BlobRef | BlobRefInput): Promise<boolean>;
  async verify(ref: BlobRef | BlobRefInput): Promise<VaerionError | null>;  // the check without the throw
  async unsafeRemove(ref: BlobRef | BlobRefInput): Promise<void>;           // GC only; refs are immutable
}
function assertBlobRefShape(value: unknown): asserts value is BlobRef;
```

---

## 5. Receipts (L1) — folded, never asserted

```ts
interface RunReceipt {
  run_id: string;
  trace_id: string;
  engine_version: string;
  config_fingerprint: string;
  opened_at: string | null;
  closed_at: string;
  counts: {
    records: number; events: number;
    decisions_allow: number; decisions_deny: number; decisions_prompt: number;
    gates_opened: number; gates_resolved: number;
    snapshots: number; recovery_notes: number;
  };
  blob_refs: Array<{ alg: "blake3"; hash: string; size: number }>;
  journal: { records: number; head_hash: HashHex };   // the integrity commitment
  summary: string;
}

function buildReceiptFromRecords(records: JournalRecord[], opts: { closedAt: string; engineVersion: string; summary: string }): RunReceipt;
function lifecycleCounts(records: readonly JournalRecord[]): LifecycleCounts;  // the ONE count fold (receipt + `vae report`)
function openedAtOf(records: readonly JournalRecord[]): string | null;
function collectBlobRefs(records: JournalRecord[]): Array<{ alg: "blake3"; hash: string; size: number }>;
function assertReceiptShape(value: unknown): asserts value is RunReceipt;
```

The receipt is the **terminal journal record** of a closed run — computed
FROM the journal, so it can never disagree with it. Integrity commitment =
`journal.head_hash`. There is no external timestamping or anchoring service
in the engine; the receipt commits to the chain, not to a wall clock.

---

## 6. Broker (L1) — decide → journal → act

### Principals and domains

```ts
type PrincipalKind = "human" | "agent" | "tool" | "extension" | "research" | "system";
interface Principal { kind: PrincipalKind; id: string; runId?: string; digest?: string; }
const HUMAN_PRINCIPAL: Principal;   // { kind: "human", id: "local-user" }
const SYSTEM_PRINCIPAL: Principal;

type CapabilityDomain =
  | "fs.read" | "fs.write" | "net.connect" | "exec.run" | "model.invoke"
  | "secret.read" | "tool.call" | "intel.query" | "research.index"
  | "research.fetch" | "journal.append" | "journal.read";
```

### Policy contract and evaluation

```ts
interface PolicyRule {
  id: string;
  principalKinds: Array<Principal["kind"]> | "all";
  domain: CapabilityDomain | "*";
  scope: string;                    // glob-ish matcher: "*" alone = all; otherwise prefix/path/host patterns
  effect: "allow" | "deny" | "prompt";
  gateLabel?: string;               // prompt rules name the gate label shown to the human
  rationale: string;                // required — every rule must state why
}
interface PolicyContract { policy_id: string; version: 1; rules: PolicyRule[]; }

function evaluatePolicy(policy: PolicyContract, req: DecisionRequest): BrokerDecision;
```

Semantics, in order: rules evaluate **first match wins** on
(`principalKinds`, `domain`, `scope`); `allow` → allow, `deny` → deny
(`E1300`), `prompt` → a durable human gate. **No match ⇒ deny with
`reason_code: "E1301"`** (fail-closed) — an allow-by-default fall-through is
structurally impossible. `scopeMatches(declared, requested)` is the matcher;
`capabilityCovers(set, domain, scope)` the set check.

```ts
interface DecisionRequest {
  request_id: string;         // ULID
  principal: Principal;
  domain: CapabilityDomain;
  scope: string;
  action: Record<string, unknown>;  // redacted before journaling
  intent: string;                   // required; empty intent is not evaluable
}
type BrokerDecision =
  | { kind: "allow"; policy: string }
  | { kind: "deny"; reason_code: "E1300" | "E1301"; reason: string; policy: string }
  | { kind: "prompt"; gate_id: string; reason: string; policy: string };
```

### The engine and the ceiling

```ts
class BrokerEngine {
  constructor(input: { policy: PolicyContract; graph?: PermissionGraph | null });
  evaluate(req: DecisionRequest): BrokerEvaluation;  // layer 0 shape → layer 1 ceiling → layer 2 policy
}
interface BrokerEvaluation { decision: BrokerDecision; ceiling: { enforced: boolean; ok: boolean; reason: string | null }; authority: string; }
```

The **permission graph** is the ceiling layer: grants never widen beyond it.

```ts
interface PermissionGraph {
  graph_id: string; version: 1; narrows: string | null;
  nodes: GraphNode[];                      // { id, kind: PrincipalKind | "capability" }
  edges: GrantEdge[];                      // { from: principalId, to: "domain" | "domain#scope" }
  capabilities: Record<string, CapabilityDefinition>;
}
function buildGraph(input: Omit<PermissionGraph, "version"> & { version?: 1 }): PermissionGraph;
function graphCovers(graph, principalId, domain, scope): { ok: boolean; reason: string };
function grantsFor(graph: PermissionGraph, principalId: string): CapabilityDefinition[];
function narrowingViolations(ancestor: PermissionGraph, evolved: PermissionGraph): string[];  // evolution may only narrow

function graphFromConfig(config: VaerionConfig, graphId: string, extraGrants?: ConfigGrantInput[]): PermissionGraph;
function secretGrantFor(config: VaerionConfig, secretName: string, principalId: string): boolean;
```

### Human gates — authority that survives process death

```ts
interface GateRecord {
  gate_id: string; run_id: string; trace_id: string;
  state: "open" | "resolved" | "cancelled";
  decision_id?: string;
  question: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  answer?: Record<string, unknown>;      // journaled, redacted
  resolved_by?: "human";
  opened_at: string; resolved_at?: string;
}
function gateResolutionConflict(existing: GateRecord, incoming: GateRecord): boolean;  // double-resolve ⇒ E1303
```

Gates are journal records: open on a `prompt` decision, resolved via
`vae resume RUN_ID --answer JSON` (or daemon `POST /runs/{id}/answer`). An
approval is journaled as durable elevation authority; a denial closes the
run (exit 3).

### Audit ledger and refusal log — sibling chains

```ts
class ChainedAuditWriter implements AuditWriter { /* every decision + elevation, blake3-chained */ }
function decisionToAuditBody(rec: BrokerDecisionRecord): Record<string, unknown>;
interface AuditVerifyReport { ok: boolean; entries: number; head: HashHex | null; firstBrokenIndex: number | null; message: string | null; }
async function verifyAuditLedger(auditPath: string): Promise<AuditVerifyReport>;   // .vaerion/audit.log

interface RefusalEntry { k: "refusal"; i: number; prev: HashHex; hash: HashHex; at: string; run_id: string; decision_id: string; request_id: string; principal: Principal; domain: string; scope: string; reason_code: "E1300" | "E1301"; reason: string; policy: string; }
class RefusalLogWriter { /* appends deny decisions to .vaerion/refusals.log as its own hash chain */ }
async function readRefusals(path: string, filter?: { runId?: string; limit?: number }): Promise<RefusalEntry[]>;
async function readRefusalHead(path: string): Promise<{ i: number; head: HashHex } | null>;
async function verifyRefusalLog(path: string): Promise<RefusalVerifyReport>;
```

Every denial is recorded twice: as a `decision` record inside the run, and
as a `refusal` entry in the workspace refusal log — independent,
tamper-evident, readable without the run.

---

## 7. Model gateway (L1) — the single sanctioned egress

```ts
type ModelOp = "chat" | "embed" | "rerank";
const MODEL_OPS: ReadonlyArray<ModelOp>;
function parseModelId(model: string): { provider: string; modelId: string };  // "provider/model-id"; else E1700

interface ModelRequest {
  op: ModelOp;
  model: string;                       // "provider/model-id"
  messages?: ChatMessage[];            // chat: { role: "system"|"user"|"assistant", content }
  input?: string[];                    // embed
  query?: string; documents?: string[]; // rerank
  seed?: number; maxOutputTokens?: number; intent?: string;
}
interface InvocationResult {
  model: string; provider: string; op: ModelOp; text: string; frames: StreamFrame[];
  usage: TokenUsage | null;            // { inputTokens, outputTokens }
  cost: UsageCost | null;              // integer micro-USD: { inputMicroUsd, outputMicroUsd, totalMicroUsd }
  stopReason: string | null; attempts: number; latencyMs: number; textHash: string | null;
}
```

### GatewayService — the one gate

```ts
class GatewayService {
  constructor(opts: GatewayServiceOptions);
  // required: { clock, rng, idGen, transport, secrets }; optional: adapters?, retry?, sleep?, breakerThreshold?, breakerCooldownMs?
  async invoke(host: GatewayHost, input: {
    request: ModelRequest;
    principal: Principal;
    policy: PolicyContract;
    requestId: string;
    intent: string;
    budget: { tokensUsed: number; microUsdUsed: number; tokensPerRun?: number; microUsdPerRun?: number };
  }): Promise<InvocationResult>;
  matrix(): Array<{ provider: string; ops: string[]; requiresSecret: boolean; secretName: string | null }>;
  breakerFor(provider: string): CircuitBreaker;
  breakerSnapshots(): Array<{ provider: string; state: string; consecutiveFailures: number }>;
}
class GatewayGatePrompt extends Error { /* thrown when the broker answers prompt — caller owns the gate UX */ }
```

Journaled order is fixed: broker decision (`model.invoke`; ceiling =
`gateway.providers`) → `secret.read` decision when the provider needs a
credential (value resolved at call time, never journaled) → adapter over
the sanctioned transport → `gateway.invoke.recorded` | `gateway.invoke.failed`
metering → receipt. Every terminal failure after authorization is journaled
(failures are never silent).

### Adapters, transports, resilience

```ts
const mockBrainAdapter: ProviderAdapter;   // the seeded local virtual provider — no network, deterministic per seed
const anthropicAdapter: ProviderAdapter;   // + mapAnthropicEvent
const openaiAdapter: ProviderAdapter;      // + mapOpenAiEvent
const ollamaAdapter: ProviderAdapter;      // + mapOllamaEvent

const fetchTransport: GatewayTransport;    // the ONE sanctioned egress site (ADR-0019)
function cassetteTransport(cassettes: readonly Cassette[]): GatewayTransport;  // deterministic replay for tests
interface Cassette { cassette_id: string; provider: string; op: string; request_fingerprint: string; status: number; chunks: string[]; }
async function loadCassette(path: string): Promise<Cassette>;
async function requestFingerprint(req: TransportRequest): Promise<string>;

type BreakerState = "closed" | "open" | "half_open";
class CircuitBreaker { constructor(provider: string, clock: Clock, opts?: BreakerOptions); }
class TransportRetries { /* bounded retries with seeded backoff */ }
const DEFAULT_RETRY: RetryPolicy;          // { maxAttempts: 3, baseDelayMs: 200, maxDelayMs: 5000 }
```

### Pricing and metering — integer micro-USD, never floats

```ts
const PRICE_TABLE: Readonly<Record<string, ModelPrice>>;
function priceFor(model: string, op: ModelOp): ModelPrice | null;
function costOf(model: string, op: ModelOp, usage: TokenUsage): UsageCost | null;
function formatMicroUsd(microUsd: number): string;
function addCosts(a: UsageCost | null, b: UsageCost | null): UsageCost | null;

interface GatewayMeteringRollup { invocations: number; failed: number; inputTokens: number; outputTokens: number; totalMicroUsd: number; unpriced: number; byModel: Record<string, PerModelMetering>; }
function meteringFromRecords(records: readonly JournalRecord[]): GatewayMeteringRollup;  // pure fold over the journal
```

### Secrets — names in config, values behind the broker

```ts
interface SecretPort { readonly name: string; resolve(secretName: string): Promise<string | null>; }  // null = unresolved; never throws for absence
function defaultSecretPort(platform?: NodeJS.Platform): SecretPort;  // keychain-first (ADR-0013), env fallback
const envSecretPort: SecretPort;
const macKeychainSecretPort: SecretPort;
function requireResolvedSecret(name: string, value: string | null): string;  // null ⇒ E1704
```

---

## 8. Runtime + agents (L2)

### RunHarness — one durable run

```ts
interface RunHarnessOptions {
  workspaceDir: string;        // .vaerion/ lives here
  runId: string;               // crn_run_<ulid>
  traceId: string;
  configFingerprint: string;
  clock: Clock;
  idGen: { next(): string };
  actor?: Actor;
  permissionGraph?: PermissionGraph | null;   // the ceiling; null = policy-only
}
class RunHarness {
  static async create(opts: RunHarnessOptions): Promise<RunHarness>;     // opens the journal, audit, refusal chains
  async emit(type: EventType | (string & {}), payload: Record<string, unknown>, actor?: Actor, cause?: Cause): Promise<number>;
  async decide(req: DecisionRequest, policy: PolicyContract, graph?: PermissionGraph | null):
    Promise<{ decision: BrokerDecision; record: BrokerDecisionRecord; gate?: GateRecord }>;  // decide → journal → act
  async snapshot(label: string): Promise<void>;                          // accelerator checkpoint (never truth)
  async release(): Promise<void>;                                        // drop the single-writer lock (paused runs)
  async close(summary: string): Promise<{ receipt: RunReceipt; verify: VerifyReport }>;
  static async restore(opts: RunHarnessOptions): Promise<{ state: RunState; read: ReadResult; verify: VerifyReport; harness: RunHarness }>;
  // restore throws E1500 when the journal fails verification — tampered journals never resume
}
function initialRunState(runId: string, traceId: string): RunState;
const runStateReducer: Reducer<RunState> = (state, rec) => /* pure fold: journal records → run state */;
async function readAuditHead(auditPath: string): Promise<{ i: number; head: string } | null>;
```

### AgentRuntime — the supervised loop

```ts
class AgentRuntime {
  constructor(opts: {
    harness: RunHarness; clock: Clock; idGen: { next(): string };
    maxSteps: number;                       // config agents.maxSteps; default 24; E1804 on exhaustion
    stepAttempts?: number; sleep?: (ms: number) => Promise<void>;
    gateway: GatewayService | null; tools: ToolInvocationService | null; research: ResearchPort | null;
    actor?: Actor;
  });
  async run(input: { goal: string; principal: Principal; policy: PolicyContract; planner: Planner; budget: BudgetGuard }, restored?: AgentRunState):
    Promise<{ runId: string; outcome: AgentOutcome; steps: number; failures: number; tokensUsed: number; microUsdUsed: number; gate: GateRecord | null; plannerKind: string }>;
}
```

Every step (model / tool / note / context) crosses its constitutional path —
the gateway single gate, the broker tool pipeline, the reasoning scratchpad —
and is journaled (`agent.step.recorded` / `agent.step.failed`).

### Planners

```ts
interface Planner { readonly kind: "inline" | "model"; plan(input: PlannerInput): Promise<Plan>; }
class InlinePlanner { constructor(opts: { goal: string; steps: PlanStep[] }); }   // declared steps — the hermetic determinism device
class ModelPlanner { constructor(opts: { host: GatewayHost; gateway: GatewayService; model: string; principal: Principal; policy: PolicyContract; requestId: () => string; budget: () => BudgetGuard }); }

type PlanStep =
  | { kind: "model"; model: string; messages: ChatMessage[]; requiresCitations?: boolean; seed?: number; maxOutputTokens?: number; note?: string }
  | { kind: "tool"; tool: string; args: Record<string, unknown>; note?: string }
  | { kind: "note"; text: string }
  | { kind: "context"; capability: string; query: string; note?: string };
```

### Tools — declared, granted, fail-closed

```ts
class ToolRegistry {
  constructor(decls: ReadonlyArray<ToolDeclaration>);          // { name, scope, description }
  static fromConfig(decls: ReadonlyArray<ToolDeclarationConfig>): ToolRegistry;
}
class ToolInvocationService {
  constructor(opts: { clock: Clock; idGen: { next(): string }; registry: ToolRegistry; executors: ReadonlyMap<string, ToolExecutor>; blobStore?: BlobStore | null });
}
const echoTool: ToolExecutor;       // builtins: deterministic, no network
const clockReadTool: ToolExecutor;
```

An undeclared or ungranted tool call is refused fail-closed (`E1801` /
broker deny) — declaring a tool in `vaerion.yaml` grants nothing by itself.

---

## 9. Workflow (L2) — deterministic DAG execution

```ts
interface WorkflowNode { id: string; deps: string[]; step: PlanStep; maxAttempts?: number; }
interface WorkflowDag { id: string; nodes: WorkflowNode[]; }
function assertWorkflowDag(value: unknown): asserts value is WorkflowDag;  // total, fail-closed (E1803): dupes, missing deps, cycles
function topoOrder(dag: WorkflowDag, opts?: { throwOnCycle?: boolean }): string[];   // Kahn's sort, lexicographic tie-break — same DAG, same order

class WorkflowEngine {
  constructor(opts: { harness: RunHarness; clock: Clock; idGen: { next(): string }; blobRoot: string; gateway: GatewayService | null; tools: ToolInvocationService | null; research: ResearchPort | null; actor?: Actor });
  async run(input: { dag: WorkflowDag; principal: Principal; policy: PolicyContract; budget: BudgetGuard }, opts?: { resumeState?: WorkflowState }):
    Promise<{ workflowId: string; outcome: "completed" | "failed" | "awaiting_gate"; completedNodes: string[]; failedNodes: Array<{ node: string; error_code: string }>; outputs: Record<string, string>; gate: GateRecord | null }>;
  static async resume(opts: Omit<RunHarnessOptions, "traceId"> & { engine: Omit<WorkflowEngineOptions, "harness"> }):
    Promise<{ state: WorkflowState; read: ReadResult; verify: VerifyReport; engine: WorkflowEngine; harness: RunHarness }>;  // E1500 if the journal fails verification
}
function workflowStateFromRecords(workflowId: string, records: ReadonlyArray<JournalRecord>): WorkflowState;
```

Nodes run sequentially in topological order; outputs are content-addressed
into the blob CAS and journaled; `--resume RUN_ID` (CLI) continues an
interrupted run from its journal fold.

---

## 10. Config (L0) — the strict schema-0.1 manifest

```ts
const CONFIG_SCHEMA_VERSION = "0.1";

interface VaerionConfig {
  schemaVersion: string;                 // "0.1"
  project: { name: string; description?: string };
  permissions?: { net?: { allowHosts?: string[] }; exec?: { allowCommands?: string[] } };
  research?: { capabilities?: Array<{ name: string; sources: Array<{ kind: "local"; path: string }>; fencing: "untrusted" | "trusted"; maxItems?: number }> };
  policy?: { rules?: PolicyRule[] };
  gateway?: GatewayConfig;               // providers (ceiling), budgets (tokensPerRun, microUsdPerRun)
  secrets?: SecretsConfig;               // secret NAMES + grants — values never live here
  agents?: AgentsConfig;                 // maxSteps, plannerModel
  tools?: ToolDeclarationConfig[];
  extensions?: ExtensionConfig[];
  package?: PackageConfig;               // package.include — the reproducible bundle inputs
  telemetry: { enabled: false };         // false is the ONLY value the engine accepts
}

async function loadConfig(configPath: string): Promise<{ config: VaerionConfig; fingerprint: string }>;  // blake3 over canonical config
function validateConfig(value: unknown): VaerionConfig;   // unknown keys rejected (E1201); drift refused, never guessed
function policyFromConfig(config: VaerionConfig): PolicyContract;
function defaultPolicyFromConfig(config: VaerionConfig, configFingerprint: string): PolicyContract;
```

The JSON Schema of record is
[`spec/schemas/vaerion-yaml.schema.json`](../../spec/schemas/vaerion-yaml.schema.json).

---

## Not documented here (pointers)

- **Local daemon API** — `startDaemon(opts)`, the route table
  (`packages/vaerion/src/api/routes.ts`), and the generated OpenAPI
  (`spec/openapi.json`). The wire surface the `VaeDaemonClient` speaks;
  see [`../SDK.md`](../SDK.md) for the client view.
- **CLI** — the 29-command surface: [`cli.md`](cli.md).
- **Research pipeline, evals, extensions** — exported from the same barrel
  (`research/*`, `evals/*`, `extensions/*`); documented in
  [`../../docs/book/guides/research-and-intel.md`](../../docs/book/guides/research-and-intel.md)
  and ADR-0009 (extensions).
- **Errors** — the full 82-code human catalog: [`errors.md`](errors.md).

---

*Generated against engine `0.1.15` (version-register alignment 2026-10-17, re-verified 2026-10-17; signatures verified at `f6e328b`). Every signature above
was read from the source of record (`packages/vaerion/src/`) before being
written. Corrections belong next to the code, not after it.*
