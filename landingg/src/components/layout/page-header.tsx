import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Slot for badges / actions below the description. */
  children?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Standard inner-page heading block: eyebrow, editorial title, lead paragraph. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  align = "left",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 pt-[calc(var(--header-h)+3rem)] pb-10 sm:pt-[calc(var(--header-h)+4.5rem)]",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p className="text-eyebrow">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h1 className="text-display-xl max-w-4xl">{title}</h1>
      </Reveal>
      {description && (
        <Reveal delay={0.12}>
          <p className="text-lead max-w-2xl">{description}</p>
        </Reveal>
      )}
      {children && <Reveal delay={0.18}>{children}</Reveal>}
    </div>
  );
}
