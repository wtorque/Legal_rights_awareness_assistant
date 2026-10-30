import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Original mark: an arch (architecture) holding a level beam (balance). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-8 text-primary", className)}
    >
      <rect x="1" y="1" width="30" height="30" rx="10" className="fill-primary/10 stroke-primary/30" />
      <path
        d="M9 24V15a7 7 0 0 1 14 0v9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12.5 17.5h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-2xl leading-none tracking-tight">{siteConfig.name}</span>
    </span>
  );
}
