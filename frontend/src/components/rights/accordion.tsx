"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  body: React.ReactNode;
}

/** Headless UI disclosure list: keyboard and ARIA handled by the library. */
export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card/70">
      {items.map((item) => (
        <Disclosure key={item.id} as="div">
          <DisclosureButton className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium">
            {item.title}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[open]:rotate-180" aria-hidden />
          </DisclosureButton>
          <DisclosurePanel transition className="origin-top px-5 pb-4 text-sm leading-relaxed text-muted-foreground transition duration-300 ease-out data-closed:-translate-y-1 data-closed:opacity-0">
            {item.body}
          </DisclosurePanel>
        </Disclosure>
      ))}
    </div>
  );
}
