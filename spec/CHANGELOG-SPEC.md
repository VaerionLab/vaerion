# SPEC CHANGELOG

All changes to files under `spec/` are recorded here. Evolution is
additive-only within a major version; removals require a major bump and a
deprecation window. Every entry requires two approvals on the change itself.

## 0.1.15 — 2026-10-19 (RECORDED RETROSPECTIVELY in the constitution v1.8 amendment window — the change of record is the GA flip commit `36e3da1`, 2026-10-17; additive only)

- `openapi.json` — `info.version` aligned to the engine lockstep version
  (0.1.15, regenerated via the sanctioned generator at the General
  Availability flip; C4 byte-sync holds). Measured delta vs the prior record:
  `info.version` and `engineVersion` only (0.1.15-rc1 → 0.1.15); the daemon
  route surface is untouched. The error catalog of record measures 82 codes
  (E1000–E2312) and the runtime mirror is set-identical.
- WHY RECORDED LATE: this regeneration shipped without a CHANGELOG-SPEC entry
  at the GA flip. The Phase 64 audit filed the omission (TD-11) and the
  constitution v1.8 SI-8 note (§4) closes it. This entry is the retrospective
  entry of record; it changes nothing that shipped.

## 0.1.14-rc1 — 2026-10-19 (RECORDED RETROSPECTIVELY in the constitution v1.8 amendment window — the change of record is commit `802b7c9`, 2026-09-28, the completeness-closure release; additive only)

- `errors.yaml` — added `E1010` `journal_completeness_anchor_invalid` (the
  journal completeness anchor is invalid: the terminal receipt is missing or
  does not certify the records it precedes; the fix teaches
  restore-from-evidence — never hand-editing a journal). Nothing removed or
  renamed; the catalog grows 81 → 82 codes (measured at both endpoints of
  record: 81 codes at the Community Edition drop `41d6df3`, 82 from this
  change forward, 82 today). Catalog version stays 1; codes are additive and
  never reused (ADR-0014).
- WHY RECORDED LATE: the change shipped without a contemporaneous
  CHANGELOG-SPEC entry. The Phase 64 audit filed the omission (TD-11) and the
  constitution v1.8 SI-8 note (§4) closes it. This entry is the retrospective
  entry of record; it changes nothing that shipped.

## 0.1.13-rc1 — 2026-10-19 (RECORDED RETROSPECTIVELY in the constitution v1.8 amendment window — the change of record predates the public lineage and entered the tree of record at the Community Edition drop `41d6df3`, 2026-09-26; additive only)

- `schemas/vaerion-yaml.schema.json` — added the optional
  `gateway.defaultModel` property (canonical provider/model-id string) to the
  gateway block: the declared default model the gateway resolves when a run
  names no model. Optional, so all prior configs remain valid; strict
  unknown-key rejection is unchanged. Declaring a default grants nothing —
  every model invocation still crosses the broker single gate (D-J).
  Correction of record: the Phase 64 audit's shorthand attributed this field
  to `capability-declaration.schema.json`; the field of record lives in the
  gateway block of `vaerion-yaml.schema.json` (measured at
  `spec/schemas/vaerion-yaml.schema.json:261`).
- WHY RECORDED LATE: the underlying change was made in the pre-drop
  engineering lineage whose changelog did not survive the curation into the
  public tree; the field has been part of every public tree since the drop.
  The Phase 64 audit filed the omission (TD-11) and the constitution v1.8
  SI-8 note (§4) closes it. This entry is the retrospective entry of record;
  it changes nothing that shipped.

## 0.1.8 — 2026-09-02 (ASCENSION XVIII Phase 8 — Git/CI/release intelligence; additive only)

- `errors.yaml` — catalog extended with the 23xx range (E2300–E2312):
  repository intelligence (`repo_not_a_repository`, `repo_git_unavailable`,
  `repo_merge_conflict`, `repo_identity_violation`), CI intelligence
  (`ci_workflow_invalid`, `ci_verify_authority_missing`, `ci_env_if_drift`,
  `ci_unparsable_yaml`), and release readiness
  (`release_not_ready`, `release_version_lockstep_broken`,
  `release_record_missing_or_stale`, `release_tag_binding_missing`,
  `release_artifacts_missing`). Nothing removed or renamed; catalog grows
  67 → 80 codes.
- `events/registry.json` — one additive event type:
  `release.readiness.evaluated` (measured, evidence-carrying readiness audit:
  verdict, blockers, honesty labels). Registry version unchanged (1),
  envelope version unchanged (1).
