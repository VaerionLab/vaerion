#!/usr/bin/env python3
"""crew_status.py — hand the six Vaerion tools to CrewAI and prove the trail.

Connects a real MCPServerAdapter to `vae mcp` in a fresh temp workspace, runs
two tools for real (the exact BaseTool objects a Crew would execute), then
verifies the journal with `vae verify`. No LLM, no API keys — the trust layer
is fully observable without a model.

Run:  python3 crew_status.py
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from vaerion_crewai import resolve_vae_command, vae_mcp_tools


def main() -> int:
    vae = resolve_vae_command()
    workspace = tempfile.mkdtemp(prefix="vaerion-crewai-example-")
    subprocess.run([*vae, "init", "--template", "demo"], cwd=workspace, check=True, capture_output=True)
    print(f"workspace: {workspace}")

    # In a real crew you would pass tools=list(tools) to Crew(agents=[...], tasks=[...]).
    with vae_mcp_tools(cwd=workspace) as tools:
        print(f"tools: {sorted(t.name for t in tools)}")
        status = next(t for t in tools if t.name == "vaerion_status")
        print(f"status: {status.run()[:160]}…")
        demo = next(t for t in tools if t.name == "vaerion_run_demo")
        run = json.loads(demo.run(query="prove the crewai path"))
        print(f"run_id:    {run['run_id']}")
        print(f"head_hash: {run['receipt']['journal']['head_hash']}")
        print(f"summary:   {run['receipt']['summary']}")

    verify = subprocess.run([*vae, "verify", "--json"], cwd=workspace, capture_output=True, text=True)
    print(f"vae verify: {verify.stdout.strip()}")
    return 0 if verify.returncode == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
