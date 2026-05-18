import { SetupRequired } from "@/components/setup-required";
import { PostCard, type PostRow } from "@/components/post-card";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function FollowingPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = (follows ?? []).map((f) => f.following_id);
  if (followingIds.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-chirp-muted">
        <p className="text-lg text-chirp-text">Your Following feed is empty</p>
        <p className="mt-2 text-sm">
          Open someone&apos;s profile with{" "}
          <span className="font-mono text-chirp-accent">/u/handle</span> and
          follow them. Posts appear here in chronological order — no ranking.
        </p>
      </div>
    );
  }

  const { data: postsRaw } = await supabase
    .from("posts")
    .select("id, content, created_at, author_id")
    .is("parent_id", null)
    .in("author_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = postsRaw ?? [];
  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const postIds = posts.map((p) => p.id);

  const [{ data: profiles }, { data: mediaRows }, { data: likes }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, handle, display_name, avatar_url")
        .in("id", authorIds),
      supabase
        .from("post_media")
        .select("post_id, kind, storage_path, mime_type, duration_seconds")
        .in("post_id", postIds),
      supabase.from("likes").select("post_id, user_id").in("post_id", postIds),
    ]);

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id, p] as const),
  );
  const mediaByPost = new Map<string, PostRow["post_media"]>();
  for (const m of mediaRows ?? []) {
    mediaByPost.set(m.post_id, [
      {
        kind: m.kind as "image" | "video",
        storage_path: m.storage_path,
        mime_type: m.mime_type,
        duration_seconds: m.duration_seconds,
      },
    ]);
  }

  const likeCount = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const l of likes ?? []) {
    likeCount.set(l.post_id, (likeCount.get(l.post_id) ?? 0) + 1);
    if (l.user_id === user.id) likedByMe.add(l.post_id);
  }

  const rows: PostRow[] = posts.map((p) => ({
    ...p,
    profiles: profileById.get(p.author_id) ?? null,
    post_media: mediaByPost.get(p.id) ?? null,
  }));

  return (
    <div>
      <div className="border-b border-chirp-border px-4 py-3">
        <h1 className="text-xl font-bold text-chirp-text">Following</h1>
        <p className="text-sm text-chirp-muted">
          Newest first · only accounts you follow
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-chirp-muted">
          No posts yet from people you follow.
        </p>
      ) : (
        rows.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            likeCount={likeCount.get(post.id) ?? 0}
            likedByMe={likedByMe.has(post.id)}
          />
        ))
      )}
    </div>
  );
}
