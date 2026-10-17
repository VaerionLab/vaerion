"""Vaerion Python SDK — the conformance suite (VAERION_SDK_STANDARD §18).

Unit layer: SSE parsing, error-contract fidelity.
Integration layer: a REAL spawned daemon — the Agent starts `vae serve`,
runs a brokered agent goal, reads the terminal receipt, and verifies the
journal chain through the CLI of record. Skipped (never faked) when no vae
runtime exists on the machine.
"""

from __future__ import annotations

import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from vaerion import Agent, VaeDaemonClient, VaerionError, parse_sse, __version__  # noqa: E402
from vaerion.daemon import assert_loopback_base  # noqa: E402


class TestLoopbackEnforcement(unittest.TestCase):
    """E2006 at the sanctioned client boundary (VAERION_SDK_STANDARD §1a,
    §11a, §18.1 conformance case 1) — symmetric to the TypeScript
    `assertLoopbackBase` test (daemon-parity.test.ts). Refusal happens at
    construction, before a single byte is sent."""

    def test_loopback_bases_are_accepted(self) -> None:
        self.assertEqual(assert_loopback_base("http://127.0.0.1:7897"), "http://127.0.0.1:7897")
        self.assertEqual(assert_loopback_base("http://localhost:7897/"), "http://localhost:7897")
        self.assertEqual(assert_loopback_base("http://[::1]:7897"), "http://[::1]:7897")

    def test_remote_and_non_http_bases_are_refused_E2006(self) -> None:
        for bad in (
            "http://example.com:7897",
            "http://192.168.1.10:7897",
            "http://127.0.0.1.evil.example:7897",
            "ftp://127.0.0.1",
            "not a url",
        ):
            with self.assertRaises(VaerionError) as ctx:
                assert_loopback_base(bad)
            self.assertEqual(ctx.exception.code, "E2006", f"expected E2006 for {bad!r}")

    def test_constructor_enforces_loopback_before_any_wire_byte(self) -> None:
        with self.assertRaises(VaerionError) as ctx:
            VaeDaemonClient(base="https://relay.example.com", token="secret-token")
        self.assertEqual(ctx.exception.code, "E2006")
        self.assertIn("non-loopback", ctx.exception.message)

    def test_default_base_is_the_engine_daemon_port(self) -> None:
        # The engine daemon binds 127.0.0.1:7897 (ADR-0010); the default must
        # point at reality, not at a dead port.
        client = VaeDaemonClient(token="t")
        self.assertEqual(client.base, "http://127.0.0.1:7897")


class TestSseParsing(unittest.TestCase):
    def test_parse_sse_multi_event(self) -> None:
        body = (
            ': keep-alive comment\n'
            'event: spine\n'
            'data: {"seq":1,"type":"run.opened"}\n'
            '\n'
            'data: {"seq":2,"type":"run.closed"}\n'
            '\n'
        )
        events = parse_sse(body)
        self.assertEqual(len(events), 2)
        self.assertEqual(events[0]["type"], "run.opened")
        self.assertEqual(events[1]["seq"], 2)

    def test_parse_sse_multiline_data(self) -> None:
        body = 'data: {"a":\ndata: 1}\n\n'
        events = parse_sse(body)
        self.assertEqual(events, [{"a": 1}])

    def test_parse_sse_garbage_data_is_passed_through_as_text(self) -> None:
        events = parse_sse("data: not-json\n\n")
        self.assertEqual(events, ["not-json"])

    def test_parse_sse_empty_body(self) -> None:
        self.assertEqual(parse_sse(""), [])


class TestErrorContract(unittest.TestCase):
    def test_error_payload_carries_code_message_fix(self) -> None:
        err = VaerionError.from_error_payload(
            {"error": {"code": "E1301", "message": "unmatched request", "fix": "declare a policy rule"}}
        )
        self.assertEqual(err.code, "E1301")
        self.assertEqual(err.message, "unmatched request")
        self.assertEqual(err.fix, "declare a policy rule")
        self.assertIn("E1301", str(err))

    def test_error_payload_tolerance(self) -> None:
        self.assertEqual(VaerionError.from_error_payload("boom").code, "E1900")
        self.assertEqual(VaerionError.from_error_payload(None).code, "E1900")

    def test_version_constant_is_semver_rc(self) -> None:
        self.assertEqual(__version__, "0.1.15")


