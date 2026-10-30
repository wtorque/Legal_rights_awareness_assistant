"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { navSections } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  /** Distinct per instance so the shared-layout indicator doesn't jump between desktop and drawer. */
  indicatorId: string;
}

export function SidebarNav({ collapsed = false, onNavigate, indicatorId }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-6">
      {navSections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <p
            className={cn(
              "px-3 pb-1 text-eyebrow transition-opacity duration-300",
              collapsed && "pointer-events-none h-0 overflow-hidden p-0 opacity-0",
            )}
          >
            {section.title}
          </p>
          {collapsed && <div className="mx-3 mb-1 h-px bg-border first:hidden" />}
          {section.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const link = (
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium transition-colors duration-300",
                  active ? "text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId={indicatorId}
                    className="absolute inset-0 rounded-full bg-primary shadow-soft"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <item.icon className="relative size-[1.15rem] shrink-0" aria-hidden />
                <span className={cn("relative truncate transition-opacity duration-200", collapsed && "opacity-0")}>
                  {item.label}
                </span>
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{link}</div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
