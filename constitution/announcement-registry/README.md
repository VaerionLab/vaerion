# ANNOUNCEMENT & COPY REGISTRY — Constitutional Authority

**Status:** established (Foundation Amendment **F-003**).
**Authority:** Implementation Constitution 6.11 — the Announcement and Copy
Registry is one of the seven marked implementation necessities, required by the
fidelity standard (P-6). Supremacy: Bible (P-1), specifically Art. VII (Two
Voices), Art. VIII (Honesty Over Comfort), Art. XIII (Teach the States).

---

## 1. Mandate

Every string the system announces or displays as copy — state explainers,
error messages, confirmations, empty states, Returns, screen-reader
announcements, ceremony dialogues, one-line verdict explainers — is
**registered here as law**, exactly like a token. Copy is a surface of the
system, and unregistered copy is uncitable copy (Bible Art. XI — Nothing
Unmeasured Ships).

The registry exists so that:

- the **Two Voices** discipline (Bible Art. VII; Visual System §2.1) is
  enforceable — every string declares its voice;
- the **Teach the States** obligation (Bible Art. XIII) has a canonical source
  — the one-line explainers of the four verdicts live here, once, and every
  surface renders the same explainer;
- **announcements are consistent across surfaces and platforms** — CLI, API,
  and UI speak identically (Constitution 9.12 parity);
- accessibility announcements (screen-reader text for seals, hashes, chain
  state) are engineered artifacts, not afterthoughts.

## 2. Structure

```
constitution/
    announcement-registry/
        README.md        <- this authority document
```

**No announcement strings are ratified yet.** Strings enter this registry when
Stage 6 — Interaction Engine — implements the announcement system against the
law defined here; each proposed string is then ratified through governance
(Implementation Constitution 11.2–11.3) before first render.

## 3. Law of Copy (binding on all future entries)

1. **Every string is registered.** A rendered string absent from this registry
   is a violation (parallel: literal visual values, Constitution 1.3).
2. **Every entry declares its voice** — Machine or Human (Bible Art. VII) —
   and its accessibility form (announced text).
3. **Verdict explainers are canonical and permanent** — the one-line explainer
   for each of the four verdicts is registered once and rendered identically
   everywhere (Bible Art. XIII; Visual System §14 amendment 5).
4. **Honesty constraints bind every string** (Bible Art. VIII): no string may
   overstate state, soften failure, imply verification, or promise what the
   system has not measured.
5. **No string is invented at render time.** Strings are consumed from the
   registry by identifier; composing copy on the fly is a violation.
6. **Changes are amendments.** Wording of a ratified string changes only
   through the amendment pathway, with the Two Voices and Honesty reviews
   (Implementation Constitution 11.2–11.3).

## 4. What Does Not Belong Here

- Marketing copy for non-constitutional surfaces (the pre-ratification public
  site is outside Volume IV scope — see IR-003 and `constitution/INDEX.md` §4).
- Log literals emitted by the pre-existing engine (`packages/vaerion/`).
- Documentation prose (governed by the Stage 10 documentation pipeline).

## 5. Relationship to Other Authorities

- **Registry Authority (F-004, `constitution/registry/`):** tokens govern
  visual values; this registry governs textual values. Neither may absorb the
  other.
- **Snapshot Authority (F-002):** ratified copy appears in the fidelity canon;
  snapshot comparison includes announced text.
- **Interaction Engine (Stage 6):** the implementation under `src/vaerion/`
  executes this registry; it never authors strings.
