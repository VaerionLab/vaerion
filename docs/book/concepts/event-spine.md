# Concept — The event spine

*(grounded in ADR-0002 versioned event spine / envelope, ADR-0006 event-sourced
journals)*

Vaerion has one nervous system: the **event spine**. Every meaningful fact —
a broker decision, a model frame, a tool result, a gate answer, a node
completion — is an **event envelope**: a versioned, canonical structure with
`v` (envelope version), `type` (a registered event type), `ts`, `trace_id` /
`span_id` (attribution), `actor` (who acted), `cause` (which prior event
caused this), `payload`, and `seq` (per-run journal sequence).

Three properties do the heavy lifting:

1. **Registered vocabulary.** Event types live in `spec/events/registry.json`
   mirrored by the runtime catalog; constitutional check C4 fails when the
   two drift. Consumers never parse free-form strings.
2. **Attribution + causality.** Every envelope names its actor and its cause,
   so `vae explain RUN_ID` is a walk along a cause chain, not a grep.
3. **Canonical encoding.** The envelope's canonical JSON form is a golden
   fixture — byte-stable across versions, which is what makes replay and
   wire parity (CLI vs daemon) provable rather than aspirational.

The journal is the spine's persistence: an append-only NDJSON file per run,
each record hash-chained to the previous (blake3, genesis = zeros). Records
come in kinds (`meta`, `evt`, `decision`, `gate`, `snapshot`, `receipt`);
**snapshots** let replay start from a checkpoint instead of the beginning;
the closing **receipt** summarizes counts and seals the chain head.

Because state is a fold over records (see
[Checkpoint math](checkpoint-math.md)), the journal is not a log *of* the
system — it **is** the system. Files, blobs, and locks are recoverable from
it; nothing else is trusted to remember.
