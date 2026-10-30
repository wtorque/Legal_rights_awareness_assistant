import { GlobalSearch } from "@/components/search/global-search";
import { Suspense } from "react";
import { MobileDrawer } from "@/components/navigation/mobile-drawer";
import { Sidebar } from "@/components/navigation/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalShortcuts } from "./global-shortcuts";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { Topbar } from "./topbar";

/** Application frame: collapsible sidebar, sticky topbar, scrolling main column. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh">
        {/* Route-dependent pieces (active item) sit in Suspense so dynamic routes can prerender a static shell. */}
        <Suspense fallback={<aside aria-hidden className="hidden w-68 shrink-0 border-r border-border bg-card/50 lg:block" />}>
          <Sidebar />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main id="main" className="flex-1">
            {children}
          </main>
        </div>
      </div>
      <Suspense fallback={null}>
        <MobileDrawer />
      </Suspense>
      <ShortcutsDialog />
      <GlobalSearch />
      <GlobalShortcuts />
    </TooltipProvider>
  );
}
