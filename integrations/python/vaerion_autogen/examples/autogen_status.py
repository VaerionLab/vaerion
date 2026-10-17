#!/usr/bin/env python3
"""autogen_status.py — hand the six Vaerion tools to AutoGen and prove the trail.

Connects real `autogen_ext.tools.mcp` adapters to `vae mcp` in a fresh temp
workspace, runs two tools for real (the exact BaseTool objects an
AssistantAgent would execute), then verifies the journal with `vae verify`.
No LLM, no API keys — the trust layer is fully observable without a model.

Run:  python3 autogen_status.py
"""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from autogen_core import CancellationToken

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from vaerion_autogen import resolve_vae_command, tool_text, vae_mcp_tools


async def main() -> int:
    vae = resolve_vae_command()
    workspace = tempfile.mkdtemp(prefix="vaerion-autogen-example-")
    subprocess.run([*vae, "init", "--template", "demo"], cwd=workspace, check=True, capture_output=True)
    print(f"workspace: {workspace}")

    # In a real assistant you would pass tools=tools to AssistantAgent(...).
    tools = await vae_mcp_tools(cwd=workspace)
    token = CancellationToken()
    try:
        print(f"tools: {sorted(t.name for t in tools)}")
        status = next(t for t in tools if t.name == "vaerion_status")
        status_payload = json.loads(tool_text(status, await status.run_json({}, token)))
        print(f"status: {json.dumps(status_payload)[:160]}…")
        demo = next(t for t in tools if t.name == "vaerion_run_demo")
        run = json.loads(tool_text(demo, await demo.run_json({"query": "prove the autogen path"}, token)))
        print(f"run_id:    {run['run_id']}")
        print(f"head_hash: {run['receipt']['journal']['head_hash']}")
        print(f"summary:   {run['receipt']['summary']}")
    finally:
        pass  # the adapter owns the spawned server lifecycle per factory call

    verify = subprocess.run([*vae, "verify", "--json"], cwd=workspace, capture_output=True, text=True)
    print(f"vae verify: {verify.stdout.strip()}")
    return 0 if verify.returncode == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
