"use client";

import { Menu, Search } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { useUiStore } from "@/stores/ui-store";
import { Breadcrumbs } from "./breadcrumbs";
import { JurisdictionMenu } from "./jurisdiction-menu";
import { LanguageMenu } from "./language-menu";
import { NotificationsPopover } from "./notifications-popover";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);

  return (
    <header className="glass sticky top-0 z-40 flex h-16 items-center gap-3 border-x-0 border-t-0 px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation menu">
        <Menu />
      </Button>

      <div className="min-w-0 flex-1">
        <Suspense fallback={null}>
          <Breadcrumbs />
        </Suspense>
      </div>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Search"
        className="hidden h-10 w-64 items-center gap-2.5 rounded-full border border-input bg-card/70 px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground md:flex lg:w-72"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <Kbd>Ctrl/⌘ K</Kbd>
      </button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)} aria-label="Search">
        <Search />
      </Button>

      <div className="flex items-center gap-1.5">
        <JurisdictionMenu />
        <LanguageMenu />
        <NotificationsPopover />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
