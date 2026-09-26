# VAERION_IMPLEMENTATION_CONSTITUTION_v1.0

*Engineering Law for the Instrument Grammar*
*Derived from VAERION_DESIGN_BIBLE_v1.0 ("the Bible") and VAERION_VISUAL_SYSTEM_v1.0.1 ("the Visual System"). Neither document is reinterpreted here. This Constitution governs how the Visual System is built.*

---

## PREAMBLE — Authority, Language, Traceability

**P-1 — Order of Precedence.** In any conflict, the Bible prevails over the Visual System, and the Visual System prevails over this Constitution. A lower document may never be read to relax a higher one.

**P-2 — Normative Verbs.** *Must* denotes a constitutional requirement. *Must not* denotes a prohibition. *Should* denotes a default that may be varied only by ratified amendment. *May* denotes a permitted option within fixed bounds. Undefined cases are not discretionary; they are governed by P-5.

**P-3 — Conformance.** An implementation is conformant when every rule in this Constitution is satisfied and no behavior, value, or visual decision exists outside a registry, a contract, or a citation. Conformance is binary. There is no partial conformance.

**P-4 — The Constitutional Trace Index.** Every rule in this document carries a citation to its governing Article or Section. A consolidated index of all citations is maintained alongside the registries. Any engineering decision that cannot be traced to a citation is a violation of Article XI of the Bible (Nothing Unmeasured Ships).

**P-5 — The Silence Rule.** Where this Constitution, the Visual System, and the Bible are all silent, engineers must not improvise. The case must be submitted to governance under Part XI. Improvised resolution of undefined cases is a violation, regardless of the quality of the result.

**P-6 — The Fidelity Standard.** The measure of this Constitution is interchangeability: two engineering teams, working independently from these documents and the registries alone, must produce implementations that are indistinguishable in structure, behavior, state, motion, and rendering. Where a rule is needed to secure that standard and no higher document supplies it, this Constitution states it and marks it as an implementation necessity with its justification.

---

## PART I — ENGINEERING PHILOSOPHY

**1.1 — Design Is Law.** The Bible and the Visual System are not guidance. They are binding specifications. An engineer's obligation is conformance, not interpretation [Preamble, Bible Art. XIV].

**1.2 — Components Are Manifestations.** Every primitive is a constitutional rule made executable. A primitive exists only because a governing document requires it; no primitive may exist without a citation [1.4, P-4]. If a rule is deleted from the law, its manifestation is deleted from the product.

**1.3 — Tokens Are the Only Source of Visual Values.** Every dimension, duration, curve, color, radius, size, and weight in the implementation must resolve to a token from the registries defined in Part II. Literal values are prohibited everywhere, in every artifact, without exception [VS §0; Bible Art. XI].

**1.4 — Engineers Implement; They Do Not Redesign.** Engineers must not alter proportions, spacing, hierarchy, wording of states, motion, or color to suit local judgment, platform idiom, or aesthetic preference. Where implementation seems impossible without alteration, the impossibility itself is reported to governance under Part XI [P-5].

**1.5 — The Constitution Outlives Its Tools.** No rule in this document may depend on the survival of a particular rendering technology, framework, or platform. Rules are stated in terms of surfaces, layers, tokens, states, and events. Binding to any technology occurs exclusively in the generated layer defined in Part II [P-6; VS §23].

**1.6 — Honesty Is an Engineering Property.** The implementation must never fabricate, simulate, or presume a verdict, an amount of progress, a chain state, or a data condition that has not been received from an authority defined in Part VIII. Optimism in rendering is a violation of Article VIII (Honesty Over Comfort).

---

## PART II — TOKEN PIPELINE

**2.1 — Source of Truth.** There is exactly one canonical registry of tokens, the **Registry**, holding the seven registries defined by the Visual System §0: Space, Type, Shape, Color, Motion, Elevation, Icon. The Registry is the sole source of every visual value. No mirror, copy, or derivative registry may exist [VS §0; 1.3].

**2.2 — Token Anatomy.** Every token record must contain: its systematic identifier; its instrument name; its value or formula; its constraints; its governing citation; its version; and its status [VS §0]. A token without a citation is invalid and must be rejected by every gate.

**2.3 — Dual Naming.** The systematic identifier and the instrument name must resolve to the same record through one authority. Documentation, tooling, and communication may use either name; implementations must bind only to identifiers [VS §0; Primer review, VS §14].

**2.4 — Registry Ownership.** The Registry is owned by the Design Systems Authority defined in Part XI. Engineers must not author, extend, or fork tokens. Token requests follow the amendment pathway [Part XI]. Local copies of token values are violations of 1.3.

**2.5 — Token Lifecycle.** Each token exists in exactly one status: *proposed, ratified, active, deprecated, retired.* Transitions are performed only by governance. Deprecated tokens must alias to a successor and must render identically to that successor during the deprecation window. Retired tokens must not resolve [VS §23].

