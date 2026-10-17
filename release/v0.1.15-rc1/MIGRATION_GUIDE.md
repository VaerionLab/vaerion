# DRAFT — Migration guide: 0.1.14-rc1 → 0.1.15-rc1

> **DRAFT — pending Founder publish.** Behavioral facts below are measured:
> exit-code map from `packages/vaerion/src/cli/io.ts:21-28` and
> `packages/vaerion/src/cli/vae.ts:820-830`; E1010 from
> `packages/vaerion/src/kernel/errors.ts:128`; port from
> `packages/vaerion/src/api/server.ts:193`; launcher from
> `packaging/npm/bin/vae.js`; cross-version journal compatibility from
> `packages/vaerion/tests/integration/cross-version-upgrade.test.ts`
> (permanent regression test). Defect ledgers of record:
> `reports/phase-61.2/00-executive-summary.md` (D5–D14),
> `reports/phase-61.1/00-executive-summary.md` (F1–F8).

---

## First, know which 0.1.14-rc1 you were running

Phase 61.0 proved the two lineages were different engines under one version
(`reports/phase-61.0/00-executive-summary.md` — the P0 "artifact split").
Your upgrade experience differs by population:

| | **A: installed from npm** (`npm install -g vaerion` → 0.1.14-rc1) | **B: ran the source tree / tagged source** at 0.1.14-rc1 |
|---|---|---|
| Commands you had | `init`, `run`, `journal`, `package`, `report`, `serve`, … — but **no `vae verify`, `create`, `start`, `mcp`** (unknown-command error) | the full 29-command surface |
| Truncated-journal behavior | refused: `E1010`, exit 5 (the published artifact enforced the completeness anchor) | **falsely verified**: a cleanly tail-truncated closed journal returned `ok: true` (the 61.0 inversion — the tree lacked E1010) |
| Error catalog | 81 codes (E1010 enforced in code but **absent from its own catalog**) | 81 codes, no E1010 |

Both populations converge on the same 0.1.15-rc1 behavior: one engine, 82-code
catalog, E1010 canonical everywhere.

## What changes behaviorally on upgrade

### 1. `E1010` becomes canonical for truncated journals

- **If you come from population A:** no change in enforcement — your artifact
  already refused truncated closed journals with `E1010` (exit 5). What
  changes: the catalog now *contains* E1010 (`errors.ts:128`,
  `journal_completeness_anchor_invalid`), so `doctor` and help teach it, and
  recovery (`vae journal recover`) re-certifies torn tails.
