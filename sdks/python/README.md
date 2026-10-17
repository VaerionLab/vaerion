# vaerion (Python SDK)

> **Provenance.** Generated against engine `0.1.15-rc1` (version-register
> alignment, 2026-10-03; signatures verified against source at `815e929`).
> PyPI distribution name of record: `vaerion-sdk` (import name stays
> `vaerion`); publication is Founder-gated. Conforms to
> `VAERION_SDK_STANDARD.md` (v0.1): loopback daemon wire, CLI-of-record
> verification, real-daemon conformance suite.

The verification layer for AI agents — Python over the local daemon wire.
**Zero dependencies** (standard library only), Python ≥ 3.9.

```python
from vaerion import Agent

with Agent() as agent:
    result = agent.run("summarize this workspace")
    print(result["receipt"]["journal"]["head_hash"])   # the integrity commitment
    print(agent.verify(result["run_id"]))              # chain recomputed from disk
```

## What it is

Vaerion runs a local daemon (`vae serve`, loopback-only) that executes the
**same supervised agent loop and workflow engine as the `vae` CLI**: every
step is broker-decided (fail-closed), journaled on an append-only blake3
hash chain, and closed with a **receipt folded from the journal**. This SDK
is a thin, honest client over that wire — it invents no protocol and hides
no semantics. The full contract is `VAERION_SDK_STANDARD.md` (repo root);
this package conforms to it for the Python idiom.

## Install (from this repo — PyPI publication is Founder-gated)

```sh
pip install ./sdks/python        # or: pip install -e ./sdks/python
```

The SDK needs the `vae` CLI available (`npm install -g vaerion@rc`, or
`VAE_BIN` pointing at a launch command) — `Agent` spawns and stops its own
daemon by default; pass `base=`/`token=` to attach to one you run yourself.

## Surface

| Call | Meaning |
|---|---|
| `Agent(cwd=…)` / `Agent(base, token)` | spawn-and-attach lifecycle (context manager stops what it spawned) |
| `agent.run(goal, steps=None, planner="inline")` | one brokered agent run → final status view incl. `receipt` |
| `agent.workflow(dag)` | one deterministic workflow DAG run on the journal |
| `agent.events(run_id)` | the run's SSE event stream (JSON payloads, replay) |
| `agent.status(run_id)` | the folded status view without waiting |
| `agent.verify(run_id=None)` | FULL chain recomputation via the CLI of record (`vae verify` semantics) |
| `agent.answer_gate(run_id, gate_id, answer)` | human authority over a paused (gated) run |
| `VaeDaemonClient(base, token)` | the raw wire client: health/version/openapi, start/get/events/answer/shutdown |

Errors are `VaerionError(code, message, fix)` — the daemon's stable E-codes
(E1301 broker denial, E2000 auth required, E1001 chain broken …) with the
`Fix:` line intact. Denials are first-class: an undeclared tool call raises
E1300/E1301, and that refusal is journaled — evidence, not an exception to
be ashamed of.

## Honest scope

- `verify()` shells out to the CLI of record on purpose: verification
  trusts the bytes on disk, not the process that produced them.
- Daemon runs are `agent | workflow` (the demo research journey is a CLI
  surface: `vae run demo`). No other routes are called — see
  `VaeDaemonClient` (the entire wire surface, ~200 commented lines).
- The pairing token is generated in-process (`secrets.token_urlsafe`) and
  pre-provisioned via `VAE_TRUST` so it is never printed by the daemon.

## Tests (conformance suite — real execution, never faked)

```sh
cd sdks/python && python3 -m unittest discover -s tests -v
```

Unit layer: SSE parsing, error-contract fidelity, wire-shape laws (the
token never rides open routes). Integration layer: a REAL spawned daemon —
run → receipt → verify, event replay, and the fail-closed denial path.
Skipped (never faked) when no `vae` runtime exists.