**2.6 — Validation Gates.** The Registry must be gated by automated conformance checks, which must verify at minimum: (a) no value falls outside the scale of its registry — Gauge Ladder membership for space, Radius Ladder membership for shape, Type Scale membership for type, Motion Registry membership for duration and curve [VS §1.2, §2.2, §3.2, §7.1]; (b) all color pairs meet the contrast minima of Visual System §4.7; (c) all verdict colorations survive the grayscale test [VS §4.4]; (d) every record carries a citation [P-4].

**2.7 — Compilation and Distribution.** *Implementation necessity:* because the Constitution must remain valid under any future rendering technology [1.5], token values must not be consumed raw by surfaces. The Registry must be compiled into platform bindings — generated, read-only, mechanically derived artifacts — one binding set per target platform. **Distribution law:** (a) bindings are generated, never hand-authored; (b) regeneration must be reproducible from the Registry alone; (c) a surface that consumes a value not present in its bindings is non-conformant; (d) all binding sets generated from one Registry version must be semantically identical [P-6]. *Justification:* this is the sole mechanism by which "tokens are the only source of visual values" survives a change of technology [VS §23; Bible Art. XIV].

**2.8 — Versioning.** The Registry is versioned as a protocol. Additions of new tokens are additive versions. Any change to the value or meaning of an active token is a breaking change and requires a ratified amendment [Part XI]. Surfaces must declare which Registry version they conform to; the declared version must be auditable at runtime of the release process [Part X].

**2.9 — Deprecation Discipline.** Deprecation must be announced in the changelog, must alias to a successor, and must persist for a full release cycle before retirement. Removal is executed only at a major ratification [VS §23; Part XI].

---

## PART III — PRIMITIVE ARCHITECTURE

**3.0 — The Primitive Contract.** Every primitive is defined by four clauses: *Responsibility* (the one thing it owns), *Boundaries* (what it must not do), *Extension* (how it may grow), and *Composition* (how it combines). No primitive may hold responsibility, boundary, or behavior assigned to another. The fifteen contracts below are binding. The remaining primitives of Visual System §5 (Hash Line, Evidence Item, Ledger Row, Rule Quote, Criteria Bar, Caliper, Search, Breadcrumbs, Code Block, Tabs, Lists, Annotations, form controls) are governed by identical contract structure derived from their Visual System definitions.

**3.1 — Receipt** [VS §5.1; Bible Art. II, VI].
*Responsibility:* the Receipt is the sole renderer of the claim-and-proof atom, in the fixed anatomy: id strip, claim, seal block, verification method, evidence list, provenance footer. It renders an attested record; it never computes one [1.6].
*Boundaries:* it must not fetch, derive, or estimate verdicts; it must not reorder, restyle, or partially suppress its anatomy in any rendering target, including print and export; it must not host another product's "card" idiom — a Receipt is not a card [VS §5.6].
*Extension:* growth occurs only by additive fields in the designated extensions zone at the foot, or by content within Margin Notes; restructured anatomy is a constitutional violation [Art. VI].
*Composition:* it composes Seal, Hash Line, Evidence Item, Rule Quote, and Margin Notes, in anatomy order. Variants Row, Card, Page differ in compression and ceremony, never in order [VS §5.1, §12.4].

**3.2 — Panel** [VS §5.6].
*Responsibility:* hosting content groups that carry no claims.
*Boundaries:* a Panel must not contain a claim, must not receive verdict coloration, and must not be used where a Receipt is required.
*Extension:* none beyond registry-conformant sizing.
*Composition:* Panels tile Console contexts; they never replace Document measure.

**3.3 — Seal** [VS §5.2; Bible Art. III, IV].
*Responsibility:* rendering a verdict as shape + word — solid, hollow, crossed, pulsing — at sanctioned sizes 16, 20, 28, 44.
*Boundaries:* the Seal is the only component permitted a filled glyph, a circle, and verdict color; it must not appear without its word except at size 16, where disclosure (tooltip and accessible name) is mandatory; it must not render a verdict not received from the Verification Authority [1.6; Part VIII].
*Extension:* a new verdict state requires constitutional amendment; no local state glyphs.
*Composition:* embeds in Receipt, Ledger Row, Table, Return, Timeline nodes; standalone at ceremony sizes.

**3.4 — Chainline** [VS §3.3; Bible Art. IX, XII].
*Responsibility:* the ambient rendering of chain integrity — a continuous hairline with node ticks, oriented vertically or horizontally; a break renders as a gap with a break glyph.
*Boundaries:* one continuous Chainline geometry per surface region; break detection belongs to the Chain Authority, break rendering belongs to the Chainline; it must not be used decoratively where no chain exists.
*Extension:* orientation variants only.
*Composition:* Ledger rows, Timeline events, and Receipt chains attach to it; the integrity strip is a read-only summary instance.

