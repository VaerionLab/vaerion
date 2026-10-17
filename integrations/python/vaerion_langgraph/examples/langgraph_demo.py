#!/usr/bin/env python3
"""langgraph_demo.py — run Vaerion tools inside a REAL LangGraph graph, no model.

Builds a StateGraph whose tool node is the prebuilt ToolNode bound to the six
Vaerion tools loaded through langchain-mcp-adapters; the "model" is a scripted
AIMessage (a tool call) — genuine LangGraph runtime, zero network. Then the
journal is verified with `vae verify`.

Run:  python3 langgraph_demo.py
"""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from langchain_core.messages import AIMessage
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from vaerion_langgraph import resolve_vae_command, vae_mcp_client


async def main() -> int:
    vae_argv = resolve_vae_command()
    workspace = tempfile.mkdtemp(prefix="vaerion-langgraph-example-")
    subprocess.run([*vae_argv, "init", "--template", "demo"], cwd=workspace, check=True, capture_output=True)
    print(f"workspace: {workspace}")

    client = vae_mcp_client(cwd=workspace)
    tools = await client.get_tools()
    print(f"tools: {sorted(t.name for t in tools)}")

    builder = StateGraph(MessagesState)
    builder.add_node("vaerion_tools", ToolNode(tools))
    builder.add_edge(START, "vaerion_tools")
    builder.add_edge("vaerion_tools", END)
    graph = builder.compile()

    result = await graph.ainvoke({
        "messages": [AIMessage(content="", tool_calls=[{
            "name": "vaerion_run_demo",
            "args": {"query": "prove the langgraph path"},
            "id": "call_vaerion_run_demo",
            "type": "tool_call",
        }])],
    })
    blocks = result["messages"][-1].content
    text = blocks[0]["text"] if isinstance(blocks, list) else blocks
    run = json.loads(text)
    print(f"run_id:    {run['run_id']}")
    print(f"head_hash: {run['receipt']['journal']['head_hash']}")
    print(f"summary:   {run['receipt']['summary']}")

    verify = subprocess.run([*vae_argv, "verify", "--json"], cwd=workspace, capture_output=True, text=True)
    print(f"vae verify: {verify.stdout.strip()}")
    return 0 if verify.returncode == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
