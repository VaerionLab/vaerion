# vaerion_openai_agents — Vaerion × OpenAI Agents SDK

> **Provenance:** every example in this README was executed on **2026-10-01** against
> engine **0.1.15** and **openai-agents 0.20.0** (installed source measured: the
> `MCPServerStdio` API below comes from the installed package, not from docs). Captured
> output lives in [`examples/captured_output.txt`](./examples/captured_output.txt); the
> test suite spawns the real `vae mcp` server and asserts real on-disk evidence.

## Doctrine

Vaerion does not replace the OpenAI Agents SDK — it is the verification layer beneath it.
Your agent keeps its model, its guardrails, its handoffs; Vaerion attaches as an MCP
server (`vae mcp`, the official engine-bundled stdio server) so every tool call the agent
makes is **broker-decided, journaled and receipt-backed**, and the resulting journal can
be re-verified byte-for-byte with `vae verify` — trusting bytes, not processes.

## What this package provides

- `vae_mcp_server(cwd=None, *, command=None, timeout_seconds=30.0, **stdio_overrides)` —
  builds an `agents.mcp.MCPServerStdio` pointed at `vae mcp` with sane defaults.
- `resolve_vae_command()` — the official resolution law, mirroring `sdks/python`:
  `$VAE_BIN` → `vae` on `PATH` → repo checkout via `bun run …/packages/vaerion/src/cli/vae.ts`.
- `VAERION_TOOL_NAMES` — the ratified 6-tool surface of `vae mcp`.

**Measured API** (`pip show openai-agents` → 0.20.0, `agents/mcp/server.py`):

```python
MCPServerStdio(params: MCPServerStdioParams,   # {command, args, env?, cwd?}
               cache_tools_list: bool = False,
               name: str | None = None,
               client_session_timeout_seconds: float | None = 5, …)
# lifecycle: await connect() → await list_tools() → await call_tool(name, arguments) → await cleanup()
```

## Install

```sh
pip install vaerion-openai-agents          # + the engine: npm install -g vaerion@rc (needs bun)
# dev checkout instead: pip install -e integrations/python/vaerion_openai_agents
```

> **Name trap (measured):** the PyPI distribution of the OpenAI Agents SDK is
> **`openai-agents`** (import name `agents`). The bare PyPI name `agents` is an unrelated
> Google reinforcement-learning package (v1.4.0, imports tensorflow) that *shadows* the
> SDK's import namespace — installing it breaks `from agents.mcp import MCPServerStdio`.
> This package declares `openai-agents` so you never hit it.

## Usage

### Model-free proof (what the tests execute)

```python
import asyncio
from vaerion_openai_agents import vae_mcp_server

async def main():
    server = vae_mcp_server(cwd="/path/to/vaerion-workspace")
    await server.connect()
    tools = await server.list_tools()                       # the 6 ratified tools
    result = await server.call_tool("vaerion_run_demo", {"query": "verify me"})
    await server.cleanup()
    print(result.content[0].text)                           # brokered, journaled, receipt-backed

asyncio.run(main())
```

### Inside a real agent

```python
from agents import Agent, Runner
from vaerion_openai_agents import vae_mcp_server

server = vae_mcp_server(cwd="/path/to/vaerion-workspace")

agent = Agent(
    name="audited-assistant",
    instructions="Use tools to answer. Every action is verified by Vaerion.",
    model="gpt-4o",                      # your model, your guardrails
    mcp_servers=[server],                # ← the trust layer: every tool call is brokered + journaled
)

result = await Runner.run(agent, "Index this repo and prove what you did.")
# In the workspace: .vaerion/journal/crn_run_*.ndjson + receipts + (on denial) refusals.log
```

### Full executed example

`examples/status_check.py` — creates a temp workspace, connects, lists tools, runs
`vaerion_run_demo` for real, verifies with `vae verify`. Captured output
([`examples/captured_output.txt`](./examples/captured_output.txt)):

```text
workspace: /tmp/vaerion-agents-example-rvfhxfi9
tools: ['vaerion_doctor', 'vaerion_status', 'vaerion_journal_ls', 'vaerion_verify_journal', 'vaerion_run_demo', 'vaerion_run_agent']
run_id:     crn_run_01M3V09J3REPBXHTJY2JC9WC17
head_hash:  ba64f9d3f3f686266ef9031f4aa6b19c46cc9b3c063136228d4fc3b5bf7915e1
summary:    indexed 1 documents; 0 hits for "verify me"
verified:   True
vae verify: {"command":"verify","run_id":"crn_run_01M3V09J3REPBXHTJY2JC9WC17","verdict":"VERIFIED","ok":true,"records":14,"events":10,"head_hash":"503ac32c1ef8278722cafaff539c40b11cdf4fee6853ddea71e71cdde2f35674","torn":false,"issues":[],"next":["vae explain crn_run_01M3V09J3REPBXHTJY2JC9WC17","vae status"]}
```

## Verification (receipts + `vae verify`)

Every tool call produces journaled evidence in the workspace:

```sh
vae journal ls      # every run: run_id, records, events, head_hash
vae verify          # full blake3 chain recomputation of the latest run (ok:true/false)
vae verify <run_id> # verify one specific run
```

From inside the agent (or your code) the same power is available as MCP tools:
`vaerion_journal_ls`, `vaerion_verify_journal` — the agent can verify its own trail, but
the hash chain means it cannot forge one.

## Policies & receipts (the fail-closed law)

- The broker evaluates the workspace policy for every mutating action; **no matching rule
  = deny (E1301)** and the refusal is appended to the chained ledger `.vaerion/refusals.log`.
- A denied step does **not** raise through the MCP layer: the run closes WITH a receipt
  (`outcome: "failed"`), which is journaled evidence. The test
  `test_policy_deny_closes_the_run_and_lands_in_the_refusal_ledger` asserts exactly this
  against a real spawned server: refusal record present, `reason_code == "E1301"`,
  `domain == "tool.call"`, chain still verifies green afterwards.

## Tests

```sh
python3 -m unittest discover -s tests   # from this package dir
# 7 tests — 4 resolution-law + 3 REAL end-to-end (real spawned `vae mcp`, real workspaces,
# real journals, real refusals; the engine is never mocked).
```

## Host config for the same server

See the alliance index and the host guide: [`../../mcp/README.md`](../../mcp/README.md).
