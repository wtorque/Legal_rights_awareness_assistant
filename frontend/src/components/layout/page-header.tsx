import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned actions (buttons, selects). */
  actions?: React.ReactNode;
  /** Badges / status shown under the description. */
  meta?: React.ReactNode;
  className?: string;
}

/** The single h1 for a page. */
export function PageHeader({ eyebrow, title, description, actions, meta, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-3">
        {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
        <h1 className="text-display-lg">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>}
        {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
