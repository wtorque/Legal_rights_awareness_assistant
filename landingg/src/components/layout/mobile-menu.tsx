"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { allNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
}

export function MobileMenu({ open, onClose, isActive }: MobileMenuProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60] lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-background/60 backdrop-blur-sm transition duration-300 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex justify-end p-3">
        <DialogPanel
          transition
          data-lenis-prevent
          className="glass flex w-full max-w-sm flex-col overflow-y-auto rounded-3xl bg-card/95 p-5 transition duration-500 ease-out-expo data-closed:translate-x-8 data-closed:opacity-0"
        >
          <div className="flex items-center justify-between">
            <DialogTitle as="div">
              <span className="sr-only">Navigation menu</span>
              <Logo />
            </DialogTitle>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
                <X />
              </Button>
            </div>
          </div>

          <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1.5">
            {allNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl p-3 transition-colors duration-300",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl",
                      active ? "bg-primary-foreground/15" : "bg-secondary group-hover:bg-card",
                    )}
                  >
                    <item.icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{item.title}</span>
                    <span
                      className={cn(
                        "block truncate text-xs",
                        active ? "text-primary-foreground/75" : "text-muted-foreground",
                      )}
                    >
                      {item.description}
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              );
            })}
          </nav>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
