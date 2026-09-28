"use client";

/**
 * Vaerion — Launch Shell (Phase 12, order section 3; PHASE 17 —
 * EXPERIENCE AWAKENING).
 *
 * The launch website is a THIN routing layer composed on top of the
 * completed systems. PHASE 17 dresses the room — it redesigns no
 * system under it:
 *
 *   - `Aurora` paints the OLED deep-space atmosphere behind every
 *     route (atmosphere, never identity — the official Founder mark
 *     of `brand/official/MANIFEST.md` remains the ONE logo).
 *   - Hash-route changes now carry a cinematic depth transition:
 *     fade + rise + defocus, transform/opacity only, skipped entirely
 *     for reduced-motion users (who get the calm instant swap).
 *   - `#/knowledge` renders the Knowledge Interface (Stage 11, IR-020).
 *   - `#/instrument` — and every unmapped hash — falls through to the
 *     untouched `KnowledgeHostRoute`, the constitutional instrument
 *     (`SurfaceHost`, the ten registered surfaces). Nothing is deleted
 *     (Constitution 11.4).
 *
 * Citations: Phase 12 execution order section 3; Constitution 4.6, 3.11,
 * P-3, P-5, 11.4; IR-018; IR-020; IR-021; Bible Art. XI; PHASE 17
 * mission (page transitions, performance law, reduced motion).
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { KnowledgeHostRoute, KnowledgeInterface } from "@/vaerion/docs";

import { useHashRoute } from "../site/useHashRoute";
import AboutPage from "../site/pages/AboutPage";
import ArchitectureDocsPage from "../site/pages/ArchitectureDocsPage";
import ArchitecturePage from "../site/pages/ArchitecturePage";
import CliPage from "../site/pages/CliPage";
import CommunityPage from "../site/pages/CommunityPage";
import DevelopersPage from "../site/pages/DevelopersPage";
import FaqPage from "../site/pages/FaqPage";
import GettingStartedPage from "../site/pages/GettingStartedPage";
import GovernancePage from "../site/pages/GovernancePage";
import InstallationPage from "../site/pages/InstallationPage";
import HowItWorksPage from "../site/pages/HowItWorksPage";
import LawsPage from "../site/pages/LawsPage";
import PlaygroundPage from "../site/pages/PlaygroundPage";
import ReceiptsPage from "../site/pages/ReceiptsPage";
import SdkPage from "../site/pages/SdkPage";
import SecurityDocsPage from "../site/pages/SecurityDocsPage";
import SecurityPage from "../site/pages/SecurityPage";
import TroubleshootingPage from "../site/pages/TroubleshootingPage";

import { Aurora } from "./glass/Aurora";
import { BootScreen, bootAllowed, markBootShown } from "./BootScreen";
import { LaunchFooter } from "./LaunchFooter";
import { LaunchNav } from "./LaunchNav";
import { DocumentationPortal } from "./pages/DocumentationPortal";
import { LaunchHome } from "./pages/LaunchHome";
import { ObservatoryPage } from "./pages/ObservatoryPage";
import { VisionPage } from "./pages/VisionPage";

/** The launch route map: launch sections first, then the deeper archive. */
const LAUNCH_ROUTES: Record<string, () => ReactNode> = {
  "/": () => <LaunchHome />,
  "/vision": () => <VisionPage />,
  "/runtime": () => <HowItWorksPage />,
  "/architecture": () => <ArchitecturePage />,
  "/developers": () => <DevelopersPage />,
  "/security": () => <SecurityPage />,
  "/documentation": () => <DocumentationPortal />,
  "/observatory": () => <ObservatoryPage />,
  "/download": () => <InstallationPage />,
  // the deeper archive — existing surfaces, unchanged
  "/playground": () => <PlaygroundPage />,
  "/laws": () => <LawsPage />,
  "/receipts": () => <ReceiptsPage />,
  "/governance": () => <GovernancePage />,
  "/about": () => <AboutPage />,
  "/community": () => <CommunityPage />,
  "/docs/getting-started": () => <GettingStartedPage />,
  "/docs/installation": () => <InstallationPage />,
  "/docs/cli": () => <CliPage />,
  "/docs/sdk": () => <SdkPage />,
  "/docs/architecture": () => <ArchitectureDocsPage />,
  "/docs/security": () => <SecurityDocsPage />,
  "/docs/faq": () => <FaqPage />,
  "/docs/troubleshooting": () => <TroubleshootingPage />,
};

export function LaunchShell() {
  const route = useHashRoute();
  const reduce = useReducedMotion();
  const [booting, setBooting] = useState(false);

  useEffect(() => {
    // Decided outside the render → effect → state chain: the boot runs
    // once per session, never for reduced-motion users, and never on the
    // server. The timeout keeps the setState out of the effect body.
    const timer = window.setTimeout(() => {
      if (bootAllowed()) setBooting(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const endBoot = (): void => {
    setBooting(false);
    markBootShown();
  };

  let content: ReactNode;
  if (route === "/knowledge") {
    content = <KnowledgeInterface />;
  } else if (Object.prototype.hasOwnProperty.call(LAUNCH_ROUTES, route)) {
    content = LAUNCH_ROUTES[route]();
  } else {
    // Unmapped hashes keep the historical behavior: the constitutional
    // instrument. Nothing is deleted (Constitution 11.4).
    content = <KnowledgeHostRoute />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Aurora />
      {booting ? <BootScreen onDone={endBoot} /> : null}
      <LaunchNav route={route} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={route}
          className="flex-1"
          initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(5px)" }}
          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {content}
        </motion.main>
      </AnimatePresence>
      <LaunchFooter />
    </div>
  );
}
