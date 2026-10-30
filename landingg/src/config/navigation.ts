import {
  FileSearch,
  Landmark,
  LibraryBig,
  type LucideIcon,
  MessagesSquare,
  Route,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** Compact label for the desktop bar. */
  label: string;
  /** Full page title. */
  title: string;
  description: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  {
    href: "/assistant",
    label: "Assistant",
    title: "AI Legal Assistant",
    description: "Ask a rights question in your own language.",
    icon: MessagesSquare,
  },
  {
    href: "/documents",
    label: "Documents",
    title: "Document Intelligence",
    description: "Understand a notice, contract or agreement.",
    icon: FileSearch,
  },
  {
    href: "/rights",
    label: "Rights",
    title: "Rights Explorer",
    description: "Browse rights by situation and category.",
    icon: Landmark,
  },
  {
    href: "/blueprint",
    label: "Blueprint",
    title: "Action Blueprint",
    description: "A step-by-step plan for what to do next.",
    icon: Route,
  },
  {
    href: "/sources",
    label: "Sources",
    title: "Legal Sources",
    description: "Trace every answer back to its origin.",
    icon: LibraryBig,
  },
];

export const settingsNav: NavItem = {
  href: "/settings",
  label: "Settings",
  title: "Settings",
  description: "Theme, language and preferences.",
  icon: Settings,
};

export const allNav: NavItem[] = [...primaryNav, settingsNav];
