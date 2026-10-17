"""REAL end-to-end tests: langchain-mcp-adapters against a spawned `vae mcp`.

Model-free by design (the honesty law): no LLM anywhere. The tests load the
REAL LangChain tools through the adapter, invoke them for real, execute a REAL
LangGraph graph (a StateGraph whose tool node is a ToolNode holding the Vaerion
tools), and assert REAL on-disk evidence (journal, receipt, refusal ledger,
chain verification).
"""

from __future__ import annotations

import unittest

from langchain_core.messages import AIMessage
from langchain_core.tools import BaseTool
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from vaerion_langgraph import VAERION_TOOL_NAMES, vae_mcp_client

import _support


class TestMcpToolsEndToEnd(unittest.IsolatedAsyncioTestCase):
    async def test_loaded_tools_are_langchain_and_the_six_ratified_names(self) -> None:
        ws = _support.make_workspace("demo")
        client = vae_mcp_client(cwd=ws)
        tools = await client.get_tools()
        self.assertEqual(sorted(t.name for t in tools), sorted(VAERION_TOOL_NAMES))
        for tool in tools:
            self.assertIsInstance(tool, BaseTool)
            self.assertTrue(tool.description)

    async def test_status_and_demo_invocations_produce_journal_evidence(self) -> None:
        ws = _support.make_workspace("demo")
        client = vae_mcp_client(cwd=ws)
        tools = await client.get_tools()

        status = next(t for t in tools if t.name == "vaerion_status")
        status_out = await status.ainvoke({})
        status_payload = _support.tool_text_payload(status_out)
        self.assertEqual(status_payload["command"], "status")
        self.assertIn("engine_version", status_payload)

        demo = next(t for t in tools if t.name == "vaerion_run_demo")
        demo_out = await demo.ainvoke({"query": "e2e from langgraph"})
        run = _support.tool_text_payload(demo_out)
        self.assertTrue(run["run_id"].startswith("crn_run_"))
        self.assertTrue(run["journal_verified"])
        self.assertEqual(run["receipt"]["counts"]["records"], run["receipt"]["journal"]["records"])

        # REAL evidence on disk — exactly one journal, matching the receipt.
        journals = _support.journal_files(ws)
        self.assertEqual(len(journals), 1)
        self.assertEqual(journals[0].stem, run["run_id"])
        verify = _support.verify_json(ws)
        self.assertEqual(verify["verdict"], "VERIFIED")
        self.assertEqual(verify["run_id"], run["run_id"])

    async def test_policy_deny_closes_the_run_and_lands_in_the_refusal_ledger(self) -> None:
        # The `agent` template ships no echo grant: the broker fails closed (E1301).
        ws = _support.make_workspace("agent")
        client = vae_mcp_client(cwd=ws)
        tools = await client.get_tools()
        run_agent = next(t for t in tools if t.name == "vaerion_run_agent")
        out = await run_agent.ainvoke({
            "goal": "echo without a grant",
            "steps": [{"kind": "tool", "tool": "echo", "args": {"value": "hi"}}],
        })
        run = _support.tool_text_payload(out)
        self.assertEqual(run["outcome"], "failed")  # journaled evidence, not an exception
        self.assertTrue(run["receipt"]["journal"]["head_hash"])

        refusals = _support.refusal_records(ws)
        self.assertEqual(len(refusals), 1)
        self.assertEqual(refusals[0]["reason_code"], "E1301")
        self.assertEqual(refusals[0]["scope"], "echo")
        self.assertEqual(refusals[0]["run_id"], run["run_id"])
        self.assertTrue(_support.verify_json(ws)["ok"])

    async def test_tools_execute_inside_a_real_langgraph_graph(self) -> None:
        # The honest LangGraph-compatibility proof: a REAL StateGraph whose tool
        # node is the prebuilt ToolNode bound to the Vaerion tools. The "model"
        # is a scripted AIMessage (a tool call) — no network, no API key, and
        # the graph execution is the genuine LangGraph runtime path.
        ws = _support.make_workspace("demo")
        client = vae_mcp_client(cwd=ws)
        tools = await client.get_tools()

        builder = StateGraph(MessagesState)
        builder.add_node("vaerion_tools", ToolNode(tools))
        builder.add_edge(START, "vaerion_tools")
        builder.add_edge("vaerion_tools", END)
        graph = builder.compile()

        result = await graph.ainvoke({
            "messages": [AIMessage(content="", tool_calls=[{
                "name": "vaerion_status",
                "args": {},
                "id": "call_vaerion_status",
                "type": "tool_call",
            }])],
        })
        tool_message = result["messages"][-1]
        self.assertEqual(tool_message.type, "tool")
        # Measured langgraph 1.x shape: ToolMessage.content is a list of content
        # blocks (str shape on older versions). Accept only content that really
        # carries the engine's --json payload.
        if isinstance(tool_message.content, str):
            self.assertIn('"command":"status"', tool_message.content)
        else:
            texts = [b.get("text", "") for b in tool_message.content if isinstance(b, dict)]
            self.assertTrue(any('"command":"status"' in t for t in texts), texts)


if __name__ == "__main__":
    unittest.main()
