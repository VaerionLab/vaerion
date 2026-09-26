# Installation walkthrough — empty machine to first verified receipt

Release candidate `v0.1.13-rc1` · captured 2026-09-25 · a stranger
simulation: fresh copy, no `node_modules`, no state, no prior config.

## The steps

```sh
git clone https://github.com/VaerionLab/vaerion.git vaerion && cd vaerion
bun install --frozen-lockfile      # 238 packages, the lockfile is law
alias vae="bun run packages/vaerion/src/cli/vae.ts"

vae                                 # the welcome front door
vae --version                       # vae 0.1.13-rc1

mkdir ~/vaerion-first-project && cd ~/vaerion-first-project
vae init --template demo            # a governed workspace, in ~100 ms
vae run demo --sources ./sources --query "determinism"
vae journal verify <RUN_ID>         # the chain holds
vae doctor                          # every check green
```

## Measured timings

| Step | Result | Time |
|---|---|---|
| workspace copy (stand-in for clone) | ✓ | 45 ms |
| `bun install --frozen-lockfile` | exit 0 · 238 packages | **102 ms** |
| bare `vae` (welcome door) | exit 0 · full command catalog | 86 ms |
| `vae --version` | `vae 0.1.13-rc1` | 75 ms |
| `vae init --template demo` | exit 0 · workspace scaffolded | 96 ms |
| `vae run demo --sources ./sources --query "determinism"` | exit 0 · receipt folded · `journal_verified: true` | 131 ms |
| `vae journal verify <RUN_ID>` | exit 0 · `ok: true` · `torn: false` | 85 ms |
| `vae doctor` | exit 0 · all checks green | 113 ms |
| **Total engine time** | **first verified receipt** | **≈ 0.7 s** |

**Target: first verified receipt in under 5 minutes — PASS with room to
spare.** Honest caveat: bun's warm package cache flatters the install
leg; a cold machine adds registry download time. Even at tens of
seconds, the budget holds with an order of magnitude to spare.

Full transcript of the run: [`demo-flow.md`](demo-flow.md) ·
verification, field by field: [`receipt-verification.md`](receipt-verification.md).