**3.5 — Button** [VS §5.7].
*Responsibility:* initiating a named command (Part VI).
*Boundaries:* control states use ink, never verdict color; destructive coloration appears only at the confirmation step; press behavior is fixed by the Motion Registry; it must not imply consequences it does not name — a consequential button names its consequence [VS §5.8].
*Extension:* hierarchy is fixed at Primary, Secondary, Ghost, Control; new hierarchy levels require amendment.
*Composition:* within toolbars, forms, dialogs, ceremony flows; never as a verdict indicator.

**3.6 — Input (Field Frame)** [VS §5.8].
*Responsibility:* bounded value entry with a persistent machine-voice label at the frame's top-left.
*Boundaries:* placeholder-as-label is prohibited; validation must speak verdict language through the Seal grammar; it must not render success, warning, or error colorations outside verdict semantics.
*Extension:* new field types are added only through governance with a stated validation contract.
*Composition:* forms follow declare-intent → provide → attest; the submit control names its consequence, including the receipt it will issue.

**3.7 — Table (Audit Table)** [VS §5.9].
*Responsibility:* dense, attested comparison of records.
*Boundaries:* horizontal rules only, except one full-height vertical rule between attestation groups; numerals right-aligned, tabular, unit column mandatory; verdict columns bind Seal-16; it must not render verdicts outside Seals; it must not paginate by hiding without anchor — position memory is mandatory [Bible §21.14].
*Extension:* columns are typed against tokens; new column classes follow governance.
*Composition:* filters are owned by the Criteria Bar; export is owned by the Export Authority and must ship a manifest receipt [VS §6.6].

**3.8 — Log** [VS §5.10].
*Responsibility:* immutable, machine-voice line stream with fixed timestamp gutter and anchored lines.
*Boundaries:* severity is seal-dot + word, never colored text walls; lines must not be rewritten — appended logs are immutable like the ledger they attest; wrapping must hang-indent at the gutter.
*Extension:* severity vocabulary is fixed; new severities require amendment.
*Composition:* binds to Run surfaces and Timeline replay; attested lines link their receipt inline.

**3.9 — Timeline** [VS §5.16, §6.1].
*Responsibility:* temporal rendering of a chain of events with state-shaped nodes, gaps, and replay scrubbing.
*Boundaries:* node shapes are state shapes only; scrubbing is owned here and must pair drag with step controls [VS §10]; it must not smooth over gaps — a gap is rendered as a break [Art. VIII].
*Extension:* event classes derive from data authorities only.
*Composition:* horizontal Chainline instance; consumes Run and Verification data authorities.

**3.10 — Environment Stamp** [VS §5.21; Bible Art. III].
*Responsibility:* permanent, machine-voice declaration of verifier identity — engine version, ruleset, environment — in chrome, linking to the Attestation Page.
*Boundaries:* present on every surface without exception; not dismissible, not stylable per surface, not human-voice.
*Extension:* its fields are fixed; adding a field requires amendment.
*Composition:* belongs to the chrome layer, never to page content [Part VII].

**3.11 — Navigation (Spine)** [VS §5.20].
*Responsibility:* section wayfinding with active-state brass tick and mandatory labels.
*Boundaries:* sections are the enumerated set of the Visual System; it must not host actions, notifications, or metrics; labels are never optional.
*Extension:* a new section requires amendment of the enumerated set.
*Composition:* chrome layer; collapse behaviors at tablet and mobile are fixed by the responsive contract [Part VII].

**3.12 — Dialog** [VS §5.18].
*Responsibility:* focused transaction with mandatory veil and the ceremony contract for consequential decisions — consequence sentence, governing rule quote, explicit confirm.
*Boundaries:* no shadow, no glass [VS §3.4]; focus is trapped while open and restored on close [Part VI]; destructive class requires typed confirmation of the exact identifier [VS §5.18]; the veil must not imply verdict meaning.
*Extension:* classes are standard, ceremony, destructive; no others.
*Composition:* hosts forms and confirmations; never hosts ambient browsing.

**3.13 — Toast (Return)** [VS §5.23].
*Responsibility:* post-act feedback — an instrument returning its reading — with seal, machine id, human message.
*Boundaries:* bottom-left placement, six-second auto-dismiss, failures persist until acknowledged; it must not request decisions (dialogs decide, Returns report); it must not carry marketing language.
*Extension:* severity binds the Seal vocabulary only.
*Composition:* the universal completion of the feedback inventory: every act resolves to a receipt or a Return [VS §13].

