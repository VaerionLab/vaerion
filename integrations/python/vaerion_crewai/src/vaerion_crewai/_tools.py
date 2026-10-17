"""Build a CrewAI MCPServerAdapter bound to `vae mcp`.

Measured against `crewai-tools` 1.15.23 (installed source,
`crewai_tools/adapters/mcp_adapter.py`):

    MCPServerAdapter(serverparams: StdioServerParameters | dict, *tool_names,
                     connect_timeout: int = 30)
    # SYNC context manager: __init__ already starts the MCP server; `with` yields
    # a ToolCollection of CrewAI BaseTool; `.stop()` exits it.
    # Each tool: BaseTool with .name / .description / .run(*args, **kwargs) -> Any.

Also measured: `mcpadapt` (the `mcp` extra machinery) is imported by
crewai-tools but NOT declared in its 1.15.23 metadata — this package declares
it so the adapter actually works (see README).
"""

from __future__ import annotations

import os
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from crewai_tools import MCPServerAdapter
from crewai_tools.adapters.tool_collection import ToolCollection
from mcp import StdioServerParameters

from ._command import resolve_vae_command

__all__ = ["vae_stdio_params", "vae_mcp_tools"]


def vae_stdio_params(
    cwd: str | None = None,
    *,
    command: list[str] | None = None,
    env: dict[str, str] | None = None,
) -> StdioServerParameters:
    """Build the stdio server parameters for `vae mcp`.

    Args:
        cwd: the Vaerion workspace the server serves. ``None`` inherits the
            current process cwd. One server process serves exactly ONE workspace.
        command: override the full spawn argv (default: the resolved vae
            command plus ``mcp`` — $VAE_BIN, PATH, or the repo bun fallback).
        env: environment for the spawned server. ``None`` = the MCP SDK's
            default environment subset.
    """
    argv = list(command) if command is not None else [*resolve_vae_command(), "mcp"]
    if not argv:
        raise ValueError("command must be a non-empty argv list")
    params = StdioServerParameters(command=argv[0], args=argv[1:], env=env if env is not None else dict(os.environ))
    if cwd is not None:
        params.cwd = cwd
    return params


@contextmanager
def vae_mcp_tools(
    cwd: str | None = None,
    *,
    command: list[str] | None = None,
    env: dict[str, str] | None = None,
    tool_names: tuple[str, ...] = (),
    connect_timeout: int = 30,
    **adapter_overrides: Any,
) -> Iterator[ToolCollection]:
    """Yield the six Vaerion tools as CrewAI BaseTool objects (sync context manager).

    Example::

        with vae_mcp_tools(cwd="/path/to/workspace") as tools:
            crew = Crew(agents=[...], tasks=[...], tools=list(tools))
            status = next(t for t in tools if t.name == "vaerion_status")
            print(status.run())          # a REAL brokered, journaled call
    """
    params = vae_stdio_params(cwd, command=command, env=env)
    names = tuple(tool_names)
    if names:
        with MCPServerAdapter(params, *names, connect_timeout=connect_timeout, **adapter_overrides) as tools:
            yield tools
    else:
        with MCPServerAdapter(params, connect_timeout=connect_timeout, **adapter_overrides) as tools:
            yield tools
