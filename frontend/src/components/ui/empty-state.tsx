import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/40 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
