import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-muted-foreground",
        brand: "bg-primary/10 text-primary",
        brass: "bg-brass/12 text-brass",
        warning: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
