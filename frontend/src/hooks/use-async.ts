"use client";

import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading"; data: null }
  | { status: "error"; data: null }
  | { status: "ready"; data: T };

/** Loads data from a service call with loading / error / ready states and a retry. */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading", data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading", data: null });
    load().then(
      (data) => !cancelled && setState({ status: "ready", data }),
      () => !cancelled && setState({ status: "error", data: null }),
    );
    return () => {
      cancelled = true;
    };
    // `load` is a stable module-level service call
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
