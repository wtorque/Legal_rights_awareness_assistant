import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** default: readable app width · wide: dense tools · full: edge-to-edge workspaces */
  width?: "default" | "wide" | "full";
}

export function PageContainer({ width = "default", className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10",
        width === "default" && "max-w-6xl",
        width === "wide" && "max-w-[88rem]",
        width === "full" && "max-w-none p-0 lg:p-0",
        className,
      )}
      {...props}
    />
  );
}
