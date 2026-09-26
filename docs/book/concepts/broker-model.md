# Concept — The broker model

*(grounded in ADR-0004 centralized permission broker)*

One question appears in every agentic system: *who may do what, and who
says?* Vaerion's answer is a single centralized broker through which every
privileged action passes. There is no code path that performs a privileged
action without a journaled broker decision — the constitutional law
**Decide → Journal → Act** is enforced by scanners (C1/C7) that fail the
build if a second path appears.

## Decisions

A decision binds: principal (human / agent / extension), domain (`tool.call`,
`model.invoke`, `research.fetch`, `secret.read`, `net.connect`), scope (the
specific tool, model, path, or host), intent, and the outcome with the policy
that produced it.

## Three layers, in order

1. **Shape** — malformed requests never reach policy. (Garbage in is a
   refusal, not a policy question.)
2. **Ceiling** — the permission graph compiled from `vaerion.yaml`. This is
   what the workspace *declared*: tools, providers, sources, extensions.
   The ceiling cannot be widened by a policy file, an agent, or an
   extension; it can only be edited by editing the declaration (a reviewed,
   fingerprinted change).
3. **Policy** — first-match-wins rules, each with a mandatory rationale.
   Unmatched ⇒ deny. Fail-closed is not a default; it is the absence of
   permission to do otherwise.

## Effects

`allow` proceeds (journaled). `deny` stops with a stable E-code and a
hash-chained refusal-log entry. `prompt` is the interesting one: it pauses
the run with a **durable gate** — a record that survives process death,
references its decision, and can only be resolved by a human answer. An
approval becomes journaled **elevation authority** for the same principal:
restart-safe continuation without blanket grants. Denials close the run.

## Why centralized?

Because auditability is a product feature. When every authorization is a
record in hash-chained stores (journals, audit ledger, refusal log), the
questions "what did this run touch?", "who approved that?", "what has been
refused lately?" have exact answers. A distributed permission model would
make each subsystem lawful but the *system* unauditable — and an unauditable
agent system is not one you can hand real authority to.
