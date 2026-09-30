# Concepts — Architecture

The layer model, the event spine, and the contracts. Deep records:
[`../adr/README.md`](../adr/README.md) ·
[`../../spec/`](../../spec/) · the master blueprint
([`../vaerion-master-blueprint.md`](../vaerion-master-blueprint.md)).

## The one-sentence model

Vaerion runs AI-assisted work the way a database engine runs
transactions: one versioned event spine, append-only hash-chained
journals, a fail-closed permission broker, deterministic replay, and
receipts folded from journals.

## Layers (enforced by law, not convention)

`tools/layerlint.ts` fails the build if any lower layer imports a
higher one (552 runtime edges checked on every verify):

| Layer | Components | Role |
|---|---|---|
| L0 | `kernel`, `config` | blake3 content identity, canonical JSON, deterministic ids/errors; strict schema-validated `vaerion.yaml` (unknown keys rejected) |
| L1 | `spine`, `journal`, `store`, `receipts`, `broker` | the event spine; append-only NDJSON journals; content-addressed blob store; receipts folded from journals; the permission engine |
| L2 | `runtime`, `research`, `agents`, `workflow`, `package`, `evals`, `extensions`, `repo`, `identity`, `center`, `perf` | deterministic run engines (research pipeline, supervised agent loop, DAG workflows), reproducible packaging, repository intelligence, local identity |
| L4 | `cli`, `api` | the `vae` command surface; the loopback-only HTTP/SSE daemon exposing the same contracts |

## The event spine

Every state change is an envelope on one versioned bus
(`spine/envelope.ts`): `v`, `type`, `ts`, `trace_id`/`span_id`, `actor`,
`cause`, `payload`, `seq`. The `cause` field is what makes runs
explainable — `vae explain RUN_ID` walks the cause chain and narrates
the run from its journal alone.

## The contracts of record

[`spec/`](../../spec/) is the single source of truth for machine
behavior: 8 JSON Schemas (`envelope`, `journal-record`, `receipt`,
`broker-decision`, `gate`, `evidence-record`, `capability-declaration`,
`vaerion-yaml`, …), the event registry (`spec/events/registry.json`),
the E-diagnostics catalog (`spec/errors.yaml` — 82 stable codes, each
with a Fix), the OpenAPI document served by `vae serve`, and the
extension WIT world. The TypeScript SDK
([`../SDK.md`](../SDK.md)) is wire-parity-tested against the CLI over
these same contracts.

## Where to go next

- How runs fold state from journals (why crashes resume):
  [runtime.md](runtime.md)
- The hash chain and receipts: [journals.md](journals.md)
- The broker and the gateway gate: [security.md](security.md)
