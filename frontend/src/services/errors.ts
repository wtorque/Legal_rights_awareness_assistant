/** Mirrors the backend error envelope codes in DATA_CONTRACTS.md. */
export type ServiceErrorCode = "not_found" | "validation_error" | "upstream_unavailable" | "internal_error";

export class ServiceError extends Error {
  constructor(
    public readonly code: ServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
