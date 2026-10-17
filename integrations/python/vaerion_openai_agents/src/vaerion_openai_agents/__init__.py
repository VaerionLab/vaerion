"""vaerion_openai_agents — the official Vaerion integration for the OpenAI Agents SDK.

Vaerion is the verification layer beneath your agents. This helper builds an
`agents.mcp.MCPServerStdio` pointed at the in-engine `vae mcp` stdio server
(newline-delimited JSON-RPC 2.0, protocol 2024-11-05) so every tool call an
Agents-SDK agent makes is broker-decided, journaled and receipt-backed.
"""

from ._command import VAERION_TOOL_NAMES, VaerionCommandError, resolve_vae_command
from ._server import vae_mcp_server

__all__ = [
    "vae_mcp_server",
    "resolve_vae_command",
    "VaerionCommandError",
    "VAERION_TOOL_NAMES",
]

__version__ = "0.1.15rc1"
