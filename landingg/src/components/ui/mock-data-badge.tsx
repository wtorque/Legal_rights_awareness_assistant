import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

/**
 * Must accompany any placeholder content so sample data is never mistaken
 * for a verified legal source.
 */
export function MockDataBadge({
  className,
  label = "Sample data · not verified",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Badge variant="warning" className={cn("font-mono tracking-wide", className)}>
      <FlaskConical aria-hidden />
      {label}
    </Badge>
  );
}
