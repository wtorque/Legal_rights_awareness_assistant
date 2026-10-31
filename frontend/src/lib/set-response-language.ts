import { isLiveBackend } from "@/lib/api-config";
import { authApi } from "@/services/http/auth.http";
import { useAuthStore } from "@/stores/auth-store";
import { usePreferencesStore } from "@/stores/preferences-store";

/** Sets the answer language here and, when signed in to a live backend, on the account so it follows the user. */
export function setResponseLanguage(code: string): void {
  usePreferencesStore.getState().set({ responseLanguage: code });
  if (!isLiveBackend) return;
  void useAuthStore
    .getState()
    .token()
    .then((token) => (token ? authApi.updateProfile(token, { language: code }) : null))
    .catch(() => undefined); // The local choice already applies; the account copy catches up on the next change.
}
