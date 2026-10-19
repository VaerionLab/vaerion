# Security Hardening Record — RC-1 evidence

| | |
|---|---|
| **Scope** | Secrets · permissions · extension boundaries · package integrity · supply chain — the GA objective 5 sweep |
| **Method** | Every claim below is enforced by a named gate, test, or ADR; nothing here is policy prose standing on hope. Re-verified on the frozen tree `5b80988` (PHASE 0 re-verification sprint: all 6 gates green, zero secret findings, and the installer pipeline's per-byte secret scan clean across all 97 packed files during the release-train rehearsal) |
| **User-facing summary** | [`SECURITY.md`](../../SECURITY.md) |

## 1. Secrets

| Control | Enforcement |
|---|---|
| Names-only configuration (ADR-0013) | `vaerion.yaml` carries secret *names* + grant patterns; the config schema rejects values; validator guard asserted (C6 infra, config law tests) |
| Keychain-first resolution, call-time only | values resolve from the OS keychain (env fallback) **at call time**, behind a `secret.read` broker decision; unresolved → `E1704` |
| Single egress sanctification (ADR-0019) | only `src/gateway/transport.ts` reaches provider endpoints (C1 allowlist is one file); SDK client confined to the loopback daemon site (ADR-0020, `E2006`) |
| Redaction | outbound payloads AND journal records are redacted of secret shapes (R-MG5); golden `redaction.golden.json` proves the fold |
| Repository scan | C5 pattern scan across the tree **and every packed byte** in the installer pipeline — zero findings at RC-1 |
| Repo hygiene (this sprint) | the GitHub token/credential, when the Founder provisions it, is used **only** transiently for push; it is never written to the tree, and the push law itself records the environment-blocked state instead of faking it |

## 2. Permissions (the broker)

| Control | Enforcement |
|---|---|
| Fail-closed engine (ADR-0004) | shape → ceiling → policy; unmatched requests deny (`E1300`/`E1301`); refusals are fatal to the step, journaled, and hash-chained in the refusal log |
| Ceilings from config | permission graph derived from `vaerion.yaml`; declaring a tool/model/extension **grants nothing** by itself (spec schema law + tests) |
| Human authority | prompt decisions open durable gates (`decision_id`-linked); runs pause, never auto-close; approvals journal as elevation authority that survives restarts |
| First-match policy | `policy.rules[]` with mandatory rationale; config policy validation refuses malformed rules |
| Audit | every decision is a contract record on the journal; `explain` reconstructs the narrative; the refusal log verifies |

## 3. Extension boundaries (ADR-0009 R-2)

| Control | Enforcement |
|---|---|
| Digest pins | sha256 verified **before** execution; mismatch → `E2100`, nothing spawns (adversarial suite) |
| Empty-environment spawn | extensions get no ambient environment (documented law; fixture class proves it) |
| Protocol law | handshake/world/frame-size/call-budget/timeout — violations `E2102`/`E2103`, process killed, failed exit journaled |
| Broker bridge | the extension is a first-class principal; every host call is decide → journal → act; denials hit the refusal log |
| Capabilities | extensions reachable only as declared tools through the normal pipeline — no second gate exists |

## 4. Package integrity (ADR-0016)

| Control | Enforcement |
|---|---|
| Deterministic build | identical inputs → byte-identical `.vxn` (fold, no wall-clock, no ambient paths; P2 law, test-proven twice) |
| blake3 identity | per entry + payload + full bundle; any flip → `E2201` |
| Pin defense | extension digests compared **both directions** against config AND `vaerion.lock` (`E2202`/`E2205`) |
| Pure verification | `package verify` recomputes everything and **never executes content**; a refused artifact is an honest `ok:false` + `E2206` on CLI and wire alike |
| Format law | magic + canonical manifest + pinned zstd-19; trailing bytes / shape drift / magic swap refused (`E2200`/`E2203`) |

## 5. Supply chain

| Control | Enforcement |
|---|---|
| Packed-file law | inventory allows only `src/` + README + `package.json` — fail-closed against fixtures/tests/scripts/dotfiles/`.env` |
| Offline install proof | the pipeline performs a REAL `bun install` of the tarball offline (cold cache fails loudly — never faked) and smokes the installed shim |
| Runtime pinning | `engines: bun ≥ 1.2`; dependency resolution pinned in `bun.lock` (workspace `*` references authoritative; version-string sync limitation recorded honestly) |
| Provider hermeticity | cassettes + MockBrain (ADR-0012) mean tests and demos never require network or real credentials |
| Zero telemetry | structural (C6); there is no phone-home surface to harden |
| Loopback daemon | pairing-token authn (CSPRNG, print-once, timing-safe); non-loopback bind refused (`E2006`); listener never egresses (C7) |

## 6. Residual risks (honest remainder)

1. **Unsigned bundles** circulate by design (ADR-0016 decision 4): cosign is
   optional and additive; trust policy is the consumer's choice until the
   Founder ratifies a signing policy.
2. **Env-fallback secrets** (ADR-0013) are weaker than the keychain path;
   documented, and `doctor` surfaces the resolution source.
3. **The GitHub remote does not exist yet**, so branch protection, advisory
   routing, and npm provenance (RELEASE-CHECKLIST steps 3–4) remain
   unenforceable until provisioning — the largest open security item, and it
   is Founder-gated, not engineering-gated.
4. **Price-table and breaker-state limitations** are recorded in
   `ROADMAP_PROGRESS.md` (technical risks) — operational, not security.
