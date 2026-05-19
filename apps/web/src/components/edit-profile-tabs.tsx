"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/settings/profile", label: "Details", exact: true },
  { href: "/settings/profile/photo", label: "Profile photo", exact: false },
] as const;

export function EditProfileTabs() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="flex border-b border-chirp-border"
      aria-label="Edit profile sections"
    >
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active
                ? "flex-1 border-b-2 border-chirp-accent py-3 text-center text-sm font-semibold text-chirp-accent"
                : "flex-1 py-3 text-center text-sm font-medium text-chirp-muted hover:text-chirp-text"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
