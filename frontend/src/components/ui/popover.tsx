"use client";

import * as Primitive from "@radix-ui/react-popover";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export const PopoverAnchor = Primitive.Anchor;

export const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, sideOffset = 8, align = "end", ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-[80] w-80 rounded-3xl border border-border bg-popover p-0 text-popover-foreground shadow-lift outline-none",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    />
  </Primitive.Portal>
));
PopoverContent.displayName = "PopoverContent";
