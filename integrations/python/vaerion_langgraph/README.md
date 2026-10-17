# vaerion_langgraph — Vaerion × LangGraph

> **Provenance:** every example in this README was executed on **2026-10-01** against
> engine **0.1.15-rc1** and the installed adapter stack (**langchain-mcp-adapters 0.3.2,
> langgraph 1.2.12, langchain-core 1.6.6** — APIs measured from installed source, not
> docs). Captured output: [`examples/captured_output.txt`](./examples/captured_output.txt).
> The test suite spawns the real `vae mcp` server and asserts real on-disk evidence.

## Doctrine

Vaerion does not replace LangGraph — it is the verification layer beneath your graphs.
Your nodes, edges, state and models stay yours; Vaerion attaches as an MCP server
(`vae mcp`, the official engine-bundled stdio server) so every tool node executes through
the **brokered, journaled, receipt-backed** engine path — and any run can be re-verified
byte-for-byte with `vae verify`.

## What this package provides

- `vae_mcp_client(cwd=None, *, command=None, env=None, server_name="vaerion", **connection_overrides)` —
  builds a `langchain_mcp_adapters.MultiServerMCPClient` with one stdio connection bound
  to `vae mcp`; `await client.get_tools()` returns LangGraph-compatible `BaseTool`s.
- `resolve_vae_command()` — the official resolution law, mirroring `sdks/python`:
  `$VAE_BIN` → `vae` on `PATH` → repo checkout via `bun run …/packages/vaerion/src/cli/vae.ts`.
- `VAERION_TOOL_NAMES` — the ratified 6-tool surface of `vae mcp`.

**Measured API** (installed source, version 0.3.2):

```python
MultiServerMCPClient(connections: dict[str, StdioConnection])
await client.get_tools() -> list[langchain_core.tools.BaseTool]
# StdioConnection: {"transport": "stdio", "command": str, "args": list[str], "env"?, "cwd"?}
```

Measured adapter behavior worth knowing: `get_tools()` creates a **new stdio session per
tool invocation** — each `tool.ainvoke(...)` spawns `vae mcp`, performs the MCP handshake,
makes the call, and lets the server exit 0. Every invocation is fully brokered + journaled.

## Install

```sh
pip install vaerion-langgraph             # + the engine: npm install -g vaerion@rc (needs bun)
# dev checkout instead: pip install -e integrations/python/vaerion_langgraph
```

## Usage

### The six tools, loaded and invoked for real

```python
import asyncio
from vaerion_langgraph import vae_mcp_client

async def main():
    client = vae_mcp_client(cwd="/path/to/workspace")
    tools = await client.get_tools()
    demo = next(t for t in tools if t.name == "vaerion_run_demo")
    out = await demo.ainvoke({"query": "prove it"})
    print(out)   # the run's --json payload incl. receipt.head_hash

asyncio.run(main())
```

### Inside a REAL LangGraph graph (model-free)

```python
from langchain_core.messages import AIMessage
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from vaerion_langgraph import vae_mcp_client

client = vae_mcp_client(cwd="/path/to/workspace")
tools = await client.get_tools()

builder = StateGraph(MessagesState)
builder.add_node("vaerion_tools", ToolNode(tools))   # ← the trust layer
builder.add_edge(START, "vaerion_tools")
builder.add_edge("vaerion_tools", END)
graph = builder.compile()

# In production the AIMessage comes from your model node; the tool path is identical:
result = await graph.ainvoke({"messages": [AIMessage(content="", tool_calls=[{
    "name": "vaerion_status", "args": {}, "id": "call_1", "type": "tool_call",
}])]})
```

### Full executed example

`examples/langgraph_demo.py` — temp workspace, load tools, run a real StateGraph whose
tool node calls `vaerion_run_demo`, verify with `vae verify`. Captured output
([`examples/captured_output.txt`](./examples/captured_output.txt)):

```text
workspace: /tmp/vaerion-langgraph-example-k9pvs69h
tools: ['vaerion_doctor', 'vaerion_journal_ls', 'vaerion_run_agent', 'vaerion_run_demo', 'vaerion_status', 'vaerion_verify_journal']
run_id:    crn_run_01M3V0F86VPN08R6SGXB8K6FPM
head_hash: 2b52fd6f132bde22a6f7b2a2044c3a3e5b39437c4a447428a2f5dcd69c1c2f68
summary:   indexed 1 documents; 1 hits for "prove the langgraph path"
vae verify: {"command":"verify","run_id":"crn_run_01M3V0F86VPN08R6SGXB8K6FPM","verdict":"VERIFIED","ok":true,"records":14,"events":10,"head_hash":"3959957de3c6b8201eac3f7c3daef1258220011c5967c1fa900447ba9c4c0d23","torn":false,"issues":[],"next":["vae explain crn_run_01M3V0F86VPN08R6SGXB8K6FPM","vae status"]}
```

## Verification (receipts + `vae verify`)

```sh
vae journal ls      # every run: run_id, records, events, head_hash
vae verify          # full blake3 chain recomputation of the latest run (ok:true/false)
vae verify <run_id> # verify one specific run
```

## Policies & receipts (the fail-closed law)

The broker evaluates the workspace policy for every mutating action; **no matching rule =
deny (E1301)**, appended to the chained ledger `.vaerion/refusals.log`. A denied step does
not raise through the tool: the run closes WITH a receipt (`outcome: "failed"`). The test
`test_policy_deny_closes_the_run_and_lands_in_the_refusal_ledger` asserts this against a
real spawned server: refusal record present (`reason_code == "E1301"`, `scope == "echo"`,
run id matching the receipt), and the chain still verifies green afterwards.

## Tests

```sh
python3 -m unittest discover -s tests   # from this package dir
# 8 tests — 4 resolution-law + 4 REAL end-to-end (adapter load → tool names → real
# invocations → journal/refusal evidence → a REAL StateGraph ToolNode execution;
# the engine is never mocked).
```

## Host config for the same server

See the alliance index and the host guide: [`../../mcp/README.md`](../../mcp/README.md).