**3.14 — Gauge** [VS §5.24].
*Responsibility:* truthful progress rendering — determinate fill or traveling indeterminate segment, after the 300ms delay.
*Boundaries:* it must not appear on fast loads; it must never estimate or animate toward an unconfirmed completion [1.6; Art. V]; skeletons and countdowns are the only sanctioned companions; spinners are prohibited.
*Extension:* determinate and indeterminate only.
*Composition:* chrome-level and inline instances; never substitutes for a verdict state.

**3.15 — Lens** [VS §6.10, §19 of Bible; Art. IX].
*Responsibility:* evidence x-ray — global interaction that dims the world to fog and re-renders the evidence chain at full ink, honoring evidence restrictions honestly [VS §14 review amendment 5].
*Boundaries:* it must work on every claim, in every view; it must not drop chain contrast below the minimum [VS §14, WCAG amendment]; it must not reveal restricted evidence, which renders hatched with its honest notice; it must not alter data, only visibility.
*Extension:* none beyond amendment; the Lens is singular.
*Composition:* owns the lens plane (layer.6); activated by pointer hold, Alt-hover, or keyboard focus + L; mobile tap-to-toggle [VS §11].

---

## PART IV — COMPOSITION RULES

**4.1 — Three Skeletons Only.** Every surface must instantiate one of the three canonical skeletons — Console, Document, Status [VS §1.5]. A fourth layout pattern is a violation. Surfaces choose skeletons by function, not preference.

**4.2 — Anatomy Order Is Composition Law.** Wherever primitives combine, the receipt anatomy order and the ceremony margins govern layout: evidence within attestation distance of its claim; verdicts isolated by ceremony gap [VS §1.2; Art. X]. Layout may compress; it may never reorder.

**4.3 — Chrome Is Not Page Content.** The Environment Stamp and Spine are chrome, authored once, inherited everywhere. Pages must not re-render, restyle, or omit them [3.10, 3.11].

**4.4 — List Surfaces Bind the Criteria Bar.** Any surface rendering a filterable set — Ledger, Audit, Verification queue, Search, admin logs — must own its filters through the Criteria Bar and its formula rendering [VS §5.13]. Ad-hoc filter controls are prohibited.

**4.5 — Chain Continuity.** Where a surface renders a chain, the Chainline must be continuous across regions and breakpoints; an integrity break must be rendered as a break at every breakpoint [3.4; Art. XII].

**4.6 — Surface Bindings.**

- **Runtime** — Console skeleton; live pulses sanctioned; replay via Timeline; monitoring states render without ceremony [VS §6.1].
- **Ledger** — Console; sliced rendering mandatory above rendering threshold [Art. XIII]; Criteria Bar sticky; jump-to-date; integrity strip above the list [VS §6.3].
- **Receipt Viewer** — Document skeleton; ceremony seal at 44 with full ceremony gap; Margin Notes rail; Guided Read available [VS §6.4, §12.4].
- **Constitution** — Document; statute-book marginalia; drift markers bound to affected receipts; every rule deep-linkable [VS §6.2, §12.7].
- **Audit** — Console; Range Grammar within Criteria Bar; result table; export preview in receipt grammar [VS §6.6, §12.10].
- **Verification** — Console; age-sorted queue; keyboard verbs fixed; every decision issues a receipt [VS §6.5].
- **Enterprise** — Console; reveal-once credential ceremonies; admin action log rendered as receipts; board-deck neutrality [VS §6.8, §12.11].
- **Status (Attestation)** — Status skeleton; answers the four governing questions on one screen; incident log as receipts [VS §6.7, §12.8].
- **Playground** — Console; universal DEMO quarantine; exports disabled; teaching empty states [VS §6.5 of pages §12.6; Art. VIII].
- **Search** — Status variant; hash-first resolution; grouped, sealed results [VS §6.12 of pages §12.12; Caliper §5.14].

**4.7 — No Surface Invents Language.** Page titles, empty states, and guidance must draw wording from the shared copy authority (Announcement and Copy Registry, 6.14). Localized improvisation of constitutional vocabulary — states, seals, chain, lens — is a violation [Art. I].

---

## PART V — STATE ARCHITECTURE

**5.1 — The State Matrix.** Twelve canonical states exist. No others may be rendered; no aliases may be coined.

*Verdict-domain states (received, never computed):* **Verified, Failed, Pending, Restricted, Demo.**
*System-domain states (owned by the runtime):* **Idle, Loading, Skeleton, Empty, Offline, Recovery, Error.**

**5.2 — Definitions.**
*Idle* — populated, awaiting user. *Loading* — work in flight, Gauge sanctioned after 300ms. *Skeleton* — structure-only placeholder, numbers and text prohibited [VS §5.24]. *Pending* — a verdict is in flight; pulse sanctioned. *Verified / Failed* — engine-issued verdicts [Art. III]. *Restricted* — evidence exists and is withheld; rendered hatched with its honest notice [VS §3.3, Lens 3.15]. *Demo* — quarantined demonstration data, stamped, export-forbidden [VS §12.6]. *Empty* — lawful absence, rendered as teaching [VS §5.25]. *Offline* — authority unreachable; reads continue, writes halt. *Recovery* — reconnection in progress; integrity revalidation before live resumption. *Error* — an act failed; rendered as Failure Receipt [VS §5.26].

