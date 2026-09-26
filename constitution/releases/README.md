# RELEASE RECORD AUTHORITY — Constitutional Governance

**Status:** established (Foundation Amendment **F-006**).
**Authority:** Implementation Constitution Part X (release law), 10.3 (Release
Receipt as an implementation necessity), 10.4 (append-only release chain);
Bible Art. III (A Verdict Names Its Verifier).

---

## 1. Mandate

This directory is the constitutional home of **Release Receipts** — the
verdicts Vaerion issues about its own releases. Just as the product refuses to
render an unnamed verdict (Bible Art. III), the implementation refuses to ship
a release that cannot name the engine and rule set that verified it
(Constitution 10.3).

## 2. Structure

```
constitution/
    releases/
        README.md        <- this authority document
```

**No release receipts exist yet.** The first Release Receipt is issued by the
Release Engine at **Stage 9**, after every constitutional gate has been
demonstrated on the exact shipped artifact (Constitution 10.1–10.2).

## 3. Law of Release Records

1. **Every release produces its own receipt.** A release without a receipt
   does not exist as a Vaerion release (Constitution 10.3).
2. **A receipt names its verifier** — build engine version, rule set
   (including the Registry version the release conforms to), environment, and
   the gate results demonstrated on the exact artifact (Constitution 10.1–10.3;
   Bible Art. III).
3. **The release chain is append-only.** A receipt is never edited or
   withdrawn; corrections and rollbacks are **superseding receipts** appended
   to the chain (Constitution 10.4).
4. **Receipts are immutable records.** Any alteration of an issued receipt is
   a constitutional violation (rule: F-006/RELEASE), detectable by digest.
5. **Rollbacks produce receipts.** A rollback is itself a release event and
   issues its own superseding receipt naming what it supersedes.

## 4. What Belongs Here — and What Never Does

| Belongs here | Never belongs here |
|---|---|
| Release Receipts (Constitution 10.3) | Build outputs, bundles, tarballs |
| Rollback / supersede receipts (10.4) | Coverage or gate log dumps |
| The receipt index as it grows | Documentation renders (Stage 10 pipeline owns docs) |
| | Pipeline artifacts (pipeline tooling owns intermediates) |

**Build outputs do not belong in the constitution tree.** The constitution
holds the verdicts about releases; the pipeline holds the machinery; the
artifact storage holds the artifacts.

## 5. Relationship to Other Authorities

- **Snapshot Authority (F-002):** a release receipt cites the canon state
  (manifest digests) its gates were demonstrated against.
- **Registry Authority (F-004):** a receipt declares the Registry version the
  release conforms to (Constitution 2.8).
- **Release Engine (Stage 9, `src/vaerion/release/`):** the implementation
  executes this authority; it never issues receipts outside the form this
  authority defines.
- **Export Authority (Constitution Part VIII):** export manifests and release
  receipts are distinct instruments; one does not substitute for the other.
