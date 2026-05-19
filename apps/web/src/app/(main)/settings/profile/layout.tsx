import Link from "next/link";
import { EditProfileTabs } from "@/components/edit-profile-tabs";

export default function EditProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-chirp-border bg-chirp-bg/60 px-5 py-4 backdrop-blur-sm">
        <Link
          href="/settings"
          className="text-sm text-chirp-muted hover:text-chirp-accent"
        >
          ← Settings
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-chirp-text">
          Edit profile
        </h1>
      </header>
      <EditProfileTabs />
      {children}
    </>
  );
}