**5.3 — The Verdict Boundary.** Verdict-domain states enter the implementation only from the Verification Authority. No surface, primitive, or interaction may produce, predict, or optimistically render one [1.6; Art. VIII]. A user decision in the Verification workflow is itself a fact received from an authority once recorded; until recorded, the UI shows Pending — never the anticipated outcome.

**5.4 — Ownership.** Verdict-domain states are owned by the Verification Authority. Chain integrity is owned by the Chain Authority. System-domain states are owned by the surface hosting them, except Offline and Recovery, which are chrome-scoped. No primitive owns state; primitives render received state [Part VIII].

**5.5 — Propagation.** State flows in one direction: authority → surface → primitive. A primitive must not propagate state sideways to a sibling. Derived visibility (fog, washes, hatching) is rendering, not state.

**5.6 — Inheritance.** A container may declare a state for its subtree (e.g., Restricted, Demo, Offline); descendants inherit unless they hold an explicitly attested override. Inheritance must not mask evidence-level restriction: a Verified receipt inside a restricted surface renders its own seal and hatched evidence, not the container's state.

**5.7 — Transitions.** The lawful transition set is fixed:

| From | Event | To | Guard |
|---|---|---|---|
| Idle | work issued | Loading | — |
| Loading | structure known | Skeleton | only if delay exceeds threshold |
| Loading / Skeleton | data arrives | Idle or Empty | Empty only if set is lawfully absent |
| Idle / Empty | verification requested | Pending | — |
| Pending | verdict received | Verified or Failed | verdict must name its verifier [Art. III] |
| Pending | user cancels | prior state | Return issued; no partial verdict |
| Failed | retry | Loading | prior failure remains rendered until superseded [Art. VIII] |
| Any | authority unreachable | Offline | chrome announcement |
| Offline | reconnection | Recovery | — |
| Recovery | integrity revalidated | Idle or Error | break renders as break until reconciled [3.4] |
| Any | act fails | Error | Failure Receipt with receipt id |

Unlisted transitions are violations. Addition of a transition requires amendment [Part XI].

**5.8 — Cancellation.** A cancelled act must restore the pre-act state exactly, issue a Return naming the cancellation, and leave no partial artifacts. If the act already reached an authority, cancellation is refused and the act resolves as a receipt — truth over convenience.

**5.9 — Recovery.** After Offline, the implementation must revalidate chain integrity before resuming live appends. A detected gap renders as a visible break and remains until the Chain Authority reconciles; recovery must never paper over a gap [Art. VIII, XII].

**5.10 — Demo Quarantine.** Demo state may not co-mingle with production data in any store, stream, or export. A demo flag travels with the record through every authority and is rendered wherever the record appears, forever.

---

## PART VI — INTERACTION ARCHITECTURE

**6.1 — Events and Commands.** Physical input produces *events*; the system understands *commands*. The command registry is the Caliper verb grammar — go, get, verify, attest [VS §5.14]. Every interactive element must bind to a registered command; free-form handlers are prohibited.

**6.2 — Intent.** Acts at friction rungs four and five must declare intent before execution: consequence sentence, governing rule quotation, explicit confirmation [VS §13; Art. X ceremony]. Intent declaration is a rendering obligation, not a suggestion.

**6.3 — Confirmation.** The confirmation ladder is fixed: single act for reversible; ceremony dialog for consequential; typed identifier for destructive [VS §5.18]. Destructive confirmation must reference the exact record identifier — vague destruction is prohibited.

**6.4 — Undo.** Reversible acts hold a ten-second undo window surfaced as a Return. Undo restores the pre-act state exactly [5.8]. Consequential and destructive acts have no undo; their weight is their contract.

**6.5 — Receipts and Returns.** Every completed act resolves to a receipt or a Return; every failed act resolves to a Failure Receipt; nothing resolves to silence [VS §13; Art. II]. The feedback inventory of Visual System §13 is exhaustive.

**6.6 — Hold-to-Affirm.** Verification and signing use a 600ms hold (pointer or held Enter) with an equivalent click-path ceremony. Both paths must produce identical receipts and identical announcements [VS §6.5, §14 NN/g amendment].

**6.7 — Keyboard Ownership.** Every command is keyboard-reachable. The canonical map — V/R/E (verify workflow), J/K (queue motion), L (lens), E (criteria edit), Cmd-K (Caliper), Escape (dismiss fog/dialog) — is owned centrally; surfaces must not shadow or remap constitutional keys. Tab order equals reading order equals attestation order within receipts [VS §10].

