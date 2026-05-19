import { NavLabel } from "@/components/nav-label";

export function FeedTitle({ className = "" }: { className?: string }) {
  return <NavLabel word="feed" className={className} />;
}