- `openapi.json` — `info.version` aligned to the engine lockstep version
  (0.1.8-rc1, regenerated via the sanctioned generator; C4 byte-sync holds).
  The daemon route surface is otherwise untouched.
- All contract documents remain additive within v0.1.

## 0.1.7-rc2 — 2026-08-31 (PHASE Ω luxury edition; additive only)

Release-alignment change for the `v0.1.7-rc2` tag. Nothing removed, nothing
renamed; no behavioral contract changes.

- `openapi.json` — `info.version` aligned to the engine lockstep version
  (0.1.7-rc2, regenerated via the sanctioned generator; C4 byte-sync holds).
- CLI surface gained the additive `provenance` command (artifact evidence:
  .vxn digest recomputation, lock seal cross-check, export derivation,
  release-manifest display). Machine (`--json`) shapes follow the existing
  per-command result objects; the daemon route surface is untouched, so no
  spec documents change.
- All contract documents remain additive within v0.1; catalog and registry
  versions are unchanged.

## 0.1.7-rc1 — 2026-08-30 (Phase 1 release alignment; additive only)

Release-alignment change for the `v0.1.7-rc1` tag. Nothing removed, nothing
renamed; no behavioral contract changes.

- `openapi.json` — `info.version` aligned to the engine lockstep version
  (0.1.7-rc1, regenerating the C4-synced document) and `info.license`
  replaced the `UNLICENSED` identifier (pre-release stub) to the finalized
  distribution license (`Apache-2.0`, SPDX identifier) per the Phase 1
  legal-foundation decision.
- All contract documents remain additive within v0.1; catalog and registry
  versions are unchanged.

## 0.1.6 — 2026-08-30 (MS-6 packaging: reproducible .vxn bundles; additive only)

Additive contract surface for reproducible packaging (MS-6, ADR-0016).
Nothing removed, nothing renamed; all prior v0.1 documents remain valid
unchanged.

- `errors.yaml` — added the 22xx range (reproducible bundles / packaging,
  ADR-0016): `E2200` vxn_format_invalid, `E2201` vxn_digest_mismatch,
  `E2202` vxn_pin_mismatch, `E2203` vxn_unsupported_format, `E2204`
  vxn_input_missing, `E2205` vxn_lock_mismatch, `E2206` vxn_verify_failed.
  Catalog version stays 1; codes are additive and never reused (ADR-0014).
- `events/registry.json` — added `package.built` (a `.vxn` bundle was built
  as a deterministic fold over declared inputs; the payload carries the
  bundle blake3 digest, entry count, and byte size) and `package.verified`
  (a bundle was verified as a pure check — digests recomputed, pins
  compared, content never executed; the payload carries the outcome and the
  bundle blake3 digest). Registry version stays 1; evolution is additive
  per ADR-0002.
- `schemas/vaerion-yaml.schema.json` — added the optional top-level
  `package` object (`include`: project-relative paths — files carry
  themselves, directories carry every file under them recursively;
  optional `out` path override). The build is a fold over declared inputs
  plus lockfile pins: identical inputs produce byte-identical bundles
  (P2). Import and verify are pure checks and never execute package
  content (ADR-0016 decision 3). Strict unknown-key rejection is unchanged.

## 0.1.5 — 2026-08-29 (MS-5 surfaces: extension host alpha; additive only)

Additive contract surface for the extension host (MS-5, ADR-0009
contingency R-2). Nothing removed, nothing renamed.

- `wit/vaerion-extension@0.1.0.wit` — NEW. The extension world: the guest
  entry point (`invoke`) and the single imported host function (`tool-call`),
  with the broker law documented in the file. The R-2 host implements this
  world over stdio line-delimited JSON; WASI-P2 components will implement
  the same world through the component ABI when the toolchain lands.
- `events/registry.json` — added `extension.spawned` (digest-verified
  artifact spawned; payload names the extension and the pinned digest) and
  `extension.exited` (exit code or signal; failed terminations are marked).
  Registry version stays 1; evolution is additive per ADR-0002.
- `errors.yaml` — added the 21xx range (extension host): `E2100`
  extension_artifact_digest_mismatch, `E2101` extension_not_declared, `E2102`
  extension_protocol_violation, `E2103` extension_timeout, `E2104`
  extension_spawn_failed. Catalog version stays 1; codes are additive and
  never reused (ADR-0014).
- `schemas/vaerion-yaml.schema.json` — added the optional top-level
  `extensions` array (name, artifact, digest `sha256:<hex>`, optional
  timeoutMs / maxHostCalls / args / description). Declaring an extension
  grants nothing: the caller's tool.call and the extension's own host calls
  are all broker-decided. Strict unknown-key rejection is unchanged.

