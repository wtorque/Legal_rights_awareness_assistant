"use client";

import * as Primitive from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef<
  React.ComponentRef<typeof Primitive.Root>,
  React.ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-colors data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <Primitive.Thumb className="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-card shadow-soft transition-transform duration-300 ease-out-expo data-[state=checked]:translate-x-[1.375rem] data-[state=checked]:bg-primary-foreground" />
  </Primitive.Root>
));
Switch.displayName = "Switch";
