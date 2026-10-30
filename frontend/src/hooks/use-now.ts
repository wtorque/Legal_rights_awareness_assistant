"use client";

import { useEffect, useState } from "react";

/** Current time, available only after mount (prerendered output can't depend on the clock). */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNow(new Date()), []);
  return now;
}
