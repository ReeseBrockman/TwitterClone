import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SetupRequired } from "@/components/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function SettingsRow({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 border-b border-chirp-border px-5 py-4 transition-colors hover:bg-white/[0.02] last:border-b-0"
    >
      <div className="min-w-0 text-left">
        <p className="font-medium text-chirp-text">{title}</p>
        <p className="mt-0.5 text-sm text-chirp-muted">{description}</p>
      </div>
      <span className="shrink-0 text-chirp-muted" aria-hidden>
        →
      </span>
    </Link>
  );
}

export default async function SettingsPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader title="Settings" />
      <nav aria-label="Settings">
        <SettingsRow
          href="/settings/account"
          title="Account settings"
          description="Username and email"
        />
        <SettingsRow
          href="/settings/profile"
          title="Edit profile"
          description="Display name and bio"
        />
      </nav>
    </>
  );
}
