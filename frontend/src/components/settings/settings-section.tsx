import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ id, title, description, children, className }: SettingsSectionProps) {
  return (
    <section aria-labelledby={id} className={cn("grid gap-6 border-t border-border py-10 lg:grid-cols-[16rem_1fr] lg:gap-12", className)}>
      <div>
        <h2 id={id} className="text-display-md">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function SettingRow({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="max-w-md">
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
        {hint && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