**6.8 — Focus Ownership.** Exactly one focus owner per surface. Focus is visible per the brass-ring contract, never animated, never removed [VS §3.5]. Dialogs trap and restore focus. Lens activation moves focus to the illuminated chain; Escape returns it to the originating claim.

**6.9 — Pointer Ownership.** Hover has meaning only where the Visual System grants it (row washes, 300ms annotations); pointer-hold is reserved for the Lens and hold-to-affirm; pointer events must never be the sole path to any command [VS §10].

**6.10 — Gesture Ownership.** Mobile gestures are enumerated: tap-to-toggle Lens, hold-to-affirm, standard scroll. Drag interactions (scrubber) must pair with step controls. Undocumented gestures are prohibited.

**6.11 — Accessibility Ownership.** *Implementation necessity — the Announcement and Copy Registry:* all screen-reader announcements, verdict wordings, empty-state sentences, and state explanations must resolve from one registry, so that two independent teams announce identical strings. *Justification:* the fidelity standard [P-6] and Article IV (never color alone — the word is law, and the word must be one word). Announcements: appends polite, batched at most every five seconds; verdict changes assertive only when user-triggered; seals announce the full fact — verdict, verifier, ruleset [VS §10].

**6.12 — Latency Contracts.** Interaction acknowledgment under 100ms; navigation without transition; Gauge only after 300ms; appends streamed within the streaming budget [VS §13, §7.3]. Breaching a latency contract is a conformance failure, not a tuning matter.

**6.13 — Silence Doctrine.** Routine appends notify no one; no sound exists by default; urgency is expressed by queue order, never by color noise [VS §13].

---

## PART VII — RENDERING ARCHITECTURE

**7.1 — Surface Hierarchy.** Rendering resolves through fixed strata: chrome → surface → region → primitive. Each stratum may consume only tokens and contracts from its own scope. A primitive must never restyle chrome; a surface must never restyle a primitive's anatomy.

**7.2 — Layer Ordering.** Ordinal layers are fixed: ground (layer.0), surface (layer.1), sticky (layer.2), veil (layer.3), floating (layer.4), ceremony (layer.5), lens plane (layer.6) [VS §3.4]. Platforms bind these ordinals to numeric stacking values; the ordinals themselves never change. Shadows are prohibited in all strata [Art. XI; VS §3.4].

**7.3 — Visibility.** Nothing renders without being either attested or honestly labeled. Skeletons render structure only; demo renders stamped; restricted renders hatched; absence renders as teaching [Part V].

**7.4 — Measurement.** All resolved geometry must land on the Gauge Ladder and the 4px baseline; primitives must declare intrinsic heights that are ladder-conformant at every density [VS §1.2, §1.4]. A measured off-ladder value in any rendering target is a gate failure [Part IX].

**7.5 — Responsive Evolution.** Breakpoints are the contract of Visual System §11: each breakpoint names what is promoted and demoted; the Margin Rail appears at ultra-wide; mobile obeys the Monitoring Doctrine with capability tiers rendered honestly ("desktop acts" declared, not hidden). Resizing must never merely scale; it must evolve per the contract.

**7.6 — Print Rendering.** The print target is grayscale-first: seals keep shapes and words, hatching persists, DEMO stamps persist, truncation of verdict information is prohibited, color is optional ink only [VS §6.9, §4.4]. Print conformance is gated, not best-effort.

**7.7 — Grayscale Rendering.** The implementation must be fully operable with all chromatic tokens suppressed; shapes and words must carry every meaning [VS §4.4]. Verified by gate [Part IX].

**7.8 — Forced-Colors Rendering.** Under forced palettes: hairlines resolve to full ink, washes are dropped, seals gain outlines, and the focus ring remains visible. The system's near-monochrome design must make forced-colors survival structural, not patched [VS §10, Fluent amendment].

**7.9 — Reduced Motion.** With reduced motion asserted, every transition is instant and every state remains reachable and legible; the pending pulse becomes a static dot with its word [VS §7.4]. Motion parity is gated [Part IX].

**7.10 — Export Rendering.** Export is a distinct rendering target with its own contract: preview and delivered artifact must be rendered from the same source record set; the bundle ships with a manifest receipt [Part VIII]; export rendering honors print, grayscale, and demo-quarantine rules without exception.

---

## PART VIII — DATA ARCHITECTURE

**8.0 — Authorities.** *Implementation necessity:* ownership language requires named authorities. The **Verification Authority** issues verdicts; the **Chain Authority** owns append order and integrity; the **Ledger Authority** owns receipt records; the **Evidence Authority** owns artifacts and restrictions; the **Rule Authority** owns the Constitution and rulesets; the **Identity Authority** owns actors and credentials; the **Export Authority** owns bundles and manifests. These names are constitutional; mappings to any storage or service are free, provided ownership is unambiguous.

