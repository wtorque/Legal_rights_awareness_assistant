import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

export default function HomePage() {
  return (
    <>
      <ComingSoon
        eyebrow="Foundation phase"
        title="Landing page arrives next"
        description="The design system, theme, navigation and animation foundation are ready for review."
      />
      <Section flush className="pb-8">
        <Button asChild variant="outline">
          <Link href="/design-system">
            <Palette /> View design system <ArrowRight />
          </Link>
        </Button>
      </Section>
    </>
  );
}
