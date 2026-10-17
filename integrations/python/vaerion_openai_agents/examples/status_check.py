#!/usr/bin/env python3
"""status_check.py — attach the Agents SDK MCP layer to `vae mcp` and prove it.

This is the model-free half of the integration (the half that needs no API
key): MCPServerStdio connects, lists the 6 ratified tools, executes REAL
tool calls, and the journal is verified with `vae verify` at the end. An
Agents-SDK agent uses this exact server object (attach it to your Agent's
`mcp_servers=[...]` and every tool call routes through Vaerion).

Run:  python3 status_check.py
"""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from vaerion_openai_agents import VAERION_TOOL_NAMES, resolve_vae_command, vae_mcp_server


async def main() -> int:
    vae = resolve_vae_command()
    workspace = tempfile.mkdtemp(prefix="vaerion-agents-example-")
    subprocess.run([*vae, "init", "--template", "demo"], cwd=workspace, check=True, capture_output=True)
    print(f"workspace: {workspace}")

    # In a real agent you would pass this server to Agent(mcp_servers=[server]).
    server = vae_mcp_server(cwd=workspace)
    await server.connect()
    try:
        tools = await server.list_tools()
        print(f"tools: {[t.name for t in tools]}")
        assert [t.name for t in tools] == list(VAERION_TOOL_NAMES)

        result = await server.call_tool("vaerion_run_demo", {"query": "verify me"})
        run = json.loads(result.content[0].text)
        print(f"run_id:     {run['run_id']}")
        print(f"head_hash:  {run['receipt']['journal']['head_hash']}")
        print(f"summary:    {run['receipt']['summary']}")
        print(f"verified:   {run['journal_verified']}")
    finally:
        await server.cleanup()

    verify = subprocess.run([*vae, "verify", "--json"], cwd=workspace, capture_output=True, text=True)
    print(f"vae verify: {verify.stdout.strip()}")
    return 0 if verify.returncode == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
