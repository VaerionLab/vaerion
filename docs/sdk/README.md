# SDK — build on the engine from TypeScript

The TypeScript SDK lives at [`sdks/typescript/`](../../sdks/typescript/) as
`@vaerion/sdk`. It is a **projection of the engine, never a second
implementation**: the SDK exercises the same contracts the CLI does — same
runs, same journals, same receipts — and that parity is tested
(`packages/vaerion/tests/integration/sdk-parity.test.ts`), not promised.

There are two clients. There is no `createClient` factory — this document
names only exports that exist in `src/index.ts`.

## `VaeClient` — in-process (no network)

Binds directly to the engine and operates on exactly one workspace
(`vaerion.yaml` + `.vaerion/`), resolved from `cwd`:

```ts
import { VaeClient } from "@vaerion/sdk";

const vae = new VaeClient({ cwd: "./my-workspace" });

const run = await vae.runResearch({ sources: ["./docs"], query: "journal deterministic" });
// => { runId, traceId, documents, hits, receipt, journalVerified }

const report = await vae.journalVerify(run.runId); // VerifyReport
```

Methods mirror the CLI one-for-one: `init`, `runResearch`, `journalList`,
`journalVerify`, `journalRecords`, `journalExport`, `restoreState`,
`resume`, `refusals`, `verifyRefusals`, `verifyRunEvidence`, `verifyAudit`,
`gatewayInvoke`, `metering`, `gatewayMatrix`, `agentRun`, `workflowRun`,
`agentMetrics`.

## `VaeDaemonClient` — over the wire (HTTP/SSE)

Attaches to the local daemon started with `vae serve` — loopback only, pair
with the token the daemon prints once:

```ts
import { VaeDaemonClient } from "@vaerion/sdk";

const daemon = new VaeDaemonClient({ base: "http://127.0.0.1:7897", token: "<pairing-token>" });
await daemon.health();
const started = await daemon.startAgentRun({ goal: "..." });
for await (const evt of daemon.streamRunEvents(started.run_id)) {
  // journaled events with cursor replay; the stream ends when the run seals
}
```

## Reference

The full, verified method surface — signatures, authentication law, error
semantics — is the SDK document of record:
[`docs/SDK.md`](../SDK.md). The HTTP contracts behind the daemon client are
[`spec/openapi.json`](../../spec/openapi.json) and the daemon route table
(`packages/vaerion/src/api/routes.ts`); the language-neutral contract future
SDKs follow is [`VAERION_SDK_STANDARD.md`](../../VAERION_SDK_STANDARD.md).

## Publishing state (honest)

The SDK is a workspace package of this repository (`private: true`,
consumed from source with Bun). Registry publication of `@vaerion/sdk` is a
recorded, Founder-gated distribution decision — see [`SDK.md`](../SDK.md)
for what is and is not published today. Nothing about the SDK's *behavior*
is gated; only its registry publication.

## Other languages

All five SDKs are **shipped**: TypeScript (this package — the only in-process
binding), Python ([`sdks/python/`](../../sdks/python/README.md) — PyPI name
`vaerion-sdk`, import name `vaerion`), Go ([`sdks/go/`](../../sdks/go/README.md)),
Rust ([`sdks/rust/`](../../sdks/rust/README.md)), and Java
([`sdks/java/`](../../sdks/java/README.md)) — every non-TS binding runs over
the loopback daemon wire. The CLI-launcher wheel lives separately at
[`packaging/python/`](../../packaging/python/README.md) (PyPI name `vaerion`);
the naming strategy of record is documented there. The extension contract for
any language is the WIT spec:
[`spec/wit/vaerion-extension@0.1.0.wit`](../../spec/wit/vaerion-extension@0.1.0.wit).
