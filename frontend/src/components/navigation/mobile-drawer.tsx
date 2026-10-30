"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { SidebarNav } from "./sidebar-nav";

export function MobileDrawer() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onClose={close} className="relative z-[60] lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-background/60 backdrop-blur-sm transition duration-300 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs p-3">
        <DialogPanel
          transition
          className="flex w-full flex-col overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-lift transition duration-500 ease-out-expo data-closed:-translate-x-8 data-closed:opacity-0"
        >
          <div className="mb-6 flex items-center justify-between px-1">
            <DialogTitle as="div">
              <span className="sr-only">Navigation menu</span>
              <Logo />
            </DialogTitle>
            <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Close menu">
              <X />
            </Button>
          </div>
          <SidebarNav onNavigate={close} indicatorId="sidebar-active-mobile" />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
