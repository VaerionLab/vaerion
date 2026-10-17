# Vaerion Framework Integrations — the Alliance

> **Provenance:** this index and every integration beneath it were produced on
> **2026-10-01** against engine **0.1.15** in this repository. Each README states its
> measured framework versions and each example ships a captured output file. Nothing here
> is aspirational.

## Doctrine — the trust layer, not a competitor

Vaerion does not replace agent frameworks. Frameworks are where agents are *built*;
Vaerion is the verification layer *beneath* them: every action that crosses it is
**brokered** (fail-closed policy), **journaled** (append-only blake3 chain), and closes
with a **receipt** that `vae verify` re-computes from the bytes on disk — independent of
any process, any model, any host.

The alliance pattern is one server, many hosts: the official MCP server ships **inside
the engine** (`vae mcp` — stdio, newline-delimited JSON-RPC 2.0, protocol 2024-11-05,
six ratified tools, every call executing the real CLI contract in-process). A framework
attaches once and inherits the whole constitutional path.

## The integrations

| Integration | Package / surface | Framework (measured) | Path |
|---|---|---|---|
| **MCP — any host** | in-engine `vae mcp` + host guide & stdio demo | protocol 2024-11-05 (Claude Desktop, Cursor, Cline, …) | [`integrations/mcp/`](./mcp/) |
| **OpenAI Agents SDK** | `vaerion_openai_agents` | openai-agents **0.20.0** | [`integrations/python/vaerion_openai_agents/`](./python/vaerion_openai_agents/) |
| **LangGraph** | `vaerion_langgraph` | langgraph **1.2.12** · langchain-mcp-adapters **0.3.2** | [`integrations/python/vaerion_langgraph/`](./python/vaerion_langgraph/) |
| **CrewAI** | `vaerion_crewai` | crewai **1.15.23** · crewai-tools **1.15.23** | [`integrations/python/vaerion_crewai/`](./python/vaerion_crewai/) |
| **AutoGen** | `vaerion_autogen` | autogen-agentchat / autogen-ext **0.7.5** | [`integrations/python/vaerion_autogen/`](./python/vaerion_autogen/) |

## What every integration delivers

- **Installation** — a `pyproject.toml` (or, for MCP, the engine you already have) with
  only the dependencies it truly imports.
- **Examples** — an example script that was *executed*, with its captured output checked
  in (`examples/captured_output.txt`).
- **Documentation** — a README with a provenance header (engine version, framework
  versions, measured-from-source API notes), quickstart, honest gaps.
- **Verification** — instructions (and tests proving) that `vae verify` /
  `vae journal verify <RUN_ID>` recompute the chain from disk.
- **Receipts** — every run exposes `run_id`, `receipt.journal.head_hash`,
  `journal_verified`.
- **Policies** — the fail-closed law end-to-end: no matching rule ⇒ deny `E1301`, the
  denial journaled **and** ledgered in `.vaerion/refusals.log` (its own blake3 chain).

## Install matrix

```bash
pip install integrations/python/vaerion_openai_agents   # from a repo checkout, -e optional
pip install integrations/python/vaerion_langgraph
pip install integrations/python/vaerion_crewai
pip install integrations/python/vaerion_autogen
```

The MCP host guide needs no install beyond the engine itself: `vae mcp` (installed CLI)
or `bun run packages/vaerion/src/cli/vae.ts mcp` (dev checkout).

## Test everything yourself

```bash
cd integrations/python/vaerion_openai_agents && python -m unittest discover -s tests
cd integrations/python/vaerion_langgraph     && python -m unittest discover -s tests
cd integrations/python/vaerion_crewai        && python -m unittest discover -s tests
cd integrations/python/vaerion_autogen       && python -m unittest discover -s tests
python integrations/mcp/demo_stdio.py
```

Each suite spawns the **real** engine (`vae mcp` / `vae serve`) in temp workspaces and
asserts **real** evidence — journals, receipts, refusal ledgers, chain verification.
No mocks of the engine exist anywhere in this tree.

## Engine-side note (fixed during this phase)

The MCP `vaerion_run_agent` input schema originally declared `steps` as
`{"type": "array"}` with no `items`; typed-schema hosts (e.g. autogen-ext 0.7.5's
pydantic mapping) inferred `list[str]` and rejected object steps. The schema now
declares `items: {"type": "object", "additionalProperties": true}` — measured and
regression-pinned by the alliance suites.
