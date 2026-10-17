"""Build AutoGen MCP tool adapters bound to `vae mcp`.

Measured against `autogen-ext` 0.7.5 (installed source, `autogen_ext/tools/mcp/`):

    StdioServerParams(command: str, args: list[str], env?, cwd?, …,
                      type: Literal["StdioServerParams"], read_timeout_seconds: float = 5)
    await mcp_server_tools(server_params) -> list[StdioMcpToolAdapter]
    # each adapter: autogen_core BaseTool — .name/.description,
    # await adapter.run_json(args_dict, CancellationToken()) -> Any
    #   (returns the MCP content list, e.g. [TextContent(type="text", text=…)])

NOTE (0.7.5): the class is `StdioMcpToolAdapter` — the older `McpToolAdapter`
name no longer exists in the factory's exports.
"""

from __future__ import annotations

from typing import Any

from autogen_ext.tools.mcp import StdioMcpToolAdapter, StdioServerParams, mcp_server_tools

from ._command import resolve_vae_command

__all__ = ["vae_stdio_params", "vae_mcp_tools", "VAE_TOOL_TIMEOUT_SECONDS"]


#: The engine's MCP contract is fast (<1s per call in practice), but bun cold
#: starts plus host OS jitter justify generous per-request headroom.
VAE_TOOL_TIMEOUT_SECONDS = 120.0


def vae_stdio_params(
    cwd: str | None = None,
    *,
    command: list[str] | None = None,
    env: dict[str, str] | None = None,
    read_timeout_seconds: float = VAE_TOOL_TIMEOUT_SECONDS,
) -> StdioServerParams:
    """Build the stdio params for `vae mcp`.

    Args:
        cwd: the Vaerion workspace the server serves. ``None`` inherits the
            current process cwd. One server process serves exactly ONE workspace.
        command: override the full spawn argv (default: the resolved vae
            command plus ``mcp`` — $VAE_BIN, PATH, or the repo bun fallback).
        env: environment for the spawned server. ``None`` = the MCP SDK's
            default environment subset.
        read_timeout_seconds: per-request read timeout for the adapter.
    """
    argv = list(command) if command is not None else [*resolve_vae_command(), "mcp"]
    if not argv:
        raise ValueError("command must be a non-empty argv list")
    return StdioServerParams(
        command=argv[0],
        args=argv[1:],
        env=env,
        cwd=cwd,
        read_timeout_seconds=read_timeout_seconds,
    )


async def vae_mcp_tools(
    cwd: str | None = None,
    *,
    command: list[str] | None = None,
    env: dict[str, str] | None = None,
    read_timeout_seconds: float = VAE_TOOL_TIMEOUT_SECONDS,
    **params_overrides: Any,
) -> list[StdioMcpToolAdapter]:
    """Connect to `vae mcp` and return the six ratified tools as AutoGen adapters.

    The adapters drop straight into an ``AssistantAgent(tools=[...])``; run them
    with ``await tool.run_json({"goal": "..."}, CancellationToken())``.
    """
    params = vae_stdio_params(
        cwd,
        command=command,
        env=env,
        read_timeout_seconds=read_timeout_seconds,
        **params_overrides,
    )
    return await mcp_server_tools(params)


def tool_text(adapter: StdioMcpToolAdapter, result: Any) -> str:
    """Extract the text payload of an adapter result (measured: a content list).

    ``run_json`` returns the raw MCP content list (e.g. ``[TextContent(type="text",
    text=…)]``); this helper joins the text parts. Invoke adapters with
    ``await adapter.run_json(args, CancellationToken())``.
    """
    if isinstance(result, list):
        return "".join(getattr(item, "text", "") for item in result)
    if hasattr(result, "text"):
        return str(result.text)
    raise TypeError(f"unexpected tool result shape: {type(result)!r}")
