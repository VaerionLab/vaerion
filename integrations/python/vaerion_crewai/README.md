# vaerion_crewai — Vaerion × CrewAI

> **Provenance:** every example in this README was executed on **2026-10-01** against
> engine **0.1.13-rc1** and the installed **crewai 1.15.23 / crewai-tools 1.15.23 /
> mcpadapt 0.1.20 / mcp 1.28.1** stack — the adapter API below was measured from the
> installed source (`crewai_tools/adapters/mcp_adapter.py`), not from docs. Captured
> output: [`examples/captured_output.txt`](./examples/captured_output.txt). The tests
> spawn the real `vae mcp` server and assert real on-disk evidence.

## Doctrine

Vaerion does not replace CrewAI — it is the verification layer beneath your crews. Your
agents, tasks and process stay yours; Vaerion attaches as an MCP server (`vae mcp`, the
official engine-bundled stdio server) so every tool a crew member executes goes through
the **brokered, journaled, receipt-backed** engine path — and any run can be re-verified
byte-for-byte with `vae verify`.

## What this package provides

- `vae_mcp_tools(cwd=None, *, command=None, env=None, tool_names=(), connect_timeout=30)` —
  a **sync context manager** yielding the six Vaerion tools as CrewAI `BaseTool` objects
  (the exact objects you pass to `Crew(agents=…, tasks=…, tools=…)`).
- `vae_stdio_params(...)` — just the `mcp.StdioServerParameters`, if you prefer to drive
  `MCPServerAdapter` yourself.
- `resolve_vae_command()` — the official resolution law, mirroring `sdks/python`:
  `$VAE_BIN` → `vae` on `PATH` → repo checkout via `bun run …/packages/vaerion/src/cli/vae.ts`.
- `VAERION_TOOL_NAMES` — the ratified 6-tool surface of `vae mcp`.

**Measured API** (installed source, version 1.15.23):

```python
MCPServerAdapter(serverparams: StdioServerParameters | dict, *tool_names,
                 connect_timeout: int = 30)
# __init__ already starts the MCP server; the context manager yields a
# ToolCollection[BaseTool]; .stop() exits. Each tool: .name/.description/.run(**kwargs).
```

**Measured ecosystem defect (documented, not patched — it is not ours to patch):**
crewai-tools 1.15.23 imports `mcpadapt` but does **not** declare it in its own metadata.
Without `mcpadapt`, `MCPServerAdapter` silently degrades to `MCP_AVAILABLE=False` and
prompts *"You are missing the 'mcp' package"* (a click prompt whose own suggested fix is
broken). This package therefore declares `mcpadapt` explicitly — install order matters
for anyone hand-rolling this integration.

## Install

```sh
pip install vaerion-crewai               # + the engine: npm install -g vaerion (needs bun)
# dev checkout instead: pip install -e integrations/python/vaerion_crewai
```

## Usage

```python
from crewai import Crew               # your crew, your agents, your model
from vaerion_crewai import vae_mcp_tools

with vae_mcp_tools(cwd="/path/to/workspace") as tools:
    status = next(t for t in tools if t.name == "vaerion_status")
    print(status.run())               # a REAL brokered, journaled call

    crew = Crew(agents=my_agents, tasks=my_tasks, tools=list(tools))
    result = crew.kickoff()           # every tool call lands in .vaerion/journal/
```

### Full executed example

`examples/crew_status.py` — temp workspace, real adapter connect, real tool runs,
`vae verify` at the end. Captured output
([`examples/captured_output.txt`](./examples/captured_output.txt)):

```text
workspace: /tmp/vaerion-crewai-example-rzutlwy6
tools: ['vaerion_doctor', 'vaerion_journal_ls', 'vaerion_run_agent', 'vaerion_run_demo', 'vaerion_status', 'vaerion_verify_journal']
status: {"command":"status","engine_version":"0.1.13-rc1","workspace":{"state":"workspace","name":"my-project","config_fingerprint":"41c3410b862ac152f5d6176a5888686f9d6…
run_id:    crn_run_01M3V0MFDHQT0RR5KDQ4P41Q2J
head_hash: ced246a8385090c9b6227410f2467ad09220c8e8d4885ecc29d551017a8a99e9
summary:   indexed 1 documents; 1 hits for "prove the crewai path"
vae verify: {"command":"verify","run_id":"crn_run_01M3V0MFDHQT0RR5KDQ4P41Q2J","verdict":"VERIFIED","ok":true,"records":14,"events":10,"head_hash":"c2b03d0b83b8ff818e83c241aa4a3ab7c9a05dbbcca82d946d384041a8d69627","torn":false,"issues":[],"next":["vae explain crn_run_01M3V0MFDHQT0RR5KDQ4P41Q2J","vae status"]}
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
# 8 tests — 4 resolution-law + 4 REAL end-to-end (adapter connect → tool names →
# real runs → name filtering → refusal evidence; the engine is never mocked).
```

## Host config for the same server

See the alliance index and the host guide: [`../../mcp/README.md`](../../mcp/README.md).
