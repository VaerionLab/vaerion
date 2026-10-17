#!/usr/bin/env python3
"""demo_stdio.py — a REAL end-to-end MCP client demo against `vae mcp`.

Zero dependencies beyond Python 3.10 stdlib. It speaks the wire protocol
itself (newline-delimited JSON-RPC 2.0, protocol 2024-11-05) so you can see
EXACTLY what any MCP host does when it attaches Vaerion:

  1. resolve the vae command            ($VAE_BIN -> PATH `vae` -> repo `bun run` fallback)
  2. create a fresh temp workspace      (vae init --template demo)
  3. spawn `vae mcp` in that workspace
  4. perform the initialize handshake   -> serverInfo + instructions
  5. tools/list                         -> the 6 ratified tools
  6. tools/call vaerion_status          -> read-only dashboard (real output)
  7. tools/call vaerion_run_demo        -> brokered, journaled, receipt-backed run
  8. `vae verify` (CLI of record)       -> full blake3 chain recomputation, exit 0

Run it:

    python3 demo_stdio.py            # or: /path/to/python demo_stdio.py

Exit 0 = every stage verified. Exit 1 = something failed (the script prints why).
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT_CANDIDATES = 8


def resolve_vae_command() -> list[str]:
    """Mirror the official Python SDK resolution law (sdks/python Agent._vae_command):
    $VAE_BIN, then PATH, then the repo checkout via bun (dev installations)."""
    env_bin = os.environ.get("VAE_BIN")
    if env_bin:
        return env_bin.split()
    which = shutil.which("vae")
    if which:
        return [which]
    here = Path(__file__).resolve().parent
    for parent in [here, *here.parents[:REPO_ROOT_CANDIDATES]]:
        candidate = parent / "packages" / "vaerion" / "src" / "cli" / "vae.ts"
        if candidate.exists() and shutil.which("bun"):
            return ["bun", "run", str(candidate)]
    raise SystemExit(
        "cannot find the vae CLI (looked at $VAE_BIN, PATH, and the repo layout) — "
        "install it (npm install -g vaerion@rc) or set VAE_BIN"
    )


class McpClient:
    """Minimal newline-delimited JSON-RPC 2.0 client over a spawned process."""

    def __init__(self, argv: list[str], cwd: str) -> None:
        self.proc = subprocess.Popen(
            argv,
            cwd=cwd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=sys.stderr,  # Vaerion logs diagnostics on stderr ONLY
            text=True,
            bufsize=1,
        )
        self._next_id = 0

    def call(self, method: str, params: dict | None = None) -> dict:
        self._next_id += 1
        msg = {"jsonrpc": "2.0", "id": self._next_id, "method": method}
        if params is not None:
            msg["params"] = params
        assert self.proc.stdin is not None
        self.proc.stdin.write(json.dumps(msg) + "\n")
        self.proc.stdin.flush()
        assert self.proc.stdout is not None
        line = self.proc.stdout.readline()
        if not line:
            raise RuntimeError(f"server closed the stream during {method}")
        resp = json.loads(line)
        if "error" in resp:
            raise RuntimeError(f"{method} -> protocol error {resp['error']}")
        return resp["result"]

    def notify(self, method: str) -> None:
        assert self.proc.stdin is not None
        self.proc.stdin.write(json.dumps({"jsonrpc": "2.0", "method": method}) + "\n")
        self.proc.stdin.flush()

    def close(self) -> int:
        try:
            assert self.proc.stdin is not None
            self.proc.stdin.close()  # EOF — the server exits 0 by law
        except BrokenPipeError:
            pass
        return self.proc.wait(timeout=30)


def main() -> int:
    vae = resolve_vae_command()
    print(f"[1] vae command resolved: {' '.join(vae)}")

    workspace = tempfile.mkdtemp(prefix="vaerion-mcp-demo-")
    print(f"[2] temp workspace: {workspace}")
    subprocess.run(
        [*vae, "init", "--template", "demo"],
        cwd=workspace, check=True, capture_output=True, text=True,
    )

    print("[3] spawning `vae mcp` (stdio, JSON-RPC 2.0, protocol 2024-11-05)")
    client = McpClient([*vae, "mcp"], cwd=workspace)

    init = client.call("initialize", {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "vaerion-demo-stdio", "version": "0.1.15"},
    })
    client.notify("notifications/initialized")
    print("[4] initialize ->")
    print(json.dumps(init, indent=2))

    tools = client.call("tools/list")
    names = [t["name"] for t in tools["tools"]]
    print(f"[5] tools/list -> {len(names)} tools: {', '.join(names)}")
    assert names == [
        "vaerion_doctor", "vaerion_status", "vaerion_journal_ls",
        "vaerion_verify_journal", "vaerion_run_demo", "vaerion_run_agent",
    ], f"unexpected tool surface: {names}"

    status = client.call("tools/call", {"name": "vaerion_status", "arguments": {}})
    print("[6] tools/call vaerion_status -> isError:", status["isError"])
    print(status["content"][0]["text"])

    demo = client.call("tools/call", {
        "name": "vaerion_run_demo",
        "arguments": {"query": "prove the MCP path end to end"},
    })
    print("[7] tools/call vaerion_run_demo -> isError:", demo["isError"])
    run = json.loads(demo["content"][0]["text"])
    print(json.dumps(run, indent=2)[:1600])

    print("[8] vae verify (CLI of record — chain recomputed from disk bytes)")
    verify = subprocess.run(
        [*vae, "verify", "--json"],
        cwd=workspace, capture_output=True, text=True, check=False,
    )
    print(verify.stdout.strip())

    code = client.close()
    print(f"[9] server exited with code {code} after EOF (law: exit 0)")
    ok = (
        code == 0 and verify.returncode == 0 and not status["isError"] and not demo["isError"]
        and run.get("receipt", {}).get("journal", {}).get("head_hash")
    )
    print("DEMO", "OK" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
