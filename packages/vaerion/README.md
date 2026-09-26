# @vaerion/engine

The Vaerion constitutional engine — an AI-native development runtime that is
local-first, deterministic, and provable.

- **Event spine + journal**: every fact is an attributed, hash-chained journal record
  (NDJSON + blake3). Verify, replay, and recovery are first-class.
- **Permission broker**: every privileged action crosses `decide → journal → act`;
  unmatched requests fail closed with stable `E####` codes.
- **Model gateway**: anthropic / openai / ollama + the seeded `mockbrain` virtual
  provider; integer micro-USD metering; secrets cross a name-only boundary.
- **Agents, workflows, research**: supervised agent loop, deterministic DAG engine,
  the One Context Path with citation enforcement, hermetic eval harness.
- **Surfaces**: `vae` CLI, loopback API daemon (HTTP/SSE + OpenAPI), TypeScript SDK,
  digest-pinned extension host (WIT world), reproducible `.vxn` packaging.

## Run the CLI

This package ships TypeScript sources executed by Bun (ADR-0018, reference substrate):

```bash
bun run <node_modules>/@vaerion/engine/src/cli/vae.ts --help
```

Typical flows: `vae init` · `vae run demo|model|agent|workflow` · `vae resume` ·
`vae explain` · `vae journal ls|show|verify|recover|export` · `vae doctor` ·
`vae dev` · `vae serve` · `vae package build|verify`.

Every command supports `--json` (stable NDJSON), `--dry-run` (zero side effects),
and honest exit codes (0/1/2/3/4/5).

## Library use

```ts
import { RunHarness, AgentRuntime, GatewayService } from "@vaerion/engine";
```

The barrel exports the engine contracts; the CLI (`@vaerion/engine/cli`) is the
porcelain reference for how they compose lawfully.

## Docs

Repository book at `docs/book/` (tutorials, guides, concepts, accessibility),
contracts at `spec/` (OpenAPI, error catalog, event registry, schemas, WIT world).
Generated AI corpus: `llms.txt` / `llms-full.txt` at the repository root.
