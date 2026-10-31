import {
  Bookmark,
  FileSearch,
  HandHelping,
  Siren,
  Landmark,
  LayoutDashboard,
  LibraryBig,
  LifeBuoy,
  type LucideIcon,
  MessagesSquare,
  Network,
  Route,
  Settings,
  History,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", description: "Your activity at a glance.", icon: LayoutDashboard },
      { href: "/assistant", label: "AI Assistant", description: "Ask a rights question.", icon: MessagesSquare },
      { href: "/conversations", label: "Conversations", description: "Browse past conversations.", icon: History },
      { href: "/documents", label: "Documents", description: "Analyze legal documents.", icon: FileSearch },
    ],
  },
  {
    title: "Legal intelligence",
    items: [
      { href: "/rights", label: "Rights Explorer", description: "Discover rights by situation.", icon: Landmark },
      { href: "/action-plans", label: "Action Blueprint", description: "Plan your next steps.", icon: Route },
      { href: "/knowledge", label: "Legal Knowledge", description: "Browse legal sources.", icon: LibraryBig },
      { href: "/evidence", label: "Evidence Graph", description: "Explore how sources connect.", icon: Network },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/emergency", label: "Emergency Help", description: "Official helplines to call now.", icon: Siren },
      { href: "/legal-aid", label: "Legal Aid Finder", description: "Find legal assistance.", icon: HandHelping },
      { href: "/saved", label: "Saved Resources", description: "Items you bookmarked.", icon: Bookmark },
    ],
  },
  {
    title: "Personal",
    items: [
      { href: "/settings", label: "Settings", description: "Appearance, language, privacy.", icon: Settings },
      { href: "/help", label: "Help & Support", description: "Guides and contact.", icon: LifeBuoy },
    ],
  },
];

export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items);

export function findNavItem(pathname: string): NavItem | undefined {
  return allNavItems.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
}