- **If you come from population B:** **this is a real behavior change.** A
  closed journal whose terminal receipt is missing or does not certify its
  prefix — which `0.1.14-rc1` source verified as `ok: true` — now fails with
  `E1010` (exit 5). The journal was not lying before; verification got
  stricter. What to do when it fires:
  1. Compare against the receipt printed at run close or a `vae snapshot`
     archive (the error's fix text says exactly this).
  2. If the tail is a torn write (not deletion), `vae journal recover`
     re-certifies and verification passes again — measured lawful flow
     (`packages/vaerion/tests/security/journal-completeness.test.ts`).
  3. Never hand-edit a journal; a re-chained forgery is caught by the
     receipt's embedded head commitment (`E1010`) or the chain itself
     (`E1001`).
- Layered detection, unchanged from the published line: payload edit →
  `E1001`; middle deletion + re-chain → `E1005` (sequence gap); post-close
  substitution → `E1010`.

### 2. Exit-code contract (unchanged in shape, now fully documented)

`0` ok · `1` internal · `2` usage (`E1600` — including the no-Bun launcher
refusal and `package build` without a `package:` block) · `3` broker-denied
run-level (`E1300`/`E1301`/`E1302`) · `4` provider down · `5` partial
(`E1001`/`E1010` verify failures, `E1501`, package pure-check findings).
Two nuances the 61.2 docs correction (D11) made explicit:

- A **run-level** broker denial exits 3 before the run starts; an **in-run**
  denial closes the run with a *failed receipt* and exits **0** — the
  evidence is journaled either way. If you wired automation on exit codes,
  check for the failed receipt, not just non-zero exits.
- `vae verify` / `vae journal verify` exit 5 (not 1) on integrity failure.

### 3. Launcher change (population A)

`bin/vae.js` is now a node-executable ESM launcher (the packaged
package.json is `"type": "module"`):

- Bun on PATH: re-exec `bun <engine>` — one process's output, exit code
  propagated; **+35 ms per invocation, measured** (accepted cost of the
  taught-refusal guarantee).
- No Bun: taught `E1600` message with the fix (`curl -fsSL https://bun.sh/install | sh`),
  **exit 2** — previously a raw `env: 'bun': No such file or directory`
  (exit 127) on Unix, and a silent dead-end in the Windows `.cmd` path.

### 4. Port 7897 — and the SDK default fix

The daemon's port is unchanged: `vae serve` binds `127.0.0.1:7897`
(`api/server.ts:193`, loopback-only, ADR-0010). What changed: the four
non-TypeScript SDKs shipped defaults pointing at the dead port **8787**;
0.1.15-rc1 corrects them to 7897 (D13). If you hand-wired a client to 8787,
point it at 7897. Health (`GET /health`) is unauthenticated by contract;
everything state-changing requires the per-boot pairing token (printed once,
rotates every boot; old tokens are dead after restart).

### 5. Python SDK: loopback enforcement (E2006) is now constructor-enforced

`VaeDaemonClient(base=...)` refuses a non-loopback base at construction —
before any socket — mirroring TypeScript/Go/Rust/Java. A script that pointed
the Python client at a remote URL (and was silently sending its pairing
token there) now raises. This is the D4/D12 correction; the daemon itself
was already loopback-bound server-side. Python suite: 12 → 16/16.

### 6. Version register / parity system (all populations)

26→27 register pins now own every version literal, including the
cross-version-upgrade tripwire (D5). You cannot partially upgrade register
surfaces without the suite going red — this is the mechanism that prevents
another 0.1.14-style split.

## What breaks

**Nothing is expected to break.**

- Within-v0.1 surfaces evolve additively — nothing removed or renamed
  (`CHANGELOG.md` header law, `BETA-ONBOARDING.md`).
- Journals written under 0.1.14 verify under 0.1.15: the vN → vN+1 leg is a
  permanent regression test
  (`packages/vaerion/tests/integration/cross-version-upgrade.test.ts`).
- The command surface only grows (population A gains four commands).
- The 61.1/61.2 defect ledgers (F1–F8, D5–D14) surfaced no
  backward-compatibility break; every correction was either additive,
  teaching-only, or a refusal that did not exist before (E1010 for
  population B, E2006 for Python).

Two known frictions (pre-existing, not introduced by this upgrade, both
taught at the point of failure): `vae package build` on a fresh demo
scaffold refuses `E1600` until a `package:` block exists in `vaerion.yaml`
(deferred as template-content change, `reports/phase-61.2/01-release-readiness.md`
F10); and the Bun runtime remains a hard requirement (F11).

## Step-by-step upgrade

```sh
# 0. (any population) record what you have today
vae --version                                   # → vae 0.1.14-rc1 (registry) or your source version

# 1. upgrade — AFTER the Founder-gated publish of 0.1.15-rc1:
npm install -g vaerion@rc                       # @rc is the release-candidate channel
vae --version                                   # → vae 0.1.15-rc1  ← verify what you actually got

# 2. verify your existing evidence still verifies
vae doctor                                      # config, journals, completeness — all green expected
vae verify                                      # → VERIFIED (exit 0)

# 3. (optional) prove the strictness upgrade on a THROWAWAY workspace
vae init --template demo && vae run demo
vae journal verify <RUN_ID>                     # → ok · anchored · complete
# delete the last line of .vaerion/journal/<RUN_ID>.ndjson, then:
vae journal verify <RUN_ID>                     # → E1010, exit 5 — deletion is detected
```

Install honesty: until the publish runs, `npm install -g vaerion@rc`
delivers `0.1.14-rc1` — check `vae --version` and compare against the
registry (`npm view vaerion dist-tags`) before trusting an upgrade happened.

## Rollback

```sh
npm install -g vaerion@0.1.14-rc1    # exact prior version, rc tag pinned
vae --version                        # → vae 0.1.14-rc1
```

- Your `.vaerion/` evidence is workspace data: journals, receipts, and
  snapshots are **not** touched by upgrade or rollback, and a 0.1.15-written
  journal verifies under 0.1.14 **only if its completeness anchor passes the
  old engine's checks** — journals are append-only and forward-verifiable by
  design (the cross-version test proves the vN→vN+1 direction; do not rely
  on the reverse for E1010-era semantics).
- Roll back only the binary, never edit evidence to fit an engine version;
  if a journal refuses under either version, treat it as a finding and use
  `vae journal recover` / `vae doctor` / the printed receipt — per
  `docs/LIMITATIONS.md` and `docs/security/THREAT-MODEL.md`.
