/** Non-secret backend origin. Empty = use the mock services (default for tests and offline work). */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export const isLiveBackend = API_BASE_URL !== "";