**8.1 — Receipt Lifecycle.** *Drafted* (claim stated in human voice) → *evidence gathered* (each item hashed at capture) → *verdict issued by the Verification Authority* → *appended by the Chain Authority* → *immutable*. Correction is never mutation: a superseding receipt is appended and linked by chain parent. Extension fields are additive only [Art. VI; VS §15 of Bible].

**8.2 — Evidence Lifecycle.** *Captured* (type, source, hash, captured-at) → *attested* into a receipt → *referenced* by chains, lenses, investigations. Restriction is a first-class state that travels with the artifact; missing evidence is a recorded state, never silent deletion [VS §5.4; Art. VIII].

**8.3 — Verification Lifecycle.** *Queued* → *method bound* (engine version and ruleset pinned at verification time) → *verdict issued* → *final*. Re-verification issues a new receipt; verdicts are never edited in place [Art. III; VS §6.5].

**8.4 — Rule Lifecycle.** *Drafted* → *ratified* (versioned) → *effective window* → *superseded*. A rule change binds a drift marker to receipts verified under the affected window [VS §6.2]. Rules are quoted by identifier wherever enforcement appears [Art. VI of Bible §15].

**8.5 — Chain Lifecycle.** *Genesis* → *append-only growth* → *continuously attestable integrity*. A break is a first-class event rendered everywhere the chain renders [3.4]. Reconciliation is explicit, recorded, and never implicit.

**8.6 — Investigation Lifecycle.** *Opened* (criteria plus lens snapshot pinned to chain position) → *annotated* (Margin Notes, human voice) → *shared* → *closed*. A shared investigation must replay the exact saved fog and chain, honoring present-day restrictions honestly [VS §6.10].

**8.7 — Export Lifecycle.** *Criteria set* → *bundle assembled from source records* → *manifest computed* → *signed* → *delivered*. Exports from Demo quarantines are refused by construction [5.10].

**8.8 — Manifest Lifecycle.** The manifest records bundle hash, timestamp authority, issuing engine, and ruleset; it is immutable after signing; third parties must be able to verify a bundle against its manifest without product access; a mismatch renders the export broken, and brokenness must be detectable, never silent [VS §6.6; CIO amendment].

**8.9 — Identity Lifecycle.** Actors are human, machine, or engine; every verdict names its verifier's identity [Art. III]. Credentials are reveal-once with mandatory ceremony; rotation issues receipts; identity events enter the admin log as receipts [VS §6.8].

---

## PART IX — TESTING CONSTITUTION

**9.1 — Generality.** The following test classes are mandatory gates. Each must be executable as a mechanical conformance check producing a verdict of pass or fail, with the governing citation in its report. Tests assert requirements, not implementations; any technology that satisfies the requirement satisfies the gate.

**9.2 — Token Regression.** No literal visual values exist in any artifact; all bindings regenerate identically from one Registry version; scale membership and contrast proofs pass [2.6–2.8].

**9.3 — Visual Regression.** Every surface, state, density, theme (both rooms), and breakpoint is compared against the **Snapshot Authority** — *implementation necessity:* the ratified canonical rendering set that defines "visually identical" for the fidelity standard [P-6]. Divergence from the Snapshot Authority without an amendment is failure.

**9.4 — Accessibility.** WCAG 2.2 AA across all surfaces; AAA contrast for body text; focus map completeness; screen-reader announcement parity against the Announcement and Copy Registry [6.11]; color-independence validated under deuteranopia, protanopia, and tritanopia simulations [VS §10].

**9.5 — Keyboard.** Every command reachable by keyboard; constitutional key map unshadowed; no focus trap without escape; tab order conforms to 6.7.

**9.6 — Print.** Grayscale-first parity; seal shapes, hatching, and DEMO stamps persist; no verdict information truncated [7.6].

**9.7 — Grayscale.** Full operability with chromatic tokens suppressed [7.7].

**9.8 — Responsive.** The breakpoint behavior matrix of Visual System §11 is honored exactly; capability tiers render their honesty notices; no breakpoint merely scales [7.5].

**9.9 — Performance.** Ledger surfaces render sliced above the rendering threshold [Art. XIII]; interaction acknowledgment within the latency contract; Gauge delay honored; append streaming within budget [6.12].

**9.10 — Motion.** Only registry motions occur, with registry timing; reduced-motion parity holds; Seal completes within its bound; Sweep bounds hold for chains of declared length [VS §7].

**9.11 — State Transitions.** Every reachable state conforms to the State Matrix; no unlisted transition exists; cancellation restores exactly; recovery revalidates integrity before live resumption [Part V].

