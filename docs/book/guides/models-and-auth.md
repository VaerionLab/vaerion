# Guide — Models and auth

How model invocations work in Vaerion: one gate, journaled decisions, honest
money, and a secrets boundary that never crosses the wire.

## The single gate

Every model invocation — CLI, agent step, planner, workflow node — crosses
the same path:

```
decide (model.invoke, broker) → journal → secret.read decision →
sanctioned transport → adapter → usage metered on the spine → receipt
```

There is no second path. The adapter layer speaks provider wire protocols
(anthropic, openai, ollama); the **sanctioned transport** is the single
egress site in the engine (ADR-0019) — constitutional check C1 fails if any
other code attempts network calls.

## Declaring providers

```yaml
gateway:
  providers:
    mockbrain:  { enabled: true, models: ["mock-1"] }
    anthropic:  { enabled: true, models: ["claude-sonnet-4-5"], secretName: ANTHROPIC_API_KEY }
    openai:     { enabled: true, models: ["text-embedding-3-small"], secretName: OPENAI_API_KEY }
    ollama:     { enabled: true, models: ["llama3.1:8b"] }
  budgets:
    tokensPerRun: 20000
    microUsdPerRun: 5000000
```

Undeclared models are refused by the ceiling **before** any journaling of a
request payload. `vae doctor` prints the capability matrix (ops, secret
names) for exactly what is declared.

## mockbrain — the hermetic provider

`mockbrain` is a seeded local virtual provider (ADR-0012): no network, and
byte-identical outputs for the same seed. It powers the test suite, the
tutorials, and hermetic evals. Identical seed ⇒ identical streams — the
property MockBrain determinism tests assert.

## Secrets

- Config carries secret **names**, never values (ADR-0013).
- A `secret.read` broker decision is journaled **before** the value is
  resolved; the resolution happens at call time through the OS keychain first
  (environment fallback).
- Secret values are never journaled, never printed, never cached; outbound
  requests pass redaction (the `[REDACTED len=N]` law — R-MG5), and the
  journal redacts the same shapes on write.

## Budgets

- `tokensPerRun` / `microUsdPerRun` are enforced **pre**-flight (refuse
  before spend) and **post**-flight (stop loudly when exceeded, E1703, with a
  repair hint). Spend is journaled; the stop is honest.

## Money is integer micro-USD

Pricing is a build-time table of integer micro-USD per MTok; metering is an
order-free pure fold over journal metering records (R-MG3). Costs are exact —
no floats. `vae explain RUN_ID` prints the metering rollup per model.
Wildcard-honesty: local models cost 0, unknown models price `null` (never a
guessed number).

## Retries, breakers, cassettes

- Connection failures retry with deterministic full-jitter backoff; **law
  failures never retry** (a refusal is an answer, not a network error).
- Each provider has a circuit breaker (open → cooldown → half-open); a trip
  is E1705 on the journaled failure that caused it.
- Committed cassettes (recorded through the real fingerprint pipeline) replay
  provider transcripts byte-exactly for hermetic tests and evals.

## Auth for humans and agents

- **Human** CLI invocations act as the `human` principal; agents act as
  `agent:<run-id-suffix>`; workflow nodes as `agent:workflow`; extensions as
  `extension:<name>`. Your policy rules match on `principalKinds` + `domain` +
  `scope` — first match wins, everything else denies (see
  [Security posture](security-posture.md)).
- The local daemon authenticates with a pairing token (loopback only, ADR-0010);
  the SDK client is the single sanctioned loopback client (E2006).
