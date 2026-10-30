import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Narrow the inner container for reading-width content. */
  width?: "page" | "prose";
  /** Remove vertical padding (e.g. for full-bleed heroes). */
  flush?: boolean;
}

export function Section({ width = "page", flush, className, children, ...props }: SectionProps) {
  return (
    <section className={cn(!flush && "py-16 sm:py-24", className)} {...props}>
      <div className={width === "page" ? "container-page" : "container-prose"}>{children}</div>
    </section>
  );
}