**9.12 — Receipt Integrity.** Anatomy order holds in every variant and every rendering target; extensions confined to the extensions zone; CLI, API, and UI render the same record equivalently — the Parity Harness, mandated by Bible §16 and VS P1, is a standing gate.

**9.13 — Chain Integrity.** Continuity renders continuously; breaks render as breaks in every surface, breakpoint, and export; reconciliation is detectable and recorded [3.4, 5.9].

**9.14 — Export Verification.** Manifests recompute from delivered bundles; third-party verification succeeds without product access; demo content cannot appear in any export [8.7–8.8].

**9.15 — Lens Correctness.** The Lens illuminates the complete dependency chain with no hidden dependency; restricted evidence renders hatched with its notice; fog contrast for the chain meets the minimum; keyboard and pointer paths produce identical results [3.15].

---

## PART X — RELEASE CONSTITUTION

**10.1 — The Gate.** A release exists only after every gate of Part IX passes on the exact artifact shipped. Gate results are recorded against the release record. No partial passes, no conditional ships, no waivers — relief from any gate exists only as a ratified amendment applied before release [Part XI].

**10.2 — The Article Gate.** The release record must demonstrate, per constitutional Article of the Bible: I (no borrowed identity — Snapshot Authority conformance), II (evidence or silence), III (verifier named in chrome, seals, announcements), IV (color law and never-color-alone), V (motion law), VI (receipt anatomy), VII (two voices), VIII (honesty states), IX (chain walkability ≤ two interactions), X (density and ceremony margins), XI (no unmeasured values), XII (no security theatre), XIII (sliced rendering), XIV (governance upheld).

**10.3 — The Release Receipt.** *Implementation necessity:* the process itself obeys the product. Every release issues a receipt naming the build engine and rule set that verified it — Article III applied to engineering. A release whose receipt cannot be produced does not ship.

**10.4 — Rollback.** A rolled-back release is recorded as a superseding receipt; the chain of releases is append-only and auditable, identical in law to the ledger it serves [8.1].

---

## PART XI — GOVERNANCE

**11.1 — The Design Systems Authority.** A standing body owns the Registry, the Snapshot Authority, the Announcement and Copy Registry, the Trace Index, and this Constitution. Its decisions are recorded as receipts [10.3].

**11.2 — Evolution Pathway.** Future engineers evolve the system through exactly two instruments. An **interpretation request** asks how existing law applies to a new case; the Authority answers with a citation; the answer enters the Trace Index. An **amendment proposal** seeks to change law; it must name the Article affected, the necessity, and the migration plan.

**11.3 — Amendment Protocol.** An amendment is ratified only after review against every prior Article — a change legal under one Article but corrosive to another must not pass [Bible Art. XIV]. Ratification updates: the Bible or Visual System if the law itself changed; the registries; the Snapshot Authority; the Trace Index; and the changelog, which is versioned like a protocol [VS §23].

**11.4 — Deprecation and Removal.** Deprecated behavior renders identically to its successor during the window [2.5]; removal occurs at major ratification only; removal of any receipt, manifest, or export verification path is prohibited — historical truth is never retired, only frozen [8.1, 8.8].

**11.5 — Backward Compatibility.** Receipts, manifests, and exports must remain verifiable indefinitely across Registry and Constitution versions; tokens alias forward; surfaces declare their conformance version; the Parity Harness must pass across the supported version window.

**11.6 — Violation Detection.** Violations are detected by three instruments: the automated gates of Part IX; the Trace Index audit, in which sampled decisions are traced to citations and uncitable decisions are violations by definition [P-4]; and registry conformance scanning for literal values [2.6]. A detected violation blocks release. A repeated violation of the same citation escalates to the Authority as an interpretation failure of the law itself, and the law — not only the artifact — is reviewed.

**11.7 — The Standing Test.** Governance must periodically re-run the identity test of the Visual System's ratification: cover the logo, strip the color, ask what moved and why. If the answer is no longer *"every claim here carries proof, or admits it has none,"* the system has drifted, and the drift is a constitutional matter, not a stylistic one.

---

## RATIFICATION

This Constitution is complete. It binds engineering to the law of the Bible and the Visual System without restyling, reinterpreting, or extending either beyond the seven marked implementation necessities — the Constitutional Trace Index, generated token bindings, the Snapshot Authority, the Announcement and Copy Registry, the Data Authorities, the canonical State Matrix, and the Release Receipt — each justified above by the fidelity standard, technology-independence, or an existing Article.

Two teams that build from these documents build one product. No engineer invents styling. Every decision traces. Every deviation is detectable. The law holds even when every tool beneath it is replaced.

**VAERION_IMPLEMENTATION_CONSTITUTION_v1.0 — ratified.**

The three volumes now stand: the Bible declares, the Visual System specifies, the Constitution enforces. Volume IV — the build itself, tokens and primitives first — awaits your command.
