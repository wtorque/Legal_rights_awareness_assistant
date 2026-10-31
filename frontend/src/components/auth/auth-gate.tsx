"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { isLiveBackend } from "@/lib/api-config";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useAuthStore } from "@/stores/auth-store";

/** With a live backend every app page needs a session. Mock mode has no accounts, so it passes straight through. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const init = useAuthStore((s) => s.init);
  const accountLanguage = useAuthStore((s) => s.user?.language);

  useEffect(() => {
    if (isLiveBackend) void init();
  }, [init]);

  // The account language is the source of truth once signed in, so it follows the user across devices.
  useEffect(() => {
    if (accountLanguage) usePreferencesStore.getState().set({ responseLanguage: accountLanguage });
  }, [accountLanguage]);

  useEffect(() => {
    if (isLiveBackend && status === "signedOut") router.replace("/login");
  }, [status, router]);

  if (!isLiveBackend || status === "signedIn") return <>{children}</>;
  return (
    <div className="grid min-h-dvh place-items-center" aria-busy="true">
      <Skeleton className="h-10 w-48" />
    </div>
  );
}
