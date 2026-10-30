"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { allNavItems } from "@/config/navigation";
import { useUiStore } from "@/stores/ui-store";

function prettify(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const overrides = useUiStore((s) => s.breadcrumbLabels);
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    const label = overrides[href] ?? allNavItems.find((n) => n.href === href)?.label ?? prettify(segment);
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li
              key={crumb.href}
              className={last ? "min-w-0" : "hidden min-w-0 items-center gap-1.5 sm:flex"}
            >
              {last ? (
                <span aria-current="page" className="block truncate font-medium">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link href={crumb.href} className="truncate text-muted-foreground transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
