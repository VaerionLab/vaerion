#!/usr/bin/env python3
"""The five-minute Python journey against a local Vaerion daemon.

    python3 examples/demo.py

Spawns its own `vae serve` (loopback, pre-provisioned pairing token), runs
one brokered agent goal, prints the receipt's integrity commitment, and
verifies the journal chain through the CLI of record.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from vaerion import Agent, VaerionError  # noqa: E402


def main() -> int:
    with Agent() as agent:
        print(f"daemon healthy: {agent.client.health()['ok']}")
        result = agent.run("summarize this workspace from its own overview")
        receipt = result["receipt"]
        print(f"run_id:        {result['run_id']}")
        print(f"status:        {result['status']}")
        print(f"journal:       {receipt['journal']['records']} records, head {receipt['journal']['head_hash'][:16]}…")
        print(f"decisions:     {result['decisions']}")
        verified = agent.verify(result["run_id"])
        print(f"verified:      {verified['ok']} (torn={verified['torn']}, {verified['records']} records)")
        print("the verified head is the terminal receipt record — the chain holds →", verified["ok"])
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except VaerionError as e:
        print(f"{e}", file=sys.stderr)
        raise SystemExit(1)
