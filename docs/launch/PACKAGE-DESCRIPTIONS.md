# Package Descriptions — draft (Founder approval required to publish)

> **Update (2026-10-21):** these draft texts were updated to the published truth — engine `0.1.15` (GA); the npm registry delivers `vaerion 0.1.15` under dist-tag `latest` (published 2026-10-21); PyPI `0.1.15` and the signed GitHub Release `v0.1.15` published 2026-10-17.

| | |
|---|---|
| **Status** | DRAFT — registry texts paste only at a Founder-approved release step (F-5). The channels of record are LIVE: npm published 2026-10-21; PyPI and the signed GitHub Release published 2026-10-17. |
| **Sources of record** | `docs/INSTALL.md` (channel map), `packaging/` (authored manifests), `site-data/vaerion-status.json` (numbers) |
| **Honesty law** | Every registry text carries the publish status. A description that outruns the release notes is a defect (`docs/operations/ANNOUNCEMENTS.md`). |

---

## 1. npm — `packages/vaerion/package.json` description

```json
{
  "name": "vaerion",
  "description": "Local-first trust infrastructure for AI agents: blake3-chained journals, Ed25519-signed receipts, fail-closed governance, reproducible .vxn bundles. Zero telemetry.",
  "license": "Apache-2.0",
  "author": "Auren <auren@vaerion.dev>",
  "repository": "github:VaerionLab/vaerion"
}
```

**Status line (first line of the npm README):**

> Engine `0.1.15` (GA). npm is live: the registry delivers `vaerion 0.1.15`
> under dist-tag `latest` (published 2026-10-21) — `npm install -g vaerion`.
> Releases: https://github.com/VaerionLab/vaerion/releases

### npm README intro block (≤3 paragraphs + quickstart)

```markdown
Vaerion is a local-first trust engine for AI agents. Every step of a run
lands on one versioned event spine: append-only NDJSON journals, a single
writer, blake3 hash-chained. Every run closes with a receipt folded from
that journal, and the receipt verifies independently of the process that
produced it.

Nothing acts without authority. A fail-closed permission broker decides
every source read, model call, and tool use; its decisions are journaled
too. Deliverables build into reproducible `.vxn` bundles — identical
inputs produce identical bytes, and verification never executes content.
Zero telemetry is enforced mechanically: the config guard accepts exactly
one value (`telemetry.enabled: false`), and a constitutional check fails
the build on any undeclared network egress.

The engine of record is `0.1.15`: 9 verification gates, 721 tests /
0 failed, 5,277 expectations, coverage 86.52/90.6, Apache-2.0.

Quickstart:

    vae init --template demo
    vae run demo --sources ./sources --query "determinism"
    vae journal verify <RUN_ID>     # ok: true — the chain holds
    vae package build
    vae package verify .vaerion/package/vaerion-demo.vxn
    vae doctor

Requires Bun 1.3+. Full install and verification map:
docs/INSTALL.md in the repository.
```

---

## 2. PyPI — project description summary

```markdown
Vaerion — local-first trust infrastructure for AI agents.

Vaerion runs AI-assisted work the way a database engine runs
transactions: one versioned event spine, append-only blake3-chained
journals, a fail-closed permission broker, receipts folded from
journals, and reproducible .vxn bundles whose identical inputs produce
identical bytes. Zero telemetry is enforced mechanically, not by
policy.

Engine of record 0.1.15: 9 verification gates, 721 tests / 0
failed, 5,277 expectations, Apache-2.0.

Status: published — PyPI delivers `vaerion 0.1.15` (sdist + wheel,
published 2026-10-17). Releases:
https://github.com/VaerionLab/vaerion/releases

The Python package is a delivery channel, not the substrate: the
launcher execs the engine, which runs on Bun 1.3+.
```

---

## 3. GitHub repository About (≤350 chars)

```
Local-first trust infrastructure for AI agents: blake3-chained journals, Ed25519-signed receipts, fail-closed governance, reproducible .vxn bundles. Zero telemetry, enforced mechanically. Engine 0.1.15 · 9 gates · 721 tests / 0 failed. npm published 2026-10-21; PyPI 2026-10-17.
```

278 characters. Website field: leave empty until `vaerion.dev` is live
(Founder-gated) — a dead link is a dishonest claim.

### Topics

```
ai-agents
trust
local-first
reproducibility
audit-trail
ed25519
blake3
fail-closed
developer-tools
cli
typescript
open-source
```

---

## 4. Homebrew formula `desc` line

```ruby
desc "Local-first trust infrastructure for AI agents"
```

**Status comment for the tap submission (Founder-gated, at the release
train):** the formula builds from the released source tarball with the
checksum pinned at train time; no tap exists yet
(`falconxa0-commits/homebrew-vaerion` is a packet in
`docs/founder/FOUNDER-PACKETS.md` §B (archived: github.com/VaerionLab/vaerion-archive)).

---

## 5. winget manifest short description

```yaml
ShortDescription: Local-first trust infrastructure for AI agents
PackageDescription: |-
  Vaerion is a local-first trust engine for AI agents: append-only
  blake3-chained journals, receipts folded from every run, a fail-closed
  permission broker, and reproducible .vxn bundles (identical inputs,
  identical bytes). Zero telemetry, enforced mechanically by the build.
  Release artifacts are Ed25519-signed; verify before installing.
```

**Status line for the winget submission packet:** the channel is
authored and version-locked, labeled UNVERIFIED — host until a Windows
host measures it (`docs/INSTALL.md`); submission is a Founder act
(`docs/founder/FOUNDER-PACKETS.md` §B (archived: github.com/VaerionLab/vaerion-archive)).

---

## Paste-order rule

Registry texts are pasted **during** the release-train publish step,
after the tag exists and the signed artifact set verifies — never
before, never in anticipation. The description of record is always the
release notes (`docs/RELEASE-NOTES-<version>.md`); these texts are
summaries of it, and if they disagree, the notes win.
