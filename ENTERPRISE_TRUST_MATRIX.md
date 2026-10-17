# VAERION — ENTERPRISE TRUST MATRIX

**Version of record:** v0.1.15-rc1 (artifact `bd2e5d56…`, parity-proven) · **Compiled:** Phase 61.2, 2026-10-04 · **Method:** every answer below cites a live measurement or a gate-pinned artifact — nothing is asserted from ambition. Frozen audit copy: `reports/phase-61.2/02-enterprise-trust-matrix.md`.

---

## The seven trust questions

### Q1. What does Vaerion guarantee?

- **Tamper-evident execution evidence.** Every run journals to an append-only blake3-hash-chained NDJSON file; the chain binds each record to the previous (`prev`/`hash`). A 1-byte payload flip is refused: E1001, exit 5 (measured on source and installed artifact, this session).
- **Completeness, not just integrity.** The run's closing receipt commits the expected record count; deleting even the last record of a closed journal — chain intact — is refused: E1010, exit 5 (measured; 12-attack suite green). This was the 61.0 P0; it is closed at every layer.
- **Determinism.** The same tree builds the same package: `make-package.sh` ×2 → `bd2e5d56…` identical (and the 61.1-era build reproduced `d9d8f1a7…` identically at 61.2 start). Workspace `package build` ×2 → identical sha256.
- **Source–artifact identity.** The pre-publish parity gate refuses if the packed engine (116 files), package.json, README, bin, dispatch surface (29 commands), template registry, E1010 anchor, or dead files differ from the tree. Exit 0 measured this session.
- **Loopback-only daemon + per-boot pairing.** Binds 127.0.0.1:7897 only (ss-verified); unauthenticated → 401 E2000; 43-char token printed once; token dead after reboot; wrong token → 401. All re-measured this session.
- **Fail-closed permission broker** (E1300/E1301/E1302 → exit 3 pre-run; in-run denials close with a failed receipt — the evidence survives either way).
- **Zero telemetry.** 3 declared gateway URLs, 1 fetch call site, no other egress; secrets never printed (credential PRESENCE only in `ai status`).

### Q2. What does Vaerion NOT guarantee? (stated, not hidden)

- **Tamper-evident ≠ tamper-impossible.** A determined operator with filesystem write access can rewrite a journal *and its receipt commitments* only if they also hold the receipt printed at close or a `vae snapshot` archive — E1010's recovery guidance says exactly this. No local-first system can stop the machine's owner from destroying evidence; Vaerion makes *undetected* rewriting require coordinated, multi-artifact forgery.
- **No transport security yet.** Remote daemon attachment is refused in code (E2006) in **all five SDKs** until a ratified transport-security ADR exists — the docs say so.
- **No external anchoring / SIEM export / compliance mapping** (EU AI Act, ISO 42001, NIST) — zero content shipped; ledgered in the 61.0 adoption-blocker matrix as P1/P2, still open.
- **GA shipped (2026-10-17).** `v0.1.15` is the current stable release: GitHub Release + npm `latest` + PyPI, measured in the release train's evidence of record.
- **No Windows-native engine** (Bun runtime requirement; launchers now teach the remedy instead of failing raw).

### Q3. How is evidence generated?

One event spine → append-only journal (`.vaerion/journal/<run_id>.ndjson`), records hash-chained with genesis anchor; config fingerprint + engine version embedded in the header; the terminal receipt is folded from the journal (not written beside it) and commits the record count (the E1010 anchor). Measured: golden path `init → run demo → verify` exits 0 in 0.32 s of engine time.

### Q4. How is evidence verified?

`vae verify` re-walks the chain, re-hashes every record, checks the receipt's completeness commitment, and exits 0 (green) or 5 (E1001/E1010 with a repair path: `vae journal recover`, `vae doctor`). The same check is exposed over MCP (`vaerion_verify_journal`, 6-tool surface, live handshake), over the daemon API, and through all five SDKs. Verification is local-first: no account, no network.

### Q5. Can evidence be tampered with?

**Silently, no — measured:** payload flip → E1001; tail deletion → E1010; middle deletion + re-chain → E1010 (the receipt's embedded head commitment catches what chain checks cannot); receipt mismatch → E1001/E1010. Noisily, yes (like any file): destruction is always possible; `docs/security/THREAT-MODEL.md` (re-affirmed this phase for 0.1.15) states the adversary model.

### Q6. Can an operator fake a successful run?

To fake a *verifiable* successful run, an operator must produce a journal whose chain verifies AND whose closing receipt commits the record count AND matches a receipt artifact they did not control at run time — or edit before close and re-print the receipt, which the printed-receipt comparison (snapshots, `VERIFY.md` flow) detects. What an operator can always do: not run Vaerion, or delete the workspace. Vaerion's guarantee is about the evidence that exists, not proof the evidence exists.

### Q7. Can developers reproduce results?

- Deterministic engines: seeded local provider (byte-identical outputs), fixed-clock test harness, deterministic packaging (§Q1).
- Deterministic releases: two independent rebuilds hash-identical, twice (two epochs).
- Public verification: the `VERIFY.md` flow shipped with each release teaches anonymous three-leg verification of the signed set (SHA256SUMS + MANIFEST.json + Ed25519 `.sig`; fail-closed on missing/foreign keys per `tools/dist-pack.ts`).

---

## The five evaluator personas

| Persona | What they check first | Finding (evidence) | Status |
|---|---|---|---|
| **Security engineer** | threat model currency, auth, tamper paths | THREAT-MODEL re-affirmed for 0.1.15 with dated evidence; loopback+token battery re-measured; E1001/E1010 live-refused; 0 dependency vulnerabilities (`npm audit`); network surface = 3 URLs + 1 call site | **satisfied** |
| **CTO** | what changes for my org, what's the risk | guarantees/non-guarantees are explicit (Q1/Q2); deterministic, local-first, zero telemetry, Apache-2.0; honest open-ledger (RISK-LEDGER with owners) instead of a clean story | **satisfied, with open items visible** |
| **Developer advocate** | 30-second story, install, first proof | 30-second test PASS (README:5-7); install 0.786 s from candidate tarball; golden path 100% green unassisted; did-you-mean teaching on every wrong command; every install surface carries the registry-lag truth | **satisfied** |
| **Compliance reviewer** | control mapping, evidence retention, attestation | journals/records are structured and exportable (redacted export tested), but **zero** EU-AI-Act/ISO-42001/NIST mapping, no SIEM export, no external anchoring | **not yet — documented gap, ledgered** |
| **Open-source maintainer** | build reproducibility, no dead files, version hygiene | 26+2 register pins (incl. the new tripwire pin), parity + install-honesty gates refuse drift, dead CLI files verified absent, deterministic builds, clean `npm audit` | **satisfied** |

---

*This matrix is the trust-shelf document of record. Update it only with measurements; the parity gates will hold the rest.*
