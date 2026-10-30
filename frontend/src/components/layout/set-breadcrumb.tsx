"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";

/** Render inside a detail page to replace its URL segment with a readable title in the breadcrumb. */
export function SetBreadcrumb({ label }: { label: string }) {
  const pathname = usePathname();
  const set = useUiStore((s) => s.setBreadcrumbLabel);
  useEffect(() => {
    set(pathname, label);
    return () => set(pathname, null);
  }, [pathname, label, set]);
  return null;
}