## 0.1.4 — 2026-08-29 (MS-5 surfaces: local API daemon; additive only)

Additive contract surface for the local API daemon (MS-5, ADR-0010 +
ADR-0020). Nothing removed, nothing renamed; all prior v0.1 documents remain
valid unchanged.

- `openapi.json` — NEW. The machine-readable description of the daemon's
  HTTP/SSE surface, GENERATED deterministically from the same route table
  that dispatches requests (ADR-0010 decision 4: an "API gap" is impossible
  by construction). Only implemented routes are described. Constitutional
  check C4 verifies this file never drifts from the generator.
- `errors.yaml` — added the 20xx range (local API daemon, ADR-0010): `E2000`
  daemon_auth_required, `E2001` daemon_bind_refused, `E2002`
  daemon_route_unknown, `E2003` daemon_run_unknown, `E2004`
  daemon_shutdown_echo_mismatch, `E2005` daemon_cancel_unavailable, `E2006`
  daemon_nonloopback_refused. Catalog version stays 1; codes are additive
  and never reused (ADR-0014).

## 0.1.3 — 2026-08-29 (MS-4 intelligence + agents; additive only)

Additive contract surface for the Agent Runtime, Workflow DAG Engine,
Reasoning Sessions, and Evaluation Harness (MS-4). Nothing removed, nothing
renamed; all prior v0.1 documents remain valid unchanged.

- `events/registry.json` — added event types `agent.run.started`,
  `agent.step.recorded`, `agent.step.failed`, `agent.run.completed`,
  `workflow.started`, `workflow.node.started`, `workflow.node.completed`,
  `workflow.node.failed`, `workflow.completed`, `reasoning.note.recorded`,
  and `reasoning.folded`. Registry version stays 1; evolution is additive
  per ADR-0002.
- `errors.yaml` — added the 18xx range (agents, workflow, evals): `E1800`
  agent_plan_invalid, `E1801` agent_tool_unknown, `E1802`
  agent_tool_args_invalid, `E1803` workflow_dag_invalid, `E1804`
  agent_step_limit_exceeded, `E1805` eval_golden_mismatch, `E1806`
  citation_enforcement_violation. Catalog version stays 1; codes are
  additive and never reused (ADR-0014).
- `schemas/vaerion-yaml.schema.json` — added optional top-level `agents`
  block (`maxSteps` positive integer; `plannerModel` canonical
  provider/model-id string) and optional top-level `tools` array
  (declarations with `name`, optional `scope`, optional `description`).
  Declaring a tool grants nothing by itself — `tool.exec` authorization
  still requires explicit broker policy rules. Strict unknown-key
  rejection is unchanged.

## 0.1.2 — 2026-08-29 (MS-3 model gateway; additive only)

Additive contract surface for the Model Gateway (MS-3, the single gate per
constitution D-J). Nothing removed, nothing renamed; all prior v0.1 documents
remain valid unchanged.

