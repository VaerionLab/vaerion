"""Build an OpenAI Agents SDK MCP server pointed at `vae mcp`.

Measured against `openai-agents` 0.20.0 (installed source, `agents/mcp/server.py`):

    MCPServerStdio(
        params: MCPServerStdioParams,     # {command, args, env?, cwd?, encoding?…}
        cache_tools_list: bool = False,
        name: str | None = None,
        client_session_timeout_seconds: float | None = 5,
        …
    )

Lifecycle (all async): ``await server.connect()`` → ``await server.list_tools()``
→ ``await server.call_tool(name, arguments)`` → ``await server.cleanup()``.
When the server object is attached to an ``Agent`` the SDK manages the
lifecycle for you; this helper only BUILDS the server.
"""

from __future__ import annotations

from typing import Any

from agents.mcp import MCPServerStdio

from ._command import resolve_vae_command

__all__ = ["vae_mcp_server"]


def vae_mcp_server(
    cwd: str | None = None,
    *,
    command: list[str] | None = None,
    timeout_seconds: float = 30.0,
    **stdio_overrides: Any,
) -> MCPServerStdio:
    """Return an ``MCPServerStdio`` bound to the in-engine `vae mcp` server.

    Args:
        cwd: the Vaerion workspace the server serves. ``None`` inherits the
            current process cwd. One server process serves exactly ONE workspace.
        command: override the full spawn argv (default: the resolved vae
            command plus ``mcp`` — $VAE_BIN, PATH, or the repo bun fallback).
        timeout_seconds: per-request MCP client timeout (the engine's first
            run takes well under a second, but hosts on cold machines get headroom).
        **stdio_overrides: extra ``MCPServerStdioParams`` keys (``env``, ``encoding``…)
            and/or ``MCPServerStdio`` constructor kwargs such as ``cache_tools_list``.
            ``env=None`` means the SDK's default environment subset.

    Example::

        from vaerion_openai_agents import vae_mcp_server

        server = vae_mcp_server(cwd="/path/to/workspace")
        await server.connect()                       # or attach to an Agent
        tools = await server.list_tools()            # the 6 ratified tools
        result = await server.call_tool("vaerion_run_demo", {"query": "hi"})
        await server.cleanup()
    """
    argv = list(command) if command is not None else [*resolve_vae_command(), "mcp"]
    if not argv:
        raise ValueError("command must be a non-empty argv list")
    params: dict[str, Any] = {"command": argv[0], "args": argv[1:]}
    if cwd is not None:
        params["cwd"] = cwd
    constructor_kwargs: dict[str, Any] = {"client_session_timeout_seconds": timeout_seconds}
    reserved = {"command", "args", "cwd", "transport"}
    for key, value in stdio_overrides.items():
        if key in reserved:
            params[key] = value
        else:
            constructor_kwargs[key] = value
    return MCPServerStdio(params, **constructor_kwargs)  # type: ignore[arg-type]
