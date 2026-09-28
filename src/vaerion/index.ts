/**
 * Vaerion — Volume IV Implementation Root
 *
 * Scope boundary (recorded as Interpretation Request IR-001):
 * this tree implements ONLY the ratified design constitutional series —
 * VAERION_DESIGN_BIBLE_v1.0, VAERION_VISUAL_SYSTEM_v1.0.1, and
 * VAERION_IMPLEMENTATION_CONSTITUTION_v1.0 (see constitution/INDEX.md).
 * The pre-existing engine product (packages/vaerion/) and the public site
 * (src/components/site/, src/app/) are outside Volume IV scope until a
 * constitutional surface is implemented; they are neither redesigned nor
 * deleted (Constitution 11.4 — historical truth is preserved, never retired).
 *
 * Stage map (foundation/stages.ts — updated per the Founder directive series
 * recorded in constitution/amendments/LEDGER.md):
 *   Stage 1  foundation              (conformant)
 *   Stage 2  registry                (conformant)
 *   Stage 3  primitives              (conformant)
 *   Stage 4  composition             (conformant — three skeletons + ten surfaces)
 *   Stage 5  state                   (conformant — the constitutional state engine)
 *   Stage 6  interaction             (conformant — the interaction engine)
 *   Stage 7  rendering               (conformant — the rendering engine, re-slotted by the directive series)
 *   Stage 8  authorities             (conformant — the seven named data authorities)
 *   Stage 9  testing                 (conformant — the proof system; root src/vaerion/testing per the Stage 9 order)
 *   Stage 10 release                 (conformant — the Release Engine; first receipt issued per F-006)
 *   Stage 11 docs                    (pending)
 *
 * Law: no artifact in this tree may contain a literal visual value
 * (Constitution 1.3); no artifact may exist without a citation
 * (Constitution P-4, Bible Art. XI).
 */

export * from './foundation';
export * from './registry';
