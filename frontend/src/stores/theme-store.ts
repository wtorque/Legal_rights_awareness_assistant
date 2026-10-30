import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "aequa-theme";

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  /** True once the persisted preference has been read on the client. */
  ready: boolean;
  init: () => () => void;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

const systemQuery = "(prefers-color-scheme: dark)";

function readStored(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    // storage unavailable (private mode, blocked) — fall back to system
  }
  return "system";
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;
  return window.matchMedia(systemQuery).matches ? "dark" : "light";
}

let animateTimer: ReturnType<typeof setTimeout> | undefined;

function apply(resolved: ResolvedTheme, animate: boolean) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-animating");
    clearTimeout(animateTimer);
    animateTimer = setTimeout(() => root.classList.remove("theme-animating"), 450);
  }
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: "system",
  resolved: "light",
  ready: false,

  init: () => {
    const preference = readStored();
    const resolved = resolve(preference);
    apply(resolved, false);
    set({ preference, resolved, ready: true });

    const media = window.matchMedia(systemQuery);
    const onSystemChange = () => {
      if (get().preference !== "system") return;
      const next = resolve("system");
      apply(next, true);
      set({ resolved: next });
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = readStored();
      const nextResolved = resolve(next);
      apply(nextResolved, true);
      set({ preference: next, resolved: nextResolved });
    };
    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  },

  setPreference: (preference) => {
    const resolved = resolve(preference);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // non-persistent; still applies for this session
    }
    apply(resolved, true);
    set({ preference, resolved });
  },

  toggle: () => {
    // Read the DOM (not store state) so the first click is right even before init.
    const isDark = document.documentElement.classList.contains("dark");
    get().setPreference(isDark ? "light" : "dark");
  },
}));