- `events/registry.json` — added event types `gateway.invoke.recorded`
  ("A model invocation completed through the gateway single gate; the
  payload carries usage, integer micro-USD cost, attempts, latency, the
  redacted assembled text, and the broker decision link.") and
  `gateway.invoke.failed` ("A model invocation failed after its broker
  decision — secret unresolved, breaker open, transport refusal, budget
  stop; the payload carries the error code and the decision link.").
  Registry version stays 1; evolution is additive per ADR-0002.
- `errors.yaml` — added the 17xx range (model gateway): `E1700`
  gateway_model_unknown, `E1701` gateway_op_unsupported, `E1702`
  gateway_stream_invalid, `E1703` gateway_budget_exceeded, `E1704`
  gateway_secret_unresolved, `E1705` gateway_breaker_open, `E1706`
  gateway_transport_refused. Catalog version stays 1; codes are additive
  and never reused (ADR-0014).
- `schemas/vaerion-yaml.schema.json` — added optional top-level `gateway`
  block (`providers` over the known keys anthropic|openai|ollama with
  `enabled` + optional `models`; `budgets.tokensPerRun` /
  `budgets.microUsdPerRun` as non-negative integers) and optional
  top-level `secrets` block (NAME → `grant: [principal-id patterns]`;
  names only — values are resolved exclusively at call time per ADR-0013).
  Strict unknown-key rejection is unchanged.
- 0.1.2 correction (same date, during MS-3 verification): the
  `gateway.providers` propertyNames enum and pattern were widened to
  include `mockbrain` — the ADR-0012 seeded virtual provider is declared
  like any provider, so its reachability stays governed by the same
  fail-closed ceiling law (declaring it grants nothing). The prior text
  ("mockbrain is always available and is not declared here") contradicted
  the ceiling law and is superseded by this entry.

## 0.1.1 — 2026-08-29 (MS-2 broker wiring; additive only)

Additive contract surface for the Permission Broker engine (MS-2). Nothing
removed, nothing renamed; all prior v0.1 documents remain valid unchanged.

- `events/registry.json` — added event type `broker.elevation.recorded`
  ("A human approval elevated a prompt decision into an authorized action;
  the elevation is journaled and audited."). Registry version stays 1;
  evolution is additive per ADR-0002.
- `schemas/gate.schema.json` — added optional `decision_id` (string,
  minLength 1): the journal link from a durable gate back to the prompt
  decision that opened it. Optional, so all v0.1 gate records remain valid.
- `schemas/journal-record.schema.json` — the inline `gateRecord` definition
  gains the same optional `decision_id` property (mirror of gate.schema.json).
- `schemas/broker-decision.schema.json` — added optional `action` (object):
  the request's action parameters, redacted before journaling — decisions
  never carry secrets. Optional, so all v0.1 decision records remain valid.
- `schemas/vaerion-yaml.schema.json` — added optional top-level `policy`
  block: `policy.rules[]` with `id`, `principalKinds` (`"all"` or a
  non-empty array of principal kinds), `domain`, `scope`, `effect`
  (`allow|deny|prompt`), optional `gateLabel`, and required `rationale`.
  Strict unknown-key rejection is unchanged.

## 0.1.0 — 2026-08-29

Initial publication of the contract set. Additive initial release; no prior
versions exist, so nothing is deprecated or removed.

Published contracts:

- `schemas/envelope.schema.json` — event spine envelope, version 1: required
  `v`, `type`, `seq`, `ts` (RFC3339 UTC, millisecond precision), `trace_id`,
  `span_id`, `actor {kind, id}`, `cause {kind, ref}`, `payload`; journal-read
  form requires `seq >= 1`.
- `schemas/journal-record.schema.json` — hash-chained journal record, version
  1: kinds `meta`, `evt`, `decision`, `gate`, `snapshot`, `receipt` over the
  common chain fields `k`, `i`, `prev`, `hash`.
- `events/registry.json` — event type registry, version 1 (envelope v1): the
  initial registered set across run lifecycle, spine/journal, receipts,
  broker, research, tools, and store prefixes. Additive-only going forward.
- `errors.yaml` — diagnostic catalog, version 1: the initial E#### ranges
  (1xxx journal/persistence, 11xx event spine, 12xx configuration, 13xx
  permission broker, 14xx research, 15xx runtime/restore, 16xx
  surface/usage, 19xx internal invariants), each entry carrying `name`,
  `summary`, and `fix`.
- `schemas/vaerion-yaml.schema.json` — configuration schema 0.1
  (`schemaVersion: "0.1"`): strict unknown-key rejection, zero-telemetry
  structure (`telemetry.enabled` const false), declared permission ceilings
  and research capabilities.
- `schemas/capability-declaration.schema.json`,
  `schemas/broker-decision.schema.json`, `schemas/gate.schema.json` —
  broker contracts, version 1 (frozen ahead of the broker engine per
  ADR-0004): declared-before-requested capabilities, fail-closed decisions
  (`allow` / `deny {E1300,E1301}` / `prompt`), and durable human gates.
- `schemas/evidence-record.schema.json` — research evidence record, version
  1: blob-ref-by-reference (`blake3`), fenced excerpts, mandatory provenance.
- `schemas/receipt.schema.json` — run receipt, version 1: journal-derived
  counts, blob refs, and head hash.

Notes:

- Envelope `type` values are constrained by `events/registry.json` at emit
  time; the envelope schema intentionally admits any event type string to
  preserve the read-time forward-compat duty (unknown types are forwarded
  untouched).
- This initial set is the mirror target for the runtime modules verified in
  MS-1; `tools/verify.ts` asserts spec/mirror sync.

## Annotation — 2026-10-22 (freshness audit)

- `wit/vaerion-extension@0.1.0.wit` — dated status note added to the file
  header (comment-only): the header paragraph predating the GA flip described
  WASI Preview 2 as the ratified substrate; the shipped GA substrate is
  TypeScript-on-Bun (ADR-0018, ratified at the v0.1.15 GA of record,
  2026-10-17), WASI-P2 remains the recorded migration path, and the R-2 stdio
  host is the shipped transport. World definition unchanged.
