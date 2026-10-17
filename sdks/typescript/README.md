# @vaerion/sdk — the TypeScript SDK for Vaerion

> **Provenance.** Generated against engine `0.1.15-rc1` (version-register
> alignment, 2026-10-03; signatures verified against source at `815e929`).
> Every method below exists in `src/index.ts` / `src/daemon.ts` — nothing is
> aspirational. Conforms to [`../../VAERION_SDK_STANDARD.md`](../../VAERION_SDK_STANDARD.md):
> this SDK is the **reference projection** of the engine, not a second
> implementation (§0).

## Installation

This package is a **workspace package of the repository** (`private: true`):
it ships from source with Bun and is consumed by the engine itself. Registry
publication of `@vaerion/sdk` is a recorded, Founder-gated distribution
decision — nothing about the SDK's *behavior* is gated, only its registry
publication (see [`../../docs/sdk/README.md`](../../docs/sdk/README.md)).

```sh
# from a repository checkout
bun install                      # links @vaerion/sdk into the workspace
```

## The two binding modes (§1(a))

| Class | Binding | Use it when |
|---|---|---|
| `VaeClient` | **in-process** — drives the engine library directly over the same `runCli` contract the CLI uses | tests, tools, and apps that run inside a Bun/TS process with workspace access |
| `VaeDaemonClient` | **wire** — loopback HTTP/SSE client for `vae serve` | editors, long-running daemons, cross-process integration |

There is no `createClient` factory. The two constructors **are** the entry
points; both are verified by the engine's machine-parity suite
(`tests/integration/sdk-parity.test.ts`, `tests/integration/daemon-parity.test.ts`).

## Minimal example

`examples/quickstart.ts` — a complete in-process journey (init → research →
verify → receipt). Run it with Bun from the repository root:

```sh
bun run sdks/typescript/examples/quickstart.ts
```

The essential shape:

```ts
import { VaeClient } from "@vaerion/sdk";          // workspace import: "../src/index.ts"

const vae = new VaeClient({ cwd: workspaceDir });   // in-process binding

await vae.init("my-project");                       // scaffolds vaerion.yaml + .vaerion/
const run = await vae.runResearch({                 // the journaled research pipeline
  sources: ["./docs"],
  query: "deterministic journal",
  maxDocs: 4,
});
run.journalVerified;                                // true — chain recomputed at close
run.runId;                                          // crn_run_… — the durable handle
```

## Verification example

Verification is a first-class SDK surface — the same fold the CLI performs:

```ts
const report = await vae.journalVerify(run.runId);  // full blake3 chain recomputation
report.ok;                                          // true

const evidence = await vae.verifyRunEvidence(run.runId);
const audit = await vae.verifyAudit();              // the audit log's own chain
const refusals = await vae.verifyRefusals();        // the refusal log's chain
```

## Receipts

A receipt is the **terminal journal record** of a closed run — a fold over
the journal that commits to the record count and head hash:

```ts
const records = await vae.journalRecords(run.runId);
const receipt = records[records.length - 1];
receipt?.k;                                         // "receipt"

const exported = await vae.journalExport(run.runId, "/tmp/redacted-export.json");
// copied receipts re-certify to the export's own chain — the redacted
// export self-verifies without breaking provenance
```

## The daemon client

`examples/daemon-client.ts` — wire mode against `vae serve`. Start a daemon
in one terminal (the pairing token is printed **once**; headless starts
pre-provision via `VAE_TRUST=<token>`):

```sh
vae serve                      # loopback HTTP/SSE — refuses non-loopback binds (E2001)
```

Then attach:

```ts
import { VaeDaemonClient } from "../src/index.ts";

const daemon = new VaeDaemonClient({ base: "http://127.0.0.1:<port>", token });
await daemon.version();        // engine version + contract of record
await daemon.listRuns();       // every route is covered 1:1 (18 routes / 17 paths)
```

## Errors (§10(b))

Errors carry their stable E-code, a generated `fix`, and the HTTP status
where one exists — the standard cites this SDK as the reference behavior:

```ts
try {
  await daemon.listRuns();
} catch (err) {
  err.code;   // e.g. "E2006" — loopback law violation
  err.fix;    // machine-actionable remediation text
  err.status; // HTTP status, where applicable
}
```

## Loopback law (§11(a))

`assertLoopbackBase` runs in code, before any socket: a non-loopback base
URL is refused with `E2006`. Remote exposure requires a ratified
transport-security ADR — never a flag.

## Streaming (§13)

`streamRunEvents` / `streamWorkspaceEvents` are async generators over the
daemon's SSE frames (`event: end` / `event: error` terminate the stream):

```ts
for await (const event of daemon.streamRunEvents(runId, { fromCursor: 0 })) {
  event.type;   // journaled event types as they land
}
```

## What this SDK deliberately does NOT re-export

`RunHarness` (the engine's run harness) is re-exported for advanced
in-process composition — that is the entire extension surface. Everything
else the engine composes (blob store, gateway, broker) is reachable through
the client methods above; the full export block is
[`src/index.ts`](src/index.ts).

## Conformance (§18)

Nothing ships in-dir; the equivalent 30-test battery lives in the engine
suite and runs on every verification pass:

```
sdk-parity 5/5 · daemon-parity 3/3 · daemon + daemon-packages 22/22
```

## Known honest gaps (§17)

- Handshake version-mismatch refusal (§16(c)) is not implemented in any SDK
  yet — tracked as a ratified additive candidate, never invented silently.
- Registry publication is Founder-gated (see `docs/sdk/README.md`).
