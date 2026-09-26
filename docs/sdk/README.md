# SDK — build on the engine from TypeScript

The TypeScript SDK lives at [`sdks/typescript/`](../../sdks/typescript/) as
`@vaerion/sdk`.

## Surface

- `src/index.ts` — the public SDK entry (typed clients for runs, journals, receipts)
- `src/daemon.ts` + `src/daemon-transport.ts` — transport to the engine daemon
- wire-parity law: the SDK speaks exactly the contracts in
  [`spec/`](../../spec/README.md) (OpenAPI + event registry + JSON schemas) —
  parity is enforced by the test battery, not promised

## Minimal shape

```ts
import { createClient } from "@vaerion/sdk";

const vaerion = createClient(); // daemon transport, local-first
// runs, journals, and receipts through the same contracts the CLI uses
```

The full reference is [`SDK`](../SDK.md); the HTTP contracts behind the SDK are
[`spec/openapi.json`](../../spec/openapi.json).

## Publishing state (honest)

The SDK is part of the release candidate. Its npm publishing story (`exports`,
`files`, build outputs) is a recorded, Founder-gated distribution decision —
see the release readiness report of the current train. Nothing about the SDK's
*behavior* is gated; only its registry publication.

## Other languages

A Python bridge is rehearsed at [`packaging/python/`](../../packaging/python/README.md)
and opens after the npm train. The extension contract for any language is the WIT
spec: [`spec/wit/vaerion-extension@0.1.0.wit`](../../spec/wit/vaerion-extension@0.1.0.wit).
