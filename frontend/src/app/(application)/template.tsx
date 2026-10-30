import { PageTransition } from "@/components/motion/page-transition";

export default function ApplicationTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
