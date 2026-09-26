# Guide — Extension kit

Extensions let a workspace add tools implemented as separate processes —
without ever widening the trust boundary by an inch. The alpha (ADR-0009
contingency R-2) runs a **digest-pinned subprocess host** with the component
WIT world locked for the future migration.

## The law

1. **Pinned before executed.** The artifact's sha256 must match
   `digest: sha256:<hex>` in the config — a mismatch is E2100 and the
   artifact is **never executed** (and never bundled, in packaging).
2. **Empty environment.** The host spawns the artifact with `env: {}` — no
   ambient PATH, HOME, or credentials leak into it. Artifacts must be
   self-locating (absolute interpreter shebangs).
3. **Protocol law.** Handshake (exact world + protocol v1) is validated
   before anything else; frames are capped; host-call budgets and per-call
   timeouts are enforced (E2102/E2103 with kill on violation). The
   adversarial suite covers malformed lines, wrong worlds, exit-before-
   handshake, unsolicited results, oversized frames, and hangs.
4. **The broker bridge.** When the extension asks for a host capability, the
   request crosses the broker with the **extension as principal**
   (`extension:<name>`): allow → the builtin executes; deny → E1300 inline +
   the refusal log; prompt → E1302 inline with the decision journaled (the
   alpha never suspends a process mid-gate).
5. **Declared-before-used.** Extensions are reachable as tools only after
   config declaration + policy admission, exactly like builtin tools.

## Declaring one

```yaml
extensions:
  - name: helper
    artifact: ./extensions/helper.mjs
    digest: sha256:<64 hex of the artifact>
    timeoutMs: 10000
    maxHostCalls: 8
    args:
      type: object
      properties:
        value: { type: string }
      required: [value]
    description: "echoes its argument"
```

Validation is loud (E1201/E1202): digest shape, name collisions, unknown
keys. Config unknown-key rejection is structural.

## The world

`spec/wit/vaerion-extension@0.1.0.wit` is the locked contract: the guest
`invoke` entry point and the single imported host function `tool-call`. The
handshake echoes the world name and protocol version — a guest that cannot
prove it implements the world never runs a step.

## Hands off the journal

Every extension lifecycle event is journaled: `extension.spawned` and
`extension.exited` carry the pinned digest and an honest failed flag; host
calls appear as normal broker decisions attributed to the extension
principal. A run that used an extension closes with a receipt and verifies
like any other.

## Honest limitations (alpha)

- The R-2 host is a subprocess, not a WASI-P2 component runtime — the WIT
  world is locked, the component migration awaits a viable substrate
  (ADR-0009 records the contingency).
- A prompt-gated host call resolves inline (E1302) rather than suspending
  the child process; interactive elevation for extensions is future work.
- Host-callable builtins are the bridgeable subset admitted by declared
  policy — the bridge cannot invent capabilities.
