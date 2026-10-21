"""The vae-command resolution law — mirrors `sdks/python/src/vaerion/agent.py`.

Resolution order (identical to the official Python SDK):
  1. ``$VAE_BIN``  — a full command line, whitespace-split,
  2. ``vae`` on ``PATH``,
  3. the repo layout of a dev checkout: ``<repo>/packages/vaerion/src/cli/vae.ts``
     executed via ``bun run`` (the engine runs on bun).
"""

from __future__ import annotations

import os
import shutil
from pathlib import Path

__all__ = ["resolve_vae_command", "VaerionCommandError", "VAERION_TOOL_NAMES"]

#: The ratified MCP tool surface of `vae mcp` (measured, engine 0.1.15).
VAERION_TOOL_NAMES = (
    "vaerion_doctor",
    "vaerion_status",
    "vaerion_journal_ls",
    "vaerion_verify_journal",
    "vaerion_run_demo",
    "vaerion_run_agent",
)

_VAE_TS_RELATIVE = Path("packages") / "vaerion" / "src" / "cli" / "vae.ts"
_REPO_SEARCH_DEPTH = 8


class VaerionCommandError(RuntimeError):
    """E1601-class failure: the ``vae`` CLI could not be resolved."""

    code = "E1601"

    def __init__(self, message: str, *, fix: str) -> None:
        super().__init__(f"{message} (fix: {fix})")
        self.fix = fix


def resolve_vae_command() -> list[str]:
    """Resolve the ``vae`` CLI as an argv list ($VAE_BIN -> PATH -> repo bun fallback)."""
    env_bin = os.environ.get("VAE_BIN")
    if env_bin:
        return env_bin.split()
    which = shutil.which("vae")
    if which:
        return [which]
    here = Path(__file__).resolve()
    for parent in here.parents[:_REPO_SEARCH_DEPTH]:
        candidate = parent / _VAE_TS_RELATIVE
        if candidate.exists():
            if shutil.which("bun"):
                return ["bun", "run", str(candidate)]
            break
    raise VaerionCommandError(
        "cannot find the vae CLI (looked at $VAE_BIN, PATH, and the repo layout)",
        fix="install it: npm install -g vaerion — or set VAE_BIN to the command that runs vae",
    )
