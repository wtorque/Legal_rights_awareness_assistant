import { ArrowUpRight, FileSearch, Landmark, MessagesSquare, Route } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

const items = [
  { href: "/assistant", title: "Ask AI", text: "Get a plain-language answer with sources.", icon: MessagesSquare },
  { href: "/documents", title: "Analyze documents", text: "See clauses explained and flagged.", icon: FileSearch },
  { href: "/rights", title: "Explore rights", text: "Browse rights by situation.", icon: Landmark },
  { href: "/action-plans", title: "Create action plan", text: "Turn your situation into steps.", icon: Route },
];

export function QuickAccess() {
  return (
    <RevealGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" gap={0.07}>
      {items.map((item) => (
        <RevealItem key={item.href}>
          <Link href={item.href} className="group block h-full rounded-3xl">
            <Card interactive className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </Card>
          </Link>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
