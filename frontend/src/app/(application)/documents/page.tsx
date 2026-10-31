import type { Metadata } from "next";
import { DocumentsLibrary } from "@/components/documents/documents-library";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return <DocumentsLibrary />;
}
