"use client";

import { HelpCircle, Keyboard, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { demoUser } from "@/mocks/user";
import { useUiStore } from "@/stores/ui-store";

export function UserMenu() {
  const openShortcuts = useUiStore((s) => s.setShortcutsOpen);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="grid size-10 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        {demoUser.initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium">{demoUser.name}</p>
          <p className="text-xs text-muted-foreground">{demoUser.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast("Sample profile", { description: "Accounts arrive with authentication, which is not built yet." })}>
          <UserRound /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help">
            <HelpCircle /> Help &amp; support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openShortcuts(true)}>
          <Keyboard /> Keyboard shortcuts
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">Demo session · no sign-in</DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
