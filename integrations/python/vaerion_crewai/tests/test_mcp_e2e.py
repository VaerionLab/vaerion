"""REAL end-to-end tests: CrewAI MCPServerAdapter against a spawned `vae mcp`.

Model-free by design (the honesty law): no LLM anywhere. The tests connect the
REAL adapter, assert the six ratified tools, invoke them for real (CrewAI
BaseTool.run — the exact objects a Crew(agents=…, tools=…) would execute), and
assert REAL on-disk evidence (journal, receipt, refusal ledger, chain verify).
"""

from __future__ import annotations

import unittest

from crewai.tools import BaseTool
from crewai_tools.adapters.tool_collection import ToolCollection

from vaerion_crewai import VAERION_TOOL_NAMES, vae_mcp_tools

import _support


class TestCrewaiAdapterEndToEnd(unittest.TestCase):
    def test_adapter_connects_and_yields_the_six_ratified_tools(self) -> None:
        ws = _support.make_workspace("demo")
        with vae_mcp_tools(cwd=ws) as tools:
            self.assertIsInstance(tools, ToolCollection)
            self.assertEqual(sorted(t.name for t in tools), sorted(VAERION_TOOL_NAMES))
            for tool in tools:
                self.assertIsInstance(tool, BaseTool)
                self.assertTrue(tool.description)

    def test_status_and_demo_runs_produce_journal_evidence(self) -> None:
        ws = _support.make_workspace("demo")
        with vae_mcp_tools(cwd=ws) as tools:
            status = next(t for t in tools if t.name == "vaerion_status")
            status_payload = _support.tool_text_payload(status.run())
            self.assertEqual(status_payload["command"], "status")

            demo = next(t for t in tools if t.name == "vaerion_run_demo")
            run = _support.tool_text_payload(demo.run(query="e2e from crewai"))
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

    def test_tool_name_filtering_scopes_the_surface(self) -> None:
        ws = _support.make_workspace("demo")
        with vae_mcp_tools(cwd=ws, tool_names=("vaerion_status",)) as tools:
            names = [t.name for t in tools]
            self.assertEqual(names, ["vaerion_status"])

    def test_policy_deny_closes_the_run_and_lands_in_the_refusal_ledger(self) -> None:
        # The `agent` template ships no echo grant: the broker fails closed (E1301).
        ws = _support.make_workspace("agent")
        with vae_mcp_tools(cwd=ws) as tools:
            run_agent = next(t for t in tools if t.name == "vaerion_run_agent")
            run = _support.tool_text_payload(run_agent.run(
                goal="echo without a grant",
                steps=[{"kind": "tool", "tool": "echo", "args": {"value": "hi"}}],
            ))
            self.assertEqual(run["outcome"], "failed")  # journaled evidence, not an exception
            self.assertTrue(run["receipt"]["journal"]["head_hash"])

        refusals = _support.refusal_records(ws)
        self.assertEqual(len(refusals), 1)
        self.assertEqual(refusals[0]["reason_code"], "E1301")
        self.assertEqual(refusals[0]["scope"], "echo")
        self.assertEqual(refusals[0]["run_id"], run["run_id"])
        self.assertTrue(_support.verify_json(ws)["ok"])


if __name__ == "__main__":
    unittest.main()
