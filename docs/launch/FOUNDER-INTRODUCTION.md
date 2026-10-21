# Founder Introduction — draft (Founder approval required to publish)

> For the launch-day pinned post and the About page. First person,
> 300–450 words, no invented biography.
>
> **Update (2026-10-21):** the facts below were updated to the published truth — engine of record `0.1.15` (GA); npm delivers `vaerion 0.1.15` under dist-tag `latest` (published 2026-10-21); PyPI and the signed GitHub Release `v0.1.15` published 2026-10-17; repo of record `https://github.com/VaerionLab/vaerion`.

---

My name is Auren. It is a project identity, not a legal name — the
pseudonym disclosure in `LEGAL.md` records exactly how that resolves, and
I would rather show you the disclosure than perform a biography I did not
live. What I can give you is what I actually hold: a set of engineering
principles, and one system built to enforce them.

The principles are short. Honesty above appearance: a claim carries
evidence or carries an UNVERIFIED marker, and the marker is never removed
because it is inconvenient. Fail-closed beats fail-open: when a system
cannot measure something, it stops rather than guesses. Automation
proposes; humans dispose: no pipeline of mine publishes anything without
a human act. Contracts evolve additively; error codes are never reused;
history is immutable — violations are recorded, never rewritten.

Vaerion exists because of a question I could not answer: can I recompute
what this AI agent just did? Not what it said — what it did, what it
was allowed to do, and can the record be trusted when the process that
wrote it is under audit. The agent ecosystem had models, frameworks,
and dashboards. It did not have the load-bearing part: evidence.

So I built trust infrastructure instead of another agent. Vaerion is
local-first by conviction, not by launch strategy. Trust infrastructure
that phones home is a new problem wearing the costume of a solution. Every
run lands on an append-only, blake3-chained journal; every sensitive
action passes a fail-closed permission broker whose decisions are
journaled; every deliverable builds into a `.vxn` bundle whose identical
inputs produce identical bytes; and zero telemetry is enforced
mechanically — the config guard accepts exactly one value, and a
constitutional check fails the build if anything else tries to egress.

I call the approach constitutional engineering. The project has a
written constitution, 20 architecture decision records, and nine
verification gates that must be green before any commit — 721 tests,
5,277 expectations, 0 failures at the current close. The discipline lives
in mechanisms, not memory. A rule I cannot make the build enforce is a
rule I have not finished engineering.

What comes next is deliberately slow. The release train
runs: version bump, notes, tag, publish dispatch, three-way
verification. The v0.1.15 train executed the publish subset — npm on
2026-10-21 (dist-tag `latest`), PyPI and the signed GitHub Release on
2026-10-17 — with the Founder holding the gate, as always. Homebrew and
winget, the `vaerion.dev` installer URL, and the community server
remain at the gate. Nothing publishes before it is
real, and nothing is announced before it exists.

If you want to know whether any of this holds, do not take my word for
it. The engine ships the tools that check it.

— Auren · auren@vaerion.dev · https://github.com/VaerionLab/vaerion
