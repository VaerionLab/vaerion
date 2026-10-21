"""Agent — the five-line Vaerion experience in Python.

    from vaerion import Agent

    with Agent() as agent:
        result = agent.run("summarize the project")     # brokered + journaled
        print(result["receipt"]["journal"]["head_hash"])  # integrity commitment
        print(agent.verify(result["run_id"]))            # chain recomputation

By default Agent SPAWNS its own `vae serve` daemon on a free loopback port
(VAE_TRUST pre-provisions the pairing token — the secret is never printed)
and stops it on close. Pass base/token to attach to a daemon you run
yourself. verify() executes the CLI of record against the journal bytes on
disk — verification trusts bytes, not processes.
"""

from __future__ import annotations

import json
import os
import secrets
import shutil
import socket
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path
from types import TracebackType
from typing import Any, Dict, List, Optional, Tuple

from .daemon import VaeDaemonClient
from .errors import VaerionError

__all__ = ["Agent"]

DEFAULT_PLAN_NOTE = "declared goal executed on the journal"


def _vae_command() -> List[str]:
    """Resolve the `vae` CLI: $VAE_BIN, PATH, or the repo layout (dev checkouts)."""
    env_bin = os.environ.get("VAE_BIN")
    if env_bin:
        return env_bin.split()
    which = shutil.which("vae")
    if which:
        return [which]
    repo_vae = Path(__file__).resolve().parents[4] / "packages" / "vaerion" / "src" / "cli" / "vae.ts"
    if repo_vae.exists() and shutil.which("bun"):
        return ["bun", "run", str(repo_vae)]
    raise VaerionError(
        "E1601",
        "cannot find the vae CLI (looked at $VAE_BIN, PATH, and the repo layout)",
        fix="install it: npm install -g vaerion — or set VAE_BIN to the command that runs vae",
    )


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


class Agent:
    """A verified agent: run goals against the brokered loop, read receipts."""

    def __init__(self, base: Optional[str] = None, token: Optional[str] = None,
                 cwd: Optional[str] = None, serve_timeout: float = 20.0) -> None:
        self.cwd = os.path.abspath(cwd or os.getcwd())
        self._proc: Optional[subprocess.Popen[Any]] = None
        if base is not None:
            self.client = VaeDaemonClient(base=base, token=token)
        else:
            self._proc, self.client = self._spawn_daemon(serve_timeout)

    # ── lifecycle ─────────────────────────────────────────────────────────

    def _spawn_daemon(self, serve_timeout: float) -> Tuple[subprocess.Popen[Any], VaeDaemonClient]:
        cmd = _vae_command()
        port = _free_port()
        token = secrets.token_urlsafe(24)
        env = {**os.environ, "VAE_TRUST": token}
        proc = subprocess.Popen(
            [*cmd, "serve", "--port", str(port), "--host", "127.0.0.1"],
            cwd=self.cwd, env=env,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        base = f"http://127.0.0.1:{port}"
        client = VaeDaemonClient(base=base, token=token)
        deadline = time.monotonic() + serve_timeout
        while time.monotonic() < deadline:
            if proc.poll() is not None:
                raise VaerionError("E1601", "the spawned vae serve process exited before becoming healthy",
                                   fix="run `vae serve` manually to see the startup error")
            try:
                health = client.health()
                if health.get("ok"):
                    return proc, client
            except VaerionError:
                time.sleep(0.15)
        proc.terminate()
        raise VaerionError("E1601", f"the daemon did not become healthy within {serve_timeout}s",
                           fix="check that port allocation is allowed and no security software blocks loopback")

    def close(self) -> None:
        """Stop a daemon this Agent spawned (a no-op for attached daemons)."""
        proc = self._proc
        if proc is None:
            return
        self._proc = None
        try:
            self.client.shutdown()
        except Exception:
            pass
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()

    def __enter__(self) -> "Agent":
        return self

    def __exit__(self, exc_type: Optional[type], exc: Optional[BaseException],
                 tb: Optional[TracebackType]) -> None:
        self.close()

    # ── the run surface ───────────────────────────────────────────────────

    def run(self, goal: str, steps: Optional[List[Dict[str, Any]]] = None,
            planner: str = "inline", max_steps: Optional[int] = None,
            timeout: float = 120.0) -> Dict[str, Any]:
        """One brokered, journaled agent run; returns the final status view
        (receipt present once closed). Inline planning is DECLARED: with no
        `steps`, the honest default is a single journaled note step —
        deterministic, no model calls, no fake intelligence. Pass `steps` to
        script tool or note steps, or planner="model" with a configured
        provider. A failed step does NOT raise — the run closes with a
        receipt and the agent fold carries outcome="failed" (evidence, not
        an exception)."""
        if planner == "inline" and steps is None:
            steps = [{"kind": "note", "text": f"goal: {goal}"}]
        run_id, _ = self.client.start_agent_run(goal, steps=steps, planner=planner, max_steps=max_steps)
        return self.client.wait_for_run(run_id, timeout=timeout)

    def workflow(self, dag: Dict[str, Any], timeout: float = 120.0) -> Dict[str, Any]:
        """One deterministic workflow DAG run on the journal."""
        run_id, _ = self.client.start_workflow_run(dag)
        return self.client.wait_for_run(run_id, timeout=timeout)

    def events(self, run_id: str) -> Any:
        """The live SSE event stream for a run (JSON payloads)."""
        return self.client.events(run_id)

    def status(self, run_id: str) -> Dict[str, Any]:
        """The folded status view without waiting."""
        return self.client.get_run(run_id)

    # ── verification ──────────────────────────────────────────────────────

    def verify(self, run_id: Optional[str] = None, timeout: float = 60.0) -> Dict[str, Any]:
        """Journal verification through the CLI of record: the FULL blake3
        chain recomputed from the bytes on disk. `vae verify` (latest) by
        default; pass run_id to verify a specific run. Exit 5 (failed chain)
        raises VaerionError carrying the report."""
        args = ["journal", "verify", run_id] if run_id else ["verify"]
        proc = subprocess.run(
            [*_vae_command(), *args, "--json"],
            cwd=self.cwd, capture_output=True, text=True, timeout=timeout,
        )
        payload: Dict[str, Any] = {}
        for line in proc.stdout.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                payload = json.loads(line)
            except json.JSONDecodeError:
                continue
        if not payload:
            raise VaerionError("E1900", f"verification produced no machine output (exit {proc.returncode})",
                               detail=proc.stderr[-500:] if proc.stderr else None)
        if proc.returncode != 0:
            raise VaerionError("E1001", "journal verification FAILED — see the report payload",
                               fix="vae journal recover <run_id>", detail=payload)
        # Normalize the two faces (`vae verify` is flat; `vae journal verify`
        # wraps a VerifyReport under `report` with camelCase headHash) into
        # ONE honest dict.
        report = payload.get("report") if isinstance(payload.get("report"), dict) else payload
        return {
            "run_id": payload.get("run_id") or report.get("run_id"),
            "ok": bool(report.get("ok")),
            "torn": bool(report.get("torn")),
            "records": report.get("records"),
            "events": report.get("events"),
            "head_hash": report.get("headHash") or report.get("head_hash"),
            "issues": report.get("issues", []),
        }
