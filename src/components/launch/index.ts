/**
 * Vaerion — Launch layer barrel (Phase 12, order section 3).
 *
 * The launch website architecture: a thin shell composing the mandated
 * sections over the completed systems. The display path is filed as
 * IR-021; the Knowledge Interface path (IR-020) and the ten-surface
 * instrument are preserved behind it.
 *
 * Citations: Phase 12 execution order section 3; IR-018; IR-020; IR-021.
 */

export { LaunchShell } from "./LaunchShell";
export { Logo, Wordmark } from "./Logo";
export { LaunchNav, LAUNCH_SECTIONS } from "./LaunchNav";
export { LaunchFooter } from "./LaunchFooter";
export { BootScreen, bootAllowed, markBootShown } from "./BootScreen";
export { useKnowledge, releaseDate } from "./api";
export type { KnowledgeData, KnowledgeCounts, ReleaseRecordDto, StageDto } from "./api";
