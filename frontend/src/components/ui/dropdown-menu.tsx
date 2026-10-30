"use client";

import * as Primitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuRadioGroup = Primitive.RadioGroup;

export const menuContentClass =
  "z-[80] min-w-48 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lift data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95";

export const menuItemClass =
  "relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-secondary [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

export const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(menuContentClass, className)}
      {...props}
    />
  </Primitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, ...props }, ref) => (
  <Primitive.Item ref={ref} className={cn(menuItemClass, className)} {...props} />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof Primitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof Primitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <Primitive.RadioItem ref={ref} className={cn(menuItemClass, "pr-9", className)} {...props}>
    {children}
    <Primitive.ItemIndicator className="absolute right-3">
      <Check className="!text-primary" />
    </Primitive.ItemIndicator>
  </Primitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export const DropdownMenuLabel = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Primitive.Label>) => (
  <Primitive.Label className={cn("px-3 py-1.5 text-eyebrow", className)} {...props} />
);

export const DropdownMenuSeparator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Primitive.Separator>) => (
  <Primitive.Separator className={cn("-mx-1.5 my-1.5 h-px bg-border", className)} {...props} />
);
