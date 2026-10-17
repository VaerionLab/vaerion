"""REAL-workspace support for the Vaerion integration tests.

Nothing here mocks the engine: every helper shells out to the REAL `vae` CLI
in REAL temp workspaces, mirroring the honesty law of the main repository.
"""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from vaerion_crewai import resolve_vae_command

_VAE = resolve_vae_command()


def make_workspace(template: str = "minimal") -> str:
    """Create a fresh temp workspace with `vae init --template <template>`."""
    ws = tempfile.mkdtemp(prefix=f"vaerion-crewai-test-{template}-")
    subprocess.run(
        [*_VAE, "init", "--template", template],
        cwd=ws, check=True, capture_output=True, text=True,
    )
    return ws


def vae(args: list[str], ws: str) -> subprocess.CompletedProcess[str]:
    """Run a real `vae` command in a workspace."""
    return subprocess.run(
        [*_VAE, *args, "--json"],
        cwd=ws, capture_output=True, text=True, check=False,
    )


def verify_json(ws: str) -> dict[str, Any]:
    """`vae verify --json` — the CLI of record; asserts the chain verified green."""
    proc = vae(["verify"], ws)
    payload = parse_last_json(proc.stdout)
    assert proc.returncode == 0, f"verify failed: {payload} stderr={proc.stderr[-400:]}"
    assert payload.get("ok") is True, f"verify reported a broken chain: {payload}"
    return payload


def parse_last_json(text: str) -> dict[str, Any]:
    """Parse the last NDJSON line of a `--json` CLI output."""
    for line in reversed(text.splitlines()):
        line = line.strip()
        if line:
            return json.loads(line)
    raise AssertionError("no JSON line found in output")


def tool_text_payload(tool_output: Any) -> dict[str, Any]:
    """Parse the JSON payload a Vaerion tool returns through CrewAI.

    CrewAI BaseTool.run returns whatever the adapted MCP callable returns —
    measured: the raw CLI --json NDJSON string.
    """
    if isinstance(tool_output, str):
        return json.loads(tool_output)
    return json.loads(str(tool_output))


def journal_files(ws: str) -> list[Path]:
    """Every run journal in the workspace (real bytes on disk)."""
    journal_dir = Path(ws) / ".vaerion" / "journal"
    return sorted(journal_dir.glob("crn_run_*.ndjson"))


def refusal_records(ws: str) -> list[dict[str, Any]]:
    """Parse the chained refusal ledger (`.vaerion/refusals.log`)."""
    log = Path(ws) / ".vaerion" / "refusals.log"
    assert log.exists(), "the broker must refuse nothing silently — refusals.log missing"
    return [json.loads(line) for line in log.read_text().splitlines() if line.strip()]
