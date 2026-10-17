"""REAL end-to-end tests: the Agents SDK MCP layer against a spawned `vae mcp`.

Model-free by design (the honesty law): the Agents SDK's agent LOOP needs a
model, but the MCP layer under it does not. These tests drive the exact layer
an agent would use — MCPServerStdio.connect / list_tools / call_tool — against
a REAL spawned server in REAL temp workspaces and assert REAL on-disk evidence
(journal, receipt, refusal ledger, chain verification).
"""

from __future__ import annotations

import asyncio
import unittest

from vaerion_openai_agents import VAERION_TOOL_NAMES, vae_mcp_server

import _support


class TestMcpServerEndToEnd(unittest.IsolatedAsyncioTestCase):
    async def test_connect_lists_the_six_ratified_tools_and_runs_a_real_demo(self) -> None:
        ws = _support.make_workspace("demo")
        server = vae_mcp_server(cwd=ws)
        await server.connect()
        try:
            tools = await server.list_tools()
            self.assertEqual([t.name for t in tools], list(VAERION_TOOL_NAMES))
            self.assertTrue(all(t.description for t in tools))

            # Read-only surface, no model involved:
            status = await server.call_tool("vaerion_status", {})
            self.assertFalse(status.isError)
            status_payload = _support.parse_tool_text(status)
            self.assertEqual(status_payload["command"], "status")

            # A REAL brokered run through the MCP layer:
            demo = await server.call_tool("vaerion_run_demo", {"query": "e2e from openai-agents"})
            self.assertFalse(demo.isError)
            run = _support.parse_tool_text(demo)
            self.assertTrue(run["run_id"].startswith("crn_run_"))
            receipt = run["receipt"]
            self.assertEqual(receipt["journal"]["records"], receipt["counts"]["records"])
            self.assertTrue(run["journal_verified"])
            self.assertEqual(len(receipt["journal"]["head_hash"]), 64)
        finally:
            await server.cleanup()

        # REAL evidence on disk — the journal exists and the CLI of record verifies it.
        journals = _support.journal_files(ws)
        self.assertEqual(len(journals), 1)
        self.assertEqual(journals[0].stem, run["run_id"])
        verify = _support.verify_json(ws)
        self.assertEqual(verify["run_id"], run["run_id"])
        self.assertEqual(verify["verdict"], "VERIFIED")

    async def test_policy_deny_closes_the_run_and_lands_in_the_refusal_ledger(self) -> None:
        # The `agent` template ships no echo grant: the broker fails closed (E1301).
        ws = _support.make_workspace("agent")
        server = vae_mcp_server(cwd=ws)
        await server.connect()
        try:
            result = await server.call_tool("vaerion_run_agent", {
                "goal": "echo without a grant",
                "steps": [{"kind": "tool", "tool": "echo", "args": {"value": "hi"}}],
            })
            # Exit-code law: a denied step is journaled EVIDENCE, not a protocol error —
            # the run closes with a receipt (exit 0), so isError stays False.
            self.assertFalse(result.isError)
            run = _support.parse_tool_text(result)
            self.assertEqual(run["outcome"], "failed")
            self.assertTrue(run["receipt"]["journal"]["head_hash"])
        finally:
            await server.cleanup()

        refusals = _support.refusal_records(ws)
        self.assertEqual(len(refusals), 1)
        refusal = refusals[0]
        self.assertEqual(refusal["reason_code"], "E1301")
        self.assertEqual(refusal["domain"], "tool.call")
        self.assertEqual(refusal["scope"], "echo")
        self.assertEqual(refusal["run_id"], run["run_id"])
        # The chain still verifies AFTER the refusal.
        self.assertTrue(_support.verify_json(ws)["ok"])

    async def test_default_cwd_inherits_the_process_workspace(self) -> None:
        # cwd=None inherits the process cwd (documented law); run it IN a workspace.
        ws = _support.make_workspace("minimal")
        server = vae_mcp_server()  # no cwd — resolves to the process cwd
        import os
        old = os.getcwd()
        os.chdir(ws)
        try:
            await server.connect()
            status = await server.call_tool("vaerion_status", {})
            await server.cleanup()
        finally:
            os.chdir(old)
        payload = _support.parse_tool_text(status)
        self.assertEqual(payload["workspace"]["state"], "workspace")


if __name__ == "__main__":
    unittest.main()
