"""vaerion_autogen — the official Vaerion integration for AutoGen.

Vaerion is the verification layer beneath your agents. This helper builds
`autogen_ext.tools.mcp` StdioServerParams and the `mcp_server_tools()` factory
result pointed at the in-engine `vae mcp` stdio server (newline-delimited
JSON-RPC 2.0, protocol 2024-11-05) so every tool an AutoGen agent executes goes
through the brokered, journaled, receipt-backed engine path.
"""

from ._command import VAERION_TOOL_NAMES, VaerionCommandError, resolve_vae_command
from ._tools import tool_text, vae_mcp_tools, vae_stdio_params

__all__ = [
    "vae_stdio_params",
    "vae_mcp_tools",
    "tool_text",
    "resolve_vae_command",
    "VaerionCommandError",
    "VAERION_TOOL_NAMES",
]

__version__ = "0.1.15rc1"
