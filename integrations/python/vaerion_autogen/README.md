# vaerion_autogen — Vaerion × AutoGen

> **Provenance:** every example in this README was executed on **2026-10-01** against
> engine **0.1.13-rc1** and the installed **autogen-agentchat 0.7.5 / autogen-ext 0.7.5 /
> mcp 1.28.1** stack — the adapter API below was measured from the installed source
> (`autogen_ext/tools/mcp/`), not from docs. Captured output:
> [`examples/captured_output.txt`](./examples/captured_output.txt). The tests spawn the
> real `vae mcp` server and assert real on-disk evidence.

## Doctrine

Vaerion does not replace AutoGen — it is the verification layer beneath your assistant
agents. Your agents, model clients and orchestration stay yours; Vaerion attaches as an
MCP server (`vae mcp`, the official engine-bundled stdio server) so every tool an
assistant executes goes through the **brokered, journaled, receipt-backed** engine path —
and any run can be re-verified byte-for-byte with `vae verify`.

## What this package provides

- `vae_stdio_params(cwd=None, *, command=None, env=None, read_timeout_seconds=120.0)` —
  builds the `StdioServerParams` for `vae mcp` bound to one workspace (the command
  resolves like the official Python SDK: `$VAE_BIN` → `vae` on PATH → the repo's
  `bun run packages/vaerion/src/cli/vae.ts` fallback).
- `vae_mcp_tools(...)` — async factory: connects through `autogen_ext.tools.mcp` and
  returns the six ratified tools as `StdioMcpToolAdapter` objects, ready for
  `AssistantAgent(tools=...)`.
- `VAERION_TOOL_NAMES` — the six tool names of record
  (`vaerion_doctor · vaerion_status · vaerion_journal_ls · vaerion_verify_journal ·
  vaerion_run_demo · vaerion_run_agent`).
- `tool_text(tool, result)` — flattens an adapter result (the MCP content list) into the
  CLI `--json` payload text the engine emitted.
- `resolve_vae_command()` — the vae command of record, exposed for examples and ops.

## Quickstart (measured)

```python
import asyncio
from autogen_core import CancellationToken
from vaerion_autogen import vae_mcp_tools, tool_text

async def main():
    tools = await vae_mcp_tools(cwd="path/to/your/vaerion/workspace")
    token = CancellationToken()
    status = next(t for t in tools if t.name == "vaerion_status")
    print(tool_text(status, await status.run_json({}, token)))

    demo = next(t for t in tools if t.name == "vaerion_run_demo")
    run = tool_text(demo, await demo.run_json({"query": "quarterly summary"}, token))
    print(run["run_id"], run["receipt"]["journal"]["head_hash"])

asyncio.run(main())
```

Real assistant loop (no API key needed to prove the path — the repo test suite drives a
genuine `AssistantAgent` with AutoGen's deterministic `ReplayChatCompletionClient`, which
decides a `FunctionCall` and executes it through the real MCP adapter + engine).

## Installation

```bash
pip install vaerion-autogen          # PyPI publish is Founder-gated
# from a checkout of this repo:
pip install -e integrations/python/vaerion_autogen
```

Requires: `autogen-ext` (mcp extra), `mcp`, and a `vae` runtime (Bun; see
`docs/INSTALL.md`). AutoGen versions this package was measured against: **0.7.5**.

## Verification & receipts

Every MCP tool call lands in the workspace journal; `vaerion_run_demo` /
`vaerion_run_agent` return the terminal receipt (`run_id`,
`receipt.journal.head_hash`, `journal_verified`). Verify independently of any process:

```bash
vae verify                 # latest run, full blake3 chain recomputed from disk bytes
vae journal verify <RUN_ID> --json
```

## Policies & refusals

Permission is the engine's fail-closed law: an action with no matching policy rule is
denied `E1301`, the denial is journaled **and** appended to
`.vaerion/refusals.log` (its own blake3 chain). The test suite proves it: an undeclared
tool step closes the run with `outcome: "failed"`, a receipt on the chain, exactly one
refusal record (`reason_code: E1301`, scope `echo`), and the journal still verifies.
Declare what your assistants may do in `vaerion.yaml` (`policy.rules`) — see
`docs/` and the `enterprise` template.

## Honest gaps

- The adapters speak the engine's tool surface (`vae mcp`); AutoGen-side memory, model
  selection and orchestration remain yours (by doctrine).
- `run_json` args follow each tool's MCP `inputSchema` exactly (e.g. `vaerion_run_agent`
  takes `goal`, optional object-array `steps`, optional `planner`). Hosts that map JSON
  schemas to typed models need `items` on object arrays — the engine schema declares
  them correctly.

## Tests

```bash
python -m unittest discover -s tests   # 8 tests — real spawned `vae mcp`, real evidence
```
