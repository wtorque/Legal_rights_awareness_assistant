import { create } from "zustand";
import { authApi } from "@/services/http/auth.http";
import type { AuthSession, AuthUser } from "@/types/auth";

const KEY = "aequa-auth";
const REFRESH_MARGIN_MS = 30_000;

interface Stored {
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
}

type Status = "unknown" | "signedOut" | "signedIn";

interface AuthState {
  status: Status;
  user: AuthUser | null;
  /** Restores a saved session. Call once on app start. */
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; name: string; language: string }) => Promise<void>;
  signOut: () => void;
  /** A valid access token, refreshing it first if it is about to expire. Null when signed out. */
  token: () => Promise<string | null>;
}

// Interim: tokens sit in localStorage, readable by any script on this origin (KNOWN_ISSUES #53).
function read(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function write(value: Stored | null) {
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify(value));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the session lasts until the tab closes.
  }
}

let memory: Stored | null = null;
let refreshing: Promise<Stored | null> | null = null;

function adopt(session: AuthSession): Stored {
  const stored = { accessToken: session.accessToken, refreshToken: session.refreshToken, expiresAt: Date.now() + session.expiresIn * 1000 };
  memory = stored;
  write(stored);
  return stored;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const accept = (session: AuthSession) => {
    adopt(session);
    set({ status: "signedIn", user: session.user });
  };

  return {
    status: "unknown",
    user: null,

    init: async () => {
      if (get().status !== "unknown") return;
      memory = read();
      if (!memory) return set({ status: "signedOut" });
      const token = await get().token();
      if (!token) return;
      try {
        set({ status: "signedIn", user: await authApi.me(token) });
      } catch {
        get().signOut();
      }
    },

    signIn: async (email, password) => accept(await authApi.login(email, password)),
    register: async (input) => accept(await authApi.register(input)),

    signOut: () => {
      memory = null;
      write(null);
      set({ status: "signedOut", user: null });
    },

    token: async () => {
      if (!memory) return null;
      if (memory.expiresAt - Date.now() > REFRESH_MARGIN_MS) return memory.accessToken;
      // One refresh at a time: parallel requests share it.
      refreshing ??= authApi
        .refresh(memory.refreshToken)
        .then((session) => {
          set({ status: "signedIn", user: session.user });
          return adopt(session);
        })
        .catch(() => {
          get().signOut();
          return null;
        })
        .finally(() => {
          refreshing = null;
        });
      return (await refreshing)?.accessToken ?? null;
    },
  };
});
