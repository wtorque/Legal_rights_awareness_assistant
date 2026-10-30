import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { primaryNav, settingsNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface-2/60">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr]">
        <div className="max-w-md space-y-4">
          <Link href="/" aria-label="Aequa home" className="inline-block rounded-full">
            <Logo />
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">{siteConfig.tagline}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{siteConfig.disclaimer}</p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[...primaryNav, settingsNav].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-1 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>{siteConfig.prototypeNotice}</p>
          <p>© {siteConfig.name}</p>
        </div>
      </div>
    </footer>
  );
}
