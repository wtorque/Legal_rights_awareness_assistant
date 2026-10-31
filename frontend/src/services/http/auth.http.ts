import { API_BASE_URL } from "@/lib/api-config";
import { camelize } from "@/lib/camelize";
import type { AuthSession, AuthUser } from "@/types/auth";
import { ServiceError } from "../errors";

interface ErrorEnvelope {
  error?: { message?: string };
}

async function call<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/auth${path}`, {
      ...rest,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
  } catch {
    throw new ServiceError("upstream_unavailable", "Can't reach the Aequa server. Is the backend running?");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ErrorEnvelope | null;
    throw new ServiceError(res.status === 401 || res.status === 429 || res.status === 409 || res.status === 422 ? "validation_error" : "upstream_unavailable", body?.error?.message ?? `Server error (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : camelize<T>(await res.json());
}

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

export const authApi = {
  register: (input: { email: string; password: string; name: string; language: string }) => call<AuthSession>("/register", post(input)),
  login: (email: string, password: string) => call<AuthSession>("/login", post({ email, password })),
  refresh: (refreshToken: string) => call<AuthSession>("/refresh", post({ refresh_token: refreshToken })),
  me: (token: string) => call<AuthUser>("/me", { token }),
  updateProfile: (token: string, patch: { name?: string; language?: string; notifications?: { follow_ups: boolean; product_updates: boolean } }) =>
    call<AuthUser>("/me", { method: "PATCH", body: JSON.stringify(patch), token }),
};
