import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupRequired } from "@/components/setup-required";
import { FollowButton } from "@/components/follow-button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ handle: string }> };

export default async function ProfilePage({ params }: PageProps) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { handle } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, bio, avatar_url")
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) notFound();

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", profile.id)
    .maybeSingle();

  const isSelf = user.id === profile.id;

  return (
    <div className="border-b border-chirp-border px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-chirp-text">
            {profile.display_name || profile.handle}
          </h1>
          <p className="text-chirp-muted">@{profile.handle}</p>
          {profile.bio ? (
            <p className="mt-3 max-w-prose text-sm text-chirp-text">{profile.bio}</p>
          ) : null}
        </div>
        {!isSelf ? (
          <FollowButton
            targetId={profile.id}
            initialFollowing={Boolean(existing)}
          />
        ) : (
          <Link
            href="/settings"
            className="text-sm font-medium text-chirp-accent hover:underline"
          >
            Edit profile
          </Link>
        )}
      </div>
      <p className="mt-6 text-sm text-chirp-muted">
        Share this profile:{" "}
        <Link
          href={`/u/${profile.handle}`}
          className="font-mono text-chirp-accent hover:underline"
        >
          /u/{profile.handle}
        </Link>
      </p>
    </div>
  );
}
