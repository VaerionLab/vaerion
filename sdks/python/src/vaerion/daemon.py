"""VaeDaemonClient — the wire client for the local Vaerion daemon.

The daemon (`vae serve`) is loopback-only with a first-run pairing token
(ADR-0010). This client speaks exactly the published contract
(``/openapi.json``):

    GET  /health, /version, /openapi.json   (open metadata routes)
    POST /runs                              start an agent|workflow run
    GET  /runs/{id}                         folded status + terminal receipt
    GET  /runs/{id}/events                  SSE event stream (cursor replay)
    POST /runs/{id}/answer                  resolve a durable human gate
    POST /shutdown                          token-echo guarded shutdown

Auth: ``Authorization: Bearer <token>`` on every route except the metadata
trio. Loopback is enforced IN CODE (E2006): a base whose host is not
127.0.0.1, localhost, or ::1 is refused at construction — before a single
byte is sent, symmetric to the TypeScript/Go/Rust/Java SDKs and the
VAERION_SDK_STANDARD §1a/§11a/§18.1 conformance case 1. Remote attachment
waits for a ratified transport-security ADR. Errors arrive as
``{"error": {code, message, fix}}`` — raised as VaerionError with the
E-code intact. Standard library only: no dependencies, no vendor lock,
no telemetry.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Iterable, Iterator, List, Optional, Tuple

from .errors import VaerionError
from .sse import iter_sse

__all__ = ["VaeDaemonClient", "assert_loopback_base"]

OPEN_PATHS = ("/health", "/version", "/openapi.json")

# The sanctioned client egress site is loopback-only, symmetric to the
# gateway's single sanctioned egress (ADR-0019). urlsplit().hostname strips
# the brackets from `[::1]`, so the bare form is what we compare.
_LOOPBACK_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})


def assert_loopback_base(base: str) -> str:
    """Refuse (E2006) any daemon base that is not a loopback http(s) URL.

    Runs at construction — before a single byte is sent. Mirrors the
    TypeScript `assertLoopbackBase` (sdks/typescript/src/daemon-transport.ts)
    byte-for-byte in semantics: parse, scheme check, loopback check.
    """
    try:
        url = urllib.parse.urlsplit(base)
    except ValueError:
        raise VaerionError("E2006", f"daemon base is not a valid URL: {base}") from None
    if url.scheme not in ("http", "https"):
        raise VaerionError(
            "E2006", f"daemon base must use http/https, got: {url.scheme or '(none)'}"
        )
    host = (url.hostname or "").lower()
    if not host or host not in _LOOPBACK_HOSTS:
        raise VaerionError(
            "E2006",
            f"refusing to attach to non-loopback daemon ({host or url.netloc}): "
            "remote attachment requires a ratified transport-security ADR",
            fix="use a loopback base such as http://127.0.0.1:7897 — start the daemon with `vae serve`",
        )
    return base.rstrip("/")


class VaeDaemonClient:
    """Thin, honest client over the daemon wire. Nothing is invented here:
    every route maps 1:1 to the daemon's published OpenAPI surface."""

    def __init__(self, base: str = "http://127.0.0.1:7897", token: Optional[str] = None,
                 timeout: float = 30.0) -> None:
        # E2006 at the boundary: non-loopback bases never reach the wire.
        self.base = assert_loopback_base(base)
        self.token = token
        self.timeout = timeout

    # ── transport ─────────────────────────────────────────────────────────

    def _headers(self, path: str, with_body: bool) -> Dict[str, str]:
        headers: Dict[str, str] = {"Accept": "application/json"}
        if with_body:
            headers["Content-Type"] = "application/json"
        if self.token and path not in OPEN_PATHS:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _request(self, method: str, path: str, body: Optional[Dict[str, Any]] = None) -> Any:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(
            f"{self.base}{path}", data=data, method=method,
            headers=self._headers(path, body is not None),
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8", errors="replace")
            try:
                raise VaerionError.from_error_payload(json.loads(raw)) from None
            except (json.JSONDecodeError, ValueError):
                raise VaerionError("E1900", f"daemon returned HTTP {e.code} with an unreadable body") from None
        except urllib.error.URLError as e:
            raise VaerionError("E1601", f"cannot reach the daemon at {self.base}: {e.reason}",
                               fix="start it with `vae serve` (loopback only) and pass the pairing token") from None

    def _stream(self, path: str) -> Iterator[str]:
        req = urllib.request.Request(f"{self.base}{path}", headers=self._headers(path, False))
        try:
            resp = urllib.request.urlopen(req, timeout=self.timeout)
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8", errors="replace")
            try:
                raise VaerionError.from_error_payload(json.loads(raw)) from None
            except (json.JSONDecodeError, ValueError):
                raise VaerionError("E1900", f"daemon returned HTTP {e.code} on {path}") from None
        with resp:
            for raw_line in resp:
                yield raw_line.decode("utf-8", errors="replace").rstrip("\n")

    # ── metadata (open routes) ────────────────────────────────────────────

    def health(self) -> Dict[str, Any]:
        """Liveness probe: ok, engine version, daemon uptime (no token)."""
        return self._request("GET", "/health")

    def version(self) -> Dict[str, Any]:
        """The engine version of record (no token)."""
        return self._request("GET", "/version")

    def openapi(self) -> Dict[str, Any]:
        """The generated OpenAPI contract — every route, described."""
        return self._request("GET", "/openapi.json")

    # ── runs ──────────────────────────────────────────────────────────────

    def start_agent_run(self, goal: str, steps: Optional[List[Dict[str, Any]]] = None,
                        planner: str = "inline", max_steps: Optional[int] = None) -> Tuple[str, Dict[str, Any]]:
        """Start the supervised agent loop (background, serial per workspace).
        Returns (run_id, started_payload); poll get_run or stream events."""
        body: Dict[str, Any] = {"kind": "agent", "goal": goal, "planner": planner}
        if steps is not None:
            body["steps"] = steps
        if max_steps is not None:
            body["max_steps"] = max_steps
        started = self._request("POST", "/runs", body)
        run_id = str(started.get("run_id", ""))
        if not run_id:
            raise VaerionError("E1900", "daemon accepted the run but returned no run_id")
        return run_id, started

    def start_workflow_run(self, dag: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """Start a deterministic workflow DAG execution (background)."""
        started = self._request("POST", "/runs", {"kind": "workflow", "dag": dag})
        run_id = str(started.get("run_id", ""))
        if not run_id:
            raise VaerionError("E1900", "daemon accepted the run but returned no run_id")
        return run_id, started

    def get_run(self, run_id: str) -> Dict[str, Any]:
        """Folded status: verification result, decisions, gates, receipt when closed."""
        return self._request("GET", f"/runs/{run_id}")

    def events(self, run_id: str) -> Iterator[Dict[str, Any]]:
        """The run's SSE event stream (JSON data payloads, cursor replay)."""
        return (p for p in iter_sse(self._stream(f"/runs/{run_id}/events")) if isinstance(p, dict))

    def answer_gate(self, run_id: str, gate_id: str, answer: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Human authority over a paused run — the durable gate resolution."""
        body: Dict[str, Any] = {"gate_id": gate_id}
        if answer is not None:
            body["answer"] = answer
        return self._request("POST", f"/runs/{run_id}/answer", body)

    def wait_for_run(self, run_id: str, poll_seconds: float = 0.1,
                     timeout: float = 120.0) -> Dict[str, Any]:
        """Poll get_run until the run closes. Terminal = a receipt exists or
        the status leaves ``open``. The final status view is returned."""
        deadline = time.monotonic() + timeout
        last: Dict[str, Any] = {}
        while time.monotonic() < deadline:
            last = self.get_run(run_id)
            if last.get("receipt") is not None or last.get("status") not in (None, "open"):
                return last
            time.sleep(poll_seconds)
        raise VaerionError("E1602", f"run {run_id} did not close within {timeout}s",
                           fix="inspect GET /runs/{id} and GET /runs/{id}/events for where it is paused")

    def shutdown(self) -> None:
        """Graceful daemon stop (token-echo guarded)."""
        if not self.token:
            raise VaerionError("E2000", "shutdown requires the pairing token (echo guard)")
        self._request("POST", "/shutdown", {"token": self.token})
