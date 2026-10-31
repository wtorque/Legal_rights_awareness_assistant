"use client";

import { HelpCircle, Keyboard, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLiveBackend } from "@/lib/api-config";
import { demoUser } from "@/mocks/user";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";

export function UserMenu() {
  const openShortcuts = useUiStore((s) => s.setShortcutsOpen);
  const router = useRouter();
  const account = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const profile =
    isLiveBackend && account
      ? { name: account.name, email: account.email, initials: account.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() }
      : demoUser;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="grid size-10 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        {profile.initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium">{profile.name}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </div>
        <DropdownMenuSeparator />
        {!isLiveBackend && (
          <DropdownMenuItem onSelect={() => toast("Sample profile", { description: "Accounts need a running backend." })}>
            <UserRound /> Profile
          </DropdownMenuItem>
        )}
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
        {isLiveBackend ? (
          <DropdownMenuItem
            onSelect={() => {
              signOut();
              router.replace("/login");
            }}
          >
            <LogOut /> Sign out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">Demo session · no sign-in</DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
