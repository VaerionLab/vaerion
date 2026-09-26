# Guide — Security posture

What protects a Vaerion workspace, in one page: fail-closed by construction,
evidenced by default, honest when something is wrong.

## The broker (three layers, all fail-closed)

Every privileged action is a broker decision:

1. **Shape** — is the request well-formed? Malformed = refuse.
2. **Ceiling** — the permission graph derived from `vaerion.yaml` (declared
   tools, providers, research sources, extensions). Outside the ceiling =
   refuse (no policy file can widen it).
3. **Policy** — first-match-wins rules with mandatory rationales. No match =
   **deny** (fail-closed). `allow` / `deny` / `prompt`.

`prompt` produces a **durable human gate**: the run pauses (journal stays
open), the gate references the `decision_id` that created it, and only a
human answer resolves it. Approvals are journaled as elevations and become
restart-safe authority **for the same principal** — never a blanket grant.

## The evidence stores

| Store | Chain | Verified by |
|---|---|---|
| Run journals | blake3 hash chain, NDJSON | `vae journal verify`, replay, recovery |
| Audit ledger | hash-chained elevations | `vae doctor` continuity check |
| Refusal log | hash-chained denials | `vae doctor`; surfaced in `explain` |
| Blob CAS | content-addressed (blake3) | doctor triangulation vs evidence |

`vae doctor` verifies all of them on demand and refuses to lie: a failed
check exits 5 with a `Fix:` hint.

## Redaction

Secret-shaped material is redacted on the way **out** (provider payloads) and
on the way **in** (journal writes). The redaction output is a golden fixture;
a regression to it is a constitutional failure, not a formatting bug.

## Zero telemetry

The engine contains **exactly one** sanctioned egress site (the gateway
transport, reachable only behind journaled broker decisions). Constitutional
checks C1 (no undeclared network) and C6 (zero-telemetry config guard) and
C7 (the daemon listener never egresses) fail the build otherwise. `vae doctor`
asserts the same at runtime — "no phone-home" is structural.

## The daemon surface

Loopback-only binds (E2001 refuses anything else — there is no flag to
expose remotely); pairing-token authn generated from the platform CSPRNG and
printed once (VAE_TRUST pre-provisions headless starts); timing-safe token
comparison; errors leave as stable machine-parseable JSON without stack
traces; shutdown requires the token echoed in the body.

## Upgrades with a spine

Contract evolution is additive within a major version (`spec/CHANGELOG-SPEC.md`);
error codes are never reused (ADR-0014). A workspace that verified yesterday
still verifies after an upgrade — and if a journal was written by a future
format, verify fails loudly instead of guessing.

## Threat-model notes (honest boundaries)

- The local machine and its user are trusted; the model is NOT — research
  content is fenced, tool arguments are schema-validated, model plans are
  contract-checked (E1800).
- The daemon is for ONE local operator, not a multi-user service; remote
  exposure requires a ratified transport-security ADR.
- Per-process breaker state is deliberate (the failures are journaled);
  multi-process federation is an open ADR, not a silent behavior.