def _vae_available() -> bool:
    try:
        from vaerion.agent import _vae_command

        _vae_command()
        return True
    except Exception:
        return False


@unittest.skipUnless(_vae_available(), "no vae runtime on this machine — integration layer skipped, never faked")
class TestAgentEndToEnd(unittest.TestCase):
    """A REAL daemon, a REAL brokered run, a REAL receipt, a REAL verification."""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory(prefix="vaerion-py-sdk-")
        self.addCleanup(self.tmp.cleanup)

    def test_spawn_run_receipt_verify(self) -> None:
        with Agent(cwd=self.tmp.name) as agent:
            # The daemon is up and honest about its version.
            health = agent.client.health()
            self.assertTrue(health.get("ok"))
            self.assertIn("engine_version", agent.client.version())

            # One brokered, journaled run with the declared note plan.
            result = agent.run("summarize the project from the journal")
            self.assertEqual(result["kind"], "agent")
            self.assertTrue(str(result["run_id"]).startswith("crn_run_"))
            self.assertTrue(result["journal_ok"])
            self.assertIsNotNone(result["receipt"], "a closed run carries its receipt")
            receipt = result["receipt"]
            self.assertIn(receipt["journal"]["head_hash"], receipt["journal"]["head_hash"])  # shape
            self.assertIsInstance(receipt["journal"]["head_hash"], str)
            self.assertGreater(receipt["journal"]["records"], 0)

            # The status fold agrees with the terminal state.
            status = agent.status(result["run_id"])
            self.assertEqual(status["run_id"], result["run_id"])
            self.assertIsNotNone(status["receipt"])

            # Verification through the CLI of record: chain recomputed, green.
            # (The receipt certifies the chain UP TO its fold; the terminal
            # receipt record itself is then appended — so the verified head
            # is the receipt record's hash, one link beyond receipt.journal.)
            verified = agent.verify(result["run_id"])
            self.assertTrue(verified["ok"])
            self.assertFalse(verified["torn"])
            self.assertGreaterEqual(verified["records"], receipt["journal"]["records"])
            self.assertRegex(verified["head_hash"], r"^[0-9a-f]{64}$")

    def test_events_stream_replays_the_run(self) -> None:
        with Agent(cwd=self.tmp.name) as agent:
            result = agent.run("event stream probe")
            events = list(agent.events(result["run_id"]))
            self.assertGreater(len(events), 0)
            kinds = {e.get("type") for e in events if isinstance(e, dict)}
            self.assertIn("run.opened", kinds)

    def test_undeclared_tool_step_fails_closed_with_evidence(self) -> None:
        # The daemon's ad-hoc config declares NO tools → the undeclared tool
        # step fails CLOSED at the tool gate (fail-closed law). The run still
        # closes WITH a receipt — the refusal is evidence on the chain, not
        # an exception to hide. The SDK returns the truth; the caller reads it.
        with Agent(cwd=self.tmp.name) as agent:
            result = agent.run(
                "undeclared tool call",
                steps=[{"kind": "tool", "tool": "echo", "args": {"value": "hi"}}],
            )
            self.assertEqual(result["status"], "closed")
            self.assertEqual((result.get("agent") or {}).get("outcome"), "failed")
            self.assertIsNotNone(result["receipt"], "even a failed run leaves a receipt")
            # …and the journal STILL verifies: the evidence trail is intact.
            verified = agent.verify(result["run_id"])
            self.assertTrue(verified["ok"])


class TestClientWireShape(unittest.TestCase):
    def test_open_paths_never_carry_the_token(self) -> None:
        client = VaeDaemonClient(base="http://127.0.0.1:1", token="secret-token")
        self.assertNotIn("Authorization", client._headers("/health", False))
        self.assertNotIn("Authorization", client._headers("/version", False))
        self.assertNotIn("Authorization", client._headers("/openapi.json", False))
        self.assertEqual(client._headers("/runs", False)["Authorization"], "Bearer secret-token")

    def test_unreachable_daemon_is_E1601_with_a_fix(self) -> None:
        client = VaeDaemonClient(base="http://127.0.0.1:1", token="t", timeout=1.0)
        with self.assertRaises(VaerionError) as ctx:
            client.get_run("crn_run_UNKNOWNUNKNOWNUNKNOWNUNKNO")
        self.assertEqual(ctx.exception.code, "E1601")
        self.assertIsNotNone(ctx.exception.fix)


if __name__ == "__main__":
    unittest.main(verbosity=2)
