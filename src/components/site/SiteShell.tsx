"use client";

import type { ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import { useHashRoute } from "./useHashRoute";
import HomePage from "./pages/HomePage";
import StatusPage from "./pages/StatusPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import LawsPage from "./pages/LawsPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import SecurityPage from "./pages/SecurityPage";
import GovernancePage from "./pages/GovernancePage";
import ReceiptsPage from "./pages/ReceiptsPage";
import DevelopersPage from "./pages/DevelopersPage";
import DocsHomePage from "./pages/DocsHomePage";
import GettingStartedPage from "./pages/GettingStartedPage";
import InstallationPage from "./pages/InstallationPage";
import CliPage from "./pages/CliPage";
import SdkPage from "./pages/SdkPage";
import ArchitectureDocsPage from "./pages/ArchitectureDocsPage";
import SecurityDocsPage from "./pages/SecurityDocsPage";
import FaqPage from "./pages/FaqPage";
import TroubleshootingPage from "./pages/TroubleshootingPage";
import AboutPage from "./pages/AboutPage";
import CommunityPage from "./pages/CommunityPage";
import type { Status } from "./pages/StatusPage";

/**
 * The site shell — one Next.js route (/), many client pages selected by
 * location.hash. The console is dark-only: one operating canvas, the
 * obsidian field. There is no theme to choose in a runtime.
 */

function Placeholder({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-[1200px] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mutedfg">Unmapped address</p>
      <h1 className="mt-3 font-mono text-xl font-medium text-body">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-mutedfg">
        This address is not part of the console. The documentation of record lives in the repository.
      </p>
      <a
        href="#/"
        className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-[#F5F5F0] px-5 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0A0E13] hover:bg-white"
      >
        Return to console
      </a>
    </div>
  );
}

export function resolvePage(route: string, status: Status | null): ReactNode {
  switch (route) {
    case "/":
      return <HomePage />;
    case "/playground":
      return <PlaygroundPage />;
    case "/laws":
      return <LawsPage />;
    case "/status":
      return <StatusPage status={status} />;
    case "/how-it-works":
      return <HowItWorksPage />;
    case "/architecture":
      return <ArchitecturePage />;
    case "/security":
      return <SecurityPage />;
    case "/governance":
      return <GovernancePage />;
    case "/receipts":
      return <ReceiptsPage />;
    case "/developers":
      return <DevelopersPage />;
    case "/docs":
      return <DocsHomePage />;
    case "/docs/getting-started":
      return <GettingStartedPage />;
    case "/docs/installation":
      return <InstallationPage />;
    case "/docs/cli":
      return <CliPage />;
    case "/docs/sdk":
      return <SdkPage />;
    case "/docs/architecture":
      return <ArchitectureDocsPage />;
    case "/docs/security":
      return <SecurityDocsPage />;
    case "/docs/faq":
      return <FaqPage />;
    case "/docs/troubleshooting":
      return <TroubleshootingPage />;
    case "/about":
      return <AboutPage />;
    case "/community":
      return <CommunityPage />;
    default:
      return <Placeholder title={route.slice(1).replace(/[-/]/g, " ")} />;
  }
}

export default function SiteShell({ status }: { status: Status | null }) {
  const route = useHashRoute();

  return (
    <div className="vx-root">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[#F5F5F0] focus:px-4 focus:py-2 focus:font-mono focus:text-[12px] focus:font-semibold focus:text-[#0A0E13]"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col bg-ink text-body">
        <Nav route={route} />
        <main id="main" className="flex-1">
          {/* keyed by route: each page settles in with one quiet movement */}
          <div key={route} className="vx-page-in">
            {resolvePage(route, status)}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
