"""REAL end-to-end tests: autogen-ext MCP tools against a spawned `vae mcp`.

Model-free where the law allows, model-substituted where it counts: the tool
adapters are driven directly (run_json) AND through a REAL AssistantAgent whose
model is the deterministic ReplayChatCompletionClient — the genuine AutoGen
agent loop executing a genuine Vaerion tool call with zero network. Every test
asserts REAL on-disk evidence (journal, receipt, refusal ledger, chain verify).
"""

from __future__ import annotations

import json
import unittest

from autogen_core import CancellationToken, FunctionCall
from autogen_core.models import CreateResult, RequestUsage
from autogen_ext.models.replay import ReplayChatCompletionClient
from autogen_agentchat.agents import AssistantAgent

from vaerion_autogen import VAERION_TOOL_NAMES, vae_mcp_tools, tool_text

import _support

_REPLAY_MODEL_INFO = {"family": "replay", "function_calling": True, "json_output": True, "vision": False}


class TestMcpToolsEndToEnd(unittest.IsolatedAsyncioTestCase):
    async def test_factory_returns_the_six_ratified_tool_adapters(self) -> None:
        ws = _support.make_workspace("demo")
        tools = await vae_mcp_tools(cwd=ws)
        self.assertEqual(sorted(t.name for t in tools), sorted(VAERION_TOOL_NAMES))
        self.assertTrue(all(t.description for t in tools))

    async def test_status_and_demo_runs_produce_journal_evidence(self) -> None:
        ws = _support.make_workspace("demo")
        tools = await vae_mcp_tools(cwd=ws)
        token = CancellationToken()

        status = next(t for t in tools if t.name == "vaerion_status")
        status_payload = json.loads(tool_text(status, await status.run_json({}, token)))
        self.assertEqual(status_payload["command"], "status")

        demo = next(t for t in tools if t.name == "vaerion_run_demo")
        run = json.loads(tool_text(demo, await demo.run_json({"query": "e2e from autogen"}, token)))
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
        tools = await vae_mcp_tools(cwd=ws)
        run_agent = next(t for t in tools if t.name == "vaerion_run_agent")
        out = await run_agent.run_json(
            {
                "goal": "echo without a grant",
                "steps": [{"kind": "tool", "tool": "echo", "args": {"value": "hi"}}],
            },
            CancellationToken(),
        )
        run = json.loads(tool_text(run_agent, out))
        self.assertEqual(run["outcome"], "failed")  # journaled evidence, not an exception
        self.assertTrue(run["receipt"]["journal"]["head_hash"])

        refusals = _support.refusal_records(ws)
        self.assertEqual(len(refusals), 1)
        self.assertEqual(refusals[0]["reason_code"], "E1301")
        self.assertEqual(refusals[0]["scope"], "echo")
        self.assertEqual(refusals[0]["run_id"], run["run_id"])
        self.assertTrue(_support.verify_json(ws)["ok"])

    async def test_real_assistant_agent_executes_a_vaerion_tool(self) -> None:
        # The genuine AutoGen agent loop: AssistantAgent decides on a tool call
        # (scripted by the deterministic ReplayChatCompletionClient — no network,
        # no API key) and EXECUTES it through the real MCP adapter + engine.
        ws = _support.make_workspace("demo")
        tools = await vae_mcp_tools(cwd=ws)
        client = ReplayChatCompletionClient(
            [
                CreateResult(
                    finish_reason="function_calls",
                    content=[FunctionCall(id="call_1", name="vaerion_status", arguments="{}")],
                    usage=RequestUsage(prompt_tokens=0, completion_tokens=0),
                    cached=False,
                ),
                "done",
            ],
            model_info=_REPLAY_MODEL_INFO,
        )
        agent = AssistantAgent(
            name="vaerion_verifier",  # AutoGen law: agent names are Python identifiers
            model_client=client,
            tools=tools,
            reflect_on_tool_use=True,
        )
        result = await agent.run(task="show the project status")

        executed = [m for m in result.messages if m.type == "ToolCallExecutionEvent"]
        self.assertEqual(len(executed), 1, "the agent must execute exactly one tool call")
        self.assertEqual(executed[0].content[0].name, "vaerion_status")
        # Measured shapes: FunctionExecutionResult.content is a JSON string of the
        # MCP content list; each block carries the CLI's --json payload as text.
        content_blocks = json.loads(executed[0].content[0].content)
        payload = json.loads(content_blocks[0]["text"])
        self.assertEqual(payload["command"], "status")
        self.assertEqual(payload["engine_version"], "0.1.15-rc1")


if __name__ == "__main__":
    unittest.main()
