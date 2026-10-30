"use client";

import * as Primitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Tabs = Primitive.Root;

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof Primitive.List>,
  React.ComponentPropsWithoutRef<typeof Primitive.List>
>(({ className, ...props }, ref) => (
  <Primitive.List
    ref={ref}
    className={cn("inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-secondary/70 p-1", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof Primitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof Primitive.Trigger>
>(({ className, ...props }, ref) => (
  <Primitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, ...props }, ref) => (
  <Primitive.Content
    ref={ref}
    className={cn("mt-5 focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";
