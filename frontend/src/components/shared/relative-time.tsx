"use client";

import { useEffect, useState } from "react";
import { formatDate, formatRelative } from "@/lib/format";

/**
 * "3 days ago" depends on the current time, which prerendering can't know. Server and first
 * client render show the absolute date; the relative text replaces it after mount.
 */
export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNow(new Date()), []);
  return (
    <time dateTime={iso} className={className}>
      {now ? formatRelative(iso, now) : formatDate(iso)}
    </time>
  );
}
