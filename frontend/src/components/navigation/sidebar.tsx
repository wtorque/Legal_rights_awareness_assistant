"use client";

import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { LogoMark, Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { SidebarNav } from "./sidebar-nav";

const EXPANDED = 272;
const COLLAPSED = 80;

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED : EXPANDED }}
      transition={{ duration: 0.4, ease: ease.out }}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-border bg-card/50 lg:flex"
      aria-label="Sidebar"
    >
      <div className={cn("flex h-16 shrink-0 items-center px-5", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/dashboard" aria-label="Aequa overview" className="rounded-full">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
        {!collapsed && (
          <Hint label="Collapse sidebar">
            <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Collapse sidebar">
              <PanelLeftClose />
            </Button>
          </Hint>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-2">
        <SidebarNav collapsed={collapsed} indicatorId="sidebar-active-desktop" />
      </div>

      <div className="shrink-0 space-y-3 border-t border-border p-3">
        {collapsed ? (
          <Hint label="Expand sidebar" side="right">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Expand sidebar" className="mx-auto flex">
              <PanelLeftOpen />
            </Button>
          </Hint>
        ) : (
          <div className="space-y-2 rounded-2xl bg-secondary/60 p-3">
            <MockDataBadge label="Prototype" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Sample data only. General information, not legal advice.
            </p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
