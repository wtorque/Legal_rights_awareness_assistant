"use client";

import { FileSearch, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { demoUser } from "@/mocks/user";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Greeting and date depend on the visitor's clock, so they're filled in after mount. */
export function WelcomeHeader() {
  const [now, setNow] = useState<Date | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNow(new Date()), []);

  return (
    <PageHeader
      eyebrow={now ? now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Overview"}
      title={`${now ? greeting(now.getHours()) : "Welcome"}, ${demoUser.name.split(" ")[0]}`}
      description="Ask about your rights, make sense of a document, or plan what to do next — in plain language."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/documents">
              <FileSearch /> Analyze a document
            </Link>
          </Button>
          <Button asChild>
            <Link href="/assistant">
              <MessagesSquare /> New question
            </Link>
          </Button>
        </>
      }
    />
  );
}
