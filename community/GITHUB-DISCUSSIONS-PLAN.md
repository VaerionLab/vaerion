# GitHub Discussions Plan — draft (Founder approval required to change)

| | |
|---|---|
| **Status** | DRAFT — four categories are enabled and measured (recorded in `SUPPORT.md`); the plan below formalizes them, adds one, and defines templates and routing. Founder approval required before structural changes. |
| **Flow of record** | GitHub Releases (announcements), `CONTRIBUTING.md` (where proposals and questions start) |
| **Security exception** | Security findings never enter Discussions. Private, per `SECURITY.md`. |

---

## 1. Categories

| Category (display name) | GitHub type | Purpose | Who posts |
|---|---|---|---|
| **Announcements** | Announcements (maintainer-only) | Release notes summaries and campaign closures. The GitHub Release is the announcement of record; this category links it and stays open for questions (which then move to Q&A — one topic, one surface). | Maintainer/Founder only |
| **🙏 Q&A** | Q&A | The support surface: "How do I…". Askers mark the accepted answer; unanswered topics are triaged weekly — a defect found in a question becomes an issue. | Everyone |
| **💡 Ideas** | General | Feature-request intake. Proposals live here until they have a concrete, testable shape; only then does an issue open (`CONTRIBUTING.md`). | Everyone |
| **🛠 Show and tell** | General | What people built with Vaerion: verified runs, reproducibility demos, receipts. Evidence encouraged; fabricated output is a conduct violation. | Everyone |
| **📣 Refutations & counter-evidence** | General | **The on-brand category:** a standing invitation to prove the engine wrong. Post a command sequence whose output contradicts a documented claim — and be thanked as a first-class contributor. Accepted refutations become issues and enter the defect ledger. | Everyone |

Notes:

- The emoji are part of the category names as listed; they appear
  nowhere else in project copy (voice law — no emoji in body
  copy).
- Q&A uses GitHub's Q&A type so accepted answers are a first-class
  surface; the other three are General with pinned template topics.

## 2. Category descriptions (paste into each category)

- **Announcements:** "Release notes and campaign closures from the
  maintainer. The release page is the announcement of record; questions
  move to Q&A."
- **🙏 Q&A:** "Usage help from the community. Include the command, the
  output, the engine version, and the exit code. Mark the answer that
  resolved your topic."
- **💡 Ideas:** "Feature proposals before an issue exists. State the
  problem, the proposed shape, and how it would be tested. Additive
  evolution is the law within v1."
- **🛠 Show and tell:** "What you built with Vaerion. Terminal output is
  the preferred screenshot."
- **📣 Refutations & counter-evidence:** "Prove the engine wrong. Post a
  reproducible command sequence whose measured output contradicts a
  documented claim (cite the doc line). Accepted refutations become
  issues and are credited. No claim survives without evidence —
  including ours."

## 3. Posting templates

### 🙏 Q&A template

```markdown
### What were you trying to do?

<!-- one sentence -->

### What did you run?

```sh
<!-- the exact command(s), verbatim -->
```

### What happened (observed vs expected)?

<!-- paste real output. Terminal output is evidence; a screenshot of
     your expectation is not. -->

### Environment

- Engine version (`vae dev` or the welcome banner): 
- Install channel (source / release tarball): 
- OS: 

### Exit code and E-code (if any)

<!-- exit codes 0–5; E-codes per docs/TROUBLESHOOTING.md -->
```

### 💡 Ideas template

```markdown
### Problem

<!-- What cannot be done today? Quote the doc line or command that
     falls short. -->

### Proposed shape

<!-- The concrete, testable form: command, flag, contract, ADR-worthy
     behavior. Within v1, evolution is additive-only. -->

### How it would be tested

<!-- The gate, test, or measured check that would prove it works. -->

### Alternatives considered

<!-- including "do nothing" -->
```

### 📣 Refutations & counter-evidence template

```markdown
### The claim

<!-- Quote the exact doc line: file + text (e.g. README.md,
     docs/QUICKSTART.md, an ADR). -->

### The evidence

```sh
<!-- the exact command sequence, verbatim -->
```

<!-- paste the full measured output; engine version + OS -->

### Why this contradicts the claim

<!-- one or two sentences. If the engine cannot prove what the docs
     say it proves, this is an engine defect — you found it. -->
```

### 🛠 Show and tell template

```markdown
### What you built

### The evidence

<!-- journal verify output, matching .vxn digests, gate runs — real
     terminal output beats adjectives -->
```

## 4. Issue routing (one topic, one surface)

| Situation | Surface | Then |
|---|---|---|
| Usage question | 🙏 Q&A discussion | Unresolved and reproducible as a defect → issue (`bug_report` template) |
| Defect with evidence | GitHub issue (`bug_report`) | Never a discussion; the template demands journal/receipt output, exit code, engine version |
| Config problem | GitHub issue (`config_report` template) | — |
| Feature proposal | 💡 Ideas discussion | Concrete + testable → issue (`feature_request` template) |
| Something built to show | 🛠 Show and tell discussion | — |
| Claim contradicted by output | 📣 Refutations discussion | Accepted → issue (bug template), referenced back to the refutation topic |
| Security finding | **No public surface** | Private email to `auren@vaerion.dev` per `SECURITY.md` |

Routing is already taught in `CONTRIBUTING.md` and `SUPPORT.md` (Q&A,
Ideas, Announcements, Show and tell links); when the fifth category is
added, both documents gain the Refutations link in the same commit.

## 5. Enable checklist (step by step)

1. [ ] Settings → General → Discussions: **on** (measured enabled during
       the ASCENSION XXV campaign; re-verify state before editing).
2. [ ] Confirm the four existing categories match the table in §1
       (names, types, permissions).
3. [ ] Create **📣 Refutations & counter-evidence** (type: General) with
       the description from §2.
4. [ ] Set Announcements to maintainer-only posting; confirm everyone
       else is read/comment only there.
5. [ ] Configure category forms (settings → Discussions → category
       forms) using the templates in §3; where forms are unavailable,
       pin a template topic as the first post of the category.
6. [ ] Pin one starter topic per category: Announcements — the latest
       release summary; Q&A — the diagnostic ladder (`vae doctor`,
       `journal verify`, exit codes, E-codes); Ideas — the additive-only
       law; Show and tell — one real example; Refutations — the rules
       and the promise that accepted refutations become issues.
7. [ ] Add the Refutations category to `CONTRIBUTING.md`, `SUPPORT.md`,
       and the repo README's community pointers (one commit, tests do
       not pin these files — verify before push).
8. [ ] Triage duty stated in the Maintainer role: weekly Q&A sweep
       (mark answered, open issues for defects), weekly Refutations
       review with a measured accept/reject answer on every topic.
9. [ ] Founder approval recorded before the structural change lands.
