"use client";

import * as Primitive from "@radix-ui/react-context-menu";
import * as React from "react";
import { cn } from "@/lib/utils";
import { menuContentClass, menuItemClass } from "./dropdown-menu";

export const ContextMenu = Primitive.Root;
export const ContextMenuTrigger = Primitive.Trigger;

export const ContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content ref={ref} className={cn(menuContentClass, className)} {...props} />
  </Primitive.Portal>
));
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = React.forwardRef<
  React.ComponentRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, ...props }, ref) => <Primitive.Item ref={ref} className={cn(menuItemClass, className)} {...props} />);
ContextMenuItem.displayName = "ContextMenuItem";
