import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/avatar";
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

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, bio")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");

  const name = profile.display_name?.trim() || profile.handle;

  return (
    <>
      <PageHeader title="Profile" description="Your account and public profile" />
      <div className="flex items-start gap-4 border-b border-chirp-border px-5 py-6">
        <Avatar displayName={name} handle={profile.handle} />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-chirp-text">{name}</p>
          <p className="text-chirp-accent">@{profile.handle}</p>
          {profile.bio?.trim() ? (
            <p className="mt-2 text-sm leading-relaxed text-chirp-muted">
              {profile.bio}
            </p>
          ) : (
            <p className="mt-2 text-sm text-chirp-muted">No bio yet.</p>
          )}
          {user.email ? (
            <p className="mt-3 text-xs text-chirp-muted">{user.email}</p>
          ) : null}
        </div>
      </div>
      <nav aria-label="Profile settings">
        <SettingsRow
          href="/settings/account"
          title="Account settings"
          description="Username, display name, and bio"
        />
        <SettingsRow
          href={`/u/${profile.handle}`}
          title="View public profile"
          description="See how others see you"
        />
      </nav>
    </>
  );
}
