import { emergencyContacts } from "@/mocks/emergency";
import type { EmergencyContact } from "@/types/emergency";

/** Verified, static reference data. No backend call: a person in trouble must not wait on a server. */
export interface EmergencyService {
  list(): EmergencyContact[];
}

export const emergencyService: EmergencyService = { list: () => emergencyContacts };
