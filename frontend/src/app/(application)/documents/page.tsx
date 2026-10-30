import type { Metadata } from "next";
import { DocumentsLibrary } from "@/components/documents/documents-library";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return <DocumentsLibrary />;
}
