"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/following", label: "Following" },
  { href: "/search", label: "Search" },
  { href: "/today", label: "Today" },
  { href: "/compose", label: "Post" },
  { href: "/settings", label: "Profile" },
] as const;

export function MainNav() {
  const pathname = usePathname() ?? "/";
  return (
    <header className="border-b border-chirp-border bg-chirp-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/following"
          className="text-lg font-semibold tracking-tight text-chirp-text"
        >
          Chirp
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "rounded-full bg-chirp-surface px-3 py-1.5 text-sm font-medium text-chirp-accent"
                    : "rounded-full px-3 py-1.5 text-sm font-medium text-chirp-muted hover:text-chirp-text"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="text-sm text-chirp-muted hover:text-chirp-text"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
