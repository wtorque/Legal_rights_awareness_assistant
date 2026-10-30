"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { primaryNav, settingsNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div
          className={cn(
            "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full px-3 pl-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out-expo sm:h-15",
            scrolled ? "glass" : "border border-transparent",
          )}
        >
          <Link href="/" aria-label="Aequa home" className="rounded-full">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                    active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn("hidden lg:inline-flex", isActive(settingsNav.href) && "bg-secondary")}
            >
              <Link href={settingsNav.href} aria-label="Settings" title="Settings">
                <settingsNav.icon />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} />
    </>
  );
}
