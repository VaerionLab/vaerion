"""Build a langchain-mcp-adapters client pointed at `vae mcp`.

Measured against `langchain-mcp-adapters` 0.3.2 (installed source,
`langchain_mcp_adapters/client.py` + `sessions.py`):

    MultiServerMCPClient(connections: dict[str, StdioConnection | …])
    await client.get_tools() -> list[langchain_core.tools.BaseTool]

`StdioConnection` (TypedDict): ``transport: "stdio"``, ``command: str``,
``args: list[str]``, optional ``env``, ``cwd``, ``encoding``…

Measured behavior: `get_tools()` creates a NEW stdio session per tool
invocation — each `tool.ainvoke(...)` spawns `vae mcp`, performs the
handshake, the call, and lets the server exit 0. Deterministic, and every
invocation is still fully brokered + journaled by the engine.
"""

from __future__ import annotations

from typing import Any

from langchain_mcp_adapters.client import MultiServerMCPClient

from ._command import resolve_vae_command

__all__ = ["vae_mcp_client", "SERVER_NAME"]

#: The connection key used for the Vaerion server (tools stay un-prefixed by
#: default: `tool_name_prefix=False` is the measured adapter default).
SERVER_NAME = "vaerion"


def vae_mcp_client(
    cwd: str | None = None,
    *,
    command: list[str] | None = None,
    env: dict[str, str] | None = None,
    server_name: str = SERVER_NAME,
    **connection_overrides: Any,
) -> MultiServerMCPClient:
    """Return a ``MultiServerMCPClient`` with one stdio connection to `vae mcp`.

    Args:
        cwd: the Vaerion workspace the server serves. ``None`` inherits the
            current process cwd. One server process serves exactly ONE workspace.
        command: override the full spawn argv (default: the resolved vae
            command plus ``mcp`` — $VAE_BIN, PATH, or the repo bun fallback).
        env: environment for the spawned server. ``None`` = the MCP SDK's
            default environment subset (includes PATH; pass ``os.environ``
            if your engine needs more).
        server_name: the connection key in the MultiServerMCPClient map.
        **connection_overrides: extra ``StdioConnection`` keys (``encoding``…).

    Example::

        client = vae_mcp_client(cwd="/path/to/workspace")
        tools = await client.get_tools()                       # 6 LangChain tools
        status = next(t for t in tools if t.name == "vaerion_status")
        out = await status.ainvoke({})                         # a REAL brokered call
    """
    argv = list(command) if command is not None else [*resolve_vae_command(), "mcp"]
    if not argv:
        raise ValueError("command must be a non-empty argv list")
    connection: dict[str, Any] = {
        "transport": "stdio",
        "command": argv[0],
        "args": argv[1:],
        "env": env,
    }
    if cwd is not None:
        connection["cwd"] = cwd
    connection.update(connection_overrides)
    return MultiServerMCPClient({server_name: connection})
