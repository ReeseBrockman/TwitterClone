import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile-header";
import {
  ProfilePostGrid,
  type ProfileGridPost,
} from "@/components/profile-post-grid";
import { SetupRequired } from "@/components/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/auth";

type PageProps = { params: Promise<{ handle: string }> };

export default async function ProfilePage({ params }: PageProps) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { handle } = await params;
  const { supabase, user } = await getAuthUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, bio, avatar_url")
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) notFound();

  const [
    { data: existing },
    { count: postCount },
    { count: followerCount },
    { count: followingCount },
    { data: postsRaw },
  ] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("author_id", profile.id)
      .is("parent_id", null),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    supabase
      .from("posts")
      .select("id, content, created_at")
      .eq("author_id", profile.id)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const posts = postsRaw ?? [];
  const postIds = posts.map((p) => p.id);
  const { data: mediaRows } =
    postIds.length > 0
      ? await supabase
          .from("post_media")
          .select("post_id, kind, storage_path")
          .in("post_id", postIds)
      : { data: [] };

  const mediaByPost = new Map(
    (mediaRows ?? []).map((m) => [
      m.post_id,
      { kind: m.kind as "image" | "video", storage_path: m.storage_path },
    ]),
  );

  const gridPosts: ProfileGridPost[] = posts.map((p) => ({
    id: p.id,
    content: p.content,
    media: mediaByPost.get(p.id) ?? null,
  }));

  const isSelf = user.id === profile.id;

  return (
    <>
      <ProfileHeader
        handle={profile.handle}
        displayName={profile.display_name}
        bio={profile.bio}
        targetId={profile.id}
        postCount={postCount ?? 0}
        followerCount={followerCount ?? 0}
        followingCount={followingCount ?? 0}
        isSelf={isSelf}
        initialFollowing={Boolean(existing)}
      />
      <ProfilePostGrid posts={gridPosts} />
    </>
  );
}
