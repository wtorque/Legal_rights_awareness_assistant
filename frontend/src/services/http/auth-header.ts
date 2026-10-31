import { ServiceError } from "../errors";
import { useAuthStore } from "@/stores/auth-store";

/** Authorization header for the current session. Throws when signed out, so callers surface a clear error. */
export async function authHeader(): Promise<Record<string, string>> {
  const token = await useAuthStore.getState().token();
  if (!token) throw new ServiceError("validation_error", "Please sign in to continue.");
  return { Authorization: `Bearer ${token}` };
}
