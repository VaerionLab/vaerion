"""vaerion_crewai — the official Vaerion integration for CrewAI.

Vaerion is the verification layer beneath your crews. This helper builds a
`crewai_tools.MCPServerAdapter` bound to the in-engine `vae mcp` stdio server
(newline-delimited JSON-RPC 2.0, protocol 2024-11-05) so every tool your crew
executes goes through the brokered, journaled, receipt-backed engine path.
"""

from ._command import VAERION_TOOL_NAMES, VaerionCommandError, resolve_vae_command
from ._tools import vae_mcp_tools, vae_stdio_params

__all__ = [
    "vae_mcp_tools",
    "vae_stdio_params",
    "resolve_vae_command",
    "VaerionCommandError",
    "VAERION_TOOL_NAMES",
]

__version__ = "0.1.15rc1"
