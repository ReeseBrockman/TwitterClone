"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeedTitle } from "@/components/feed-title";
import { NavLabel } from "@/components/nav-label";

const navItems = [
  { href: "/following", label: "feed", icon: HomeIcon, title: <FeedTitle /> },
  {
    href: "/search",
    label: "search",
    icon: SearchIcon,
    title: <NavLabel word="search" />,
  },
  { href: "/today", label: "top", icon: TopIcon, title: <NavLabel word="top" /> },
  {
    href: "/profile",
    label: "profile",
    icon: ProfileIcon,
    title: <NavLabel word="profile" />,
  },
] as const;

function NavLink({
  href,
  label,
  title,
  icon: Icon,
  active,
  compact,
}: {
  href: string;
  label: string;
  title: React.ReactNode;
  icon: () => React.ReactNode;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={compact ? label : undefined}
      className={
        active
          ? compact
            ? "flex h-11 w-11 items-center justify-center rounded-full text-chirp-accent"
            : "flex items-center gap-3 rounded-xl bg-chirp-accent/10 px-3 py-2.5 text-chirp-accent ring-1 ring-chirp-accent/30"
          : compact
            ? "flex h-11 w-11 items-center justify-center rounded-full text-chirp-muted hover:bg-white/5 hover:text-chirp-text"
            : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-chirp-muted hover:bg-white/5 hover:text-chirp-text"
      }
    >
      <Icon />
      {!compact ? (
        <span className="text-sm font-medium">{title}</span>
      ) : null}
    </Link>
  );
}

export function AppNav({ profileHandle }: { profileHandle: string | null }) {
  const pathname = usePathname() ?? "/";
  const isActive = (href: string) => {
    if (href === "/profile") {
      return (
        pathname === "/profile" ||
        (profileHandle !== null && pathname === `/u/${profileHandle}`)
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-chirp-border bg-chirp-surface/80 px-4 py-5 backdrop-blur-xl md:flex">
        <Link
          href="/following"
          className="mb-8 px-2 text-2xl font-bold tracking-tight text-chirp-text"
        >
          chirp<span className="text-chirp-accent">.</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </nav>

        <Link
          href="/compose"
          className="mb-4 flex items-center justify-center rounded-full bg-chirp-accent py-3 text-sm font-bold text-black shadow-lg shadow-chirp-accent/25 hover:brightness-110"
        >
          New post
        </Link>

        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-chirp-muted hover:bg-white/5 hover:text-chirp-text"
          >
            Sign out
          </button>
        </form>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex max-w-[100vw] items-center justify-around border-t border-chirp-border bg-chirp-surface/95 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            {...item}
            active={isActive(item.href)}
            compact
          />
        ))}
        <Link
          href="/compose"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-chirp-accent text-black shadow-lg shadow-chirp-accent/30"
          aria-label="New post"
        >
          <PlusIcon />
        </Link>
      </nav>
    </>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function TopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 19V5M5 12l7-7 7 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}
