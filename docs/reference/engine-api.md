# Vaerion Engine API — `@vaerion/engine`

> **Provenance note.** Written for `@vaerion/engine` `0.1.14-rc1` from the actual
> source of record: `packages/vaerion/src/index.ts` (the authoritative export
> list, verified by executing the module), `packages/vaerion/src/runtime/run.ts`,
> `packages/vaerion/src/journal/verify.ts`, and
> `spec/schemas/vaerion-yaml.schema.json` (the config schema of record).
> Every signature below was read from those files; the two examples in this
> document were executed against the engine before being written down.
> Only exports and methods that exist are documented.

## What the engine is

`@vaerion/engine` is the in-process core: the event spine, the append-only
hash-chained journals, the blob store, the fail-closed policy broker, and the
gateway adapters. It is a workspace-resident package (not published to npm on
its own) — it ships inside the [`vaerion`](https://www.npmjs.com/package/vaerion)
CLI package and is consumed directly inside this repository.

- **Using the CLI?** Start with [QUICKSTART](../QUICKSTART.md).
- **Embedding over HTTP?** Use the TypeScript SDK — see [SDK.md](../SDK.md)
  (`VaeClient` for in-process, `VaeDaemonClient` for the loopback daemon).
- **Linking the engine directly in this monorepo?** This is the document.

## Install

```sh
npm i -g vaerion        # the CLI (bundles the engine), or:
bun add vaerion
```

Inside the monorepo the engine resolves as a workspace package:

```ts
import { RunHarness, verifyJournal } from "@vaerion/engine"; // packages/vaerion
```

## First execution (CLI, ≈1 minute)

```sh
vae init --template demo     # writes vaerion.yaml + demo sources
vae run demo                 # plan → act → journal → receipt
vae journal verify <RUN_ID>  # ok:true · torn:false · anchored:true
```

`vae doctor` re-runs the same checks the CI gate runs, against your workspace.

## The run lifecycle: `RunHarness`

`RunHarness` is the production writer path — the same object `vae run` drives.
Options of record (`RunHarnessOptions`): `workspaceDir`, `runId`, `traceId`,
`configFingerprint`, `clock`, `idGen` are required; `actor` and
`permissionGraph` (pass `null` for policy-only decisions) are optional.

Executed example (this exact code ran at `0.1.14-rc1` before being documented):

```ts
import { RunHarness, SystemClock, SystemIdGen, crn } from "@vaerion/engine";

const clock = new SystemClock();
const idGen = new SystemIdGen();
const harness = await RunHarness.create({
  workspaceDir: process.cwd(),
  runId: crn("run", idGen.next()),
  traceId: "t_my_first_run",
  configFingerprint: "cfg_fp_local",
  clock,
  idGen,
});

await harness.emit("gateway.invoke.recorded", {
  model: "mockbrain/mock-1",
  usage: { inputTokens: 10, outputTokens: 5 },
  cost: { totalMicroUsd: 33 },
});

const { receipt, verify } = await harness.close("first documented run");
console.log(verify.ok, verify.anchored, verify.torn); // true true false
```

`emit(type, payload)` accepts only known event types (`EVENT_TYPES`, 42 of
them; `isKnownEventType` checks membership) and every record is sealed into the
blake3 hash chain as it lands.

## Verification flow

`harness.close(summary)` returns **both** artifacts of a finished run:

- `receipt` — the terminal record that anchors the journal (keys of record:
  `run_id`, `trace_id`, `engine_version`, `config_fingerprint`,
  `opened_at`, `closed_at`);
- `verify` — a `VerifyReport`: `{ ok, path, records, events, maxSeq,
  headHash, torn, anchored, … }`. `anchored: true` means the journal ends in a
  certified receipt (the E1010 completeness anchor).

Standalone verification (no harness in hand):

```ts
import { verifyJournal } from "@vaerion/engine";
const report = await verifyJournal(journalPath); // same VerifyReport
```

The CLI equivalent is `vae journal verify <RUN_ID>`; the SDK equivalent is
`VaeClient.journalVerify(runId)`. All three produce the same verdict — the
machine-parity law is test-enforced
(`packages/vaerion/tests/integration/sdk-parity.test.ts`).

## Receipt inspection

```sh
vae journal show <RUN_ID>      # human-readable receipt + records
vae journal export <RUN_ID>    # redacted NDJSON export
```

```ts
import { VaeClient } from "@vaerion/sdk";
const vae = new VaeClient();                       // in-process, current cwd
const records = await vae.journalRecords(runId);   // the raw records
const out     = await vae.journalExport(runId);    // redacted export path
```

Receipts are also built programmatically via `buildReceiptFromRecords`, and
shape-checked via `assertReceiptShape`.

## Policy creation (broker rules)

Policies live in `vaerion.yaml` under `policy.rules[]`. Each rule is
schema-validated (`spec/schemas/vaerion-yaml.schema.json`) and requires:

```yaml
policy:
  rules:
    - id: deny-raw-shell
      domain: exec
      scope: "*"
      effect: deny          # allow | deny | prompt
      rationale: "no shell escapes from the planner"
```

- `id`, `domain`, `scope`, `effect`, `rationale` are required;
  `principalKinds` optionally scopes the rule to `"all"` or a list of
  `human | agent | tool | extension | research`.
- `scope` patterns follow the capability scope matcher: `*`, `prefix/**`,
  `prefix/*`.
- The broker is deny-by-default: an unmatched decision falls through to a
  refusal, never to silence. The model (and the permission ceiling
  `permissionGraph` you can pass to `RunHarness.create`) is explained in
  [guides/permissions](../guides/permissions.md) and
  [concepts/broker-model](../book/concepts/broker-model.md).

Programmatic surface: `evaluatePolicy`, `policyFromConfig`,
`defaultPolicyFromConfig`, `grantsFor`, `agentGrants`.

## Gateway, store, and errors (quick map)

- **Gateway**: `GatewayService` with `openaiAdapter`, `anthropicAdapter`,
  `ollamaAdapter`, `mockBrainAdapter`; budget ceilings come from
  `gateway.budgets` (`tokensPerRun`, `microUsdPerRun`).
- **Store**: `BlobStore` — content-addressed blobs
  (`put(content) → ref`, `open(ref) → bytes`, plus `exists`, `verify`),
  referenced from journal records by blake3 digest.
- **Errors**: `VaerionError` + `ExitCode` + `ERROR_CATALOG` — 82 stable
  E-codes, additive-only within v1 (see
  [reference/errors](errors.md) and `spec/errors.yaml`, the catalog of
  record).

## Integration example (loopback daemon)

Start the daemon and pair once:

```sh
vae serve   # loopback HTTP/SSE on 127.0.0.1:7897; pairing token printed once
```

```ts
import { VaeDaemonClient } from "@vaerion/sdk";

const vae = new VaeDaemonClient({
  base: "http://127.0.0.1:7897",
  token: process.env.VAE_PAIRING_TOKEN as string,
});

console.log(await vae.version());
```

This snippet was executed against `vae serve` at `0.1.14-rc1` before being
documented. The daemon refuses non-loopback binds (E2006), and every
state-changing call requires the pairing token.

## Where to go next

- [SDK.md](../SDK.md) — the full programmatic surface, wire-parity guarantees.
- [reference/cli.md](cli.md) — every command and flag.
- [book/tutorials/02-first-agent.md](../book/tutorials/02-first-agent.md) —
  the first agent run, step by step.
