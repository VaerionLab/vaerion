"""Vaerion — the verification layer for AI agents (Python SDK).

Zero-dependency client over the local daemon wire (`vae serve`): brokered
agent and workflow runs, folded run status with the terminal receipt, SSE
event streams, and journal verification through the CLI of record.

    from vaerion import Agent

    with Agent() as agent:
        result = agent.run("summarize the project")
        print(result["receipt"]["journal"]["head_hash"])
        print(agent.verify(result["run_id"]))

Every run is broker-decided, journaled on a blake3 hash chain, and closed
with a receipt folded from the journal — the same contracts the CLI uses.
"""

from .agent import Agent
from .daemon import VaeDaemonClient
from .errors import VaerionError
from .sse import parse_sse

__version__ = "0.1.15"

__all__ = ["Agent", "VaeDaemonClient", "VaerionError", "parse_sse", "__version__"]
