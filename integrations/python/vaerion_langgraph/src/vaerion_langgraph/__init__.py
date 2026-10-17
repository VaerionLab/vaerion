"""vaerion_langgraph — the official Vaerion integration for LangGraph.

Vaerion is the verification layer beneath your graphs. This helper builds a
`langchain_mcp_adapters.MultiServerMCPClient` stdio connection pointed at the
in-engine `vae mcp` server so every tool node in your graph calls through the
brokered, journaled, receipt-backed engine path.
"""

from ._command import VAERION_TOOL_NAMES, VaerionCommandError, resolve_vae_command
from ._client import vae_mcp_client

__all__ = [
    "vae_mcp_client",
    "resolve_vae_command",
    "VaerionCommandError",
    "VAERION_TOOL_NAMES",
]

__version__ = "0.1.15rc1"
