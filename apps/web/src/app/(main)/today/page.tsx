import { SetupRequired } from "@/components/setup-required";
import { PostCard, type PostRow } from "@/components/post-card";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type LeaderRow = {
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  score: number;
};

export default async function TodayPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: board, error } = await supabase.rpc("leaderboard_today_utc", {
    p_limit: 50,
  });

  if (error) {
    return (
      <div className="px-4 py-8 text-sm text-red-400">
        Could not load Today leaderboard. Apply the SQL migration in{" "}
        <code className="font-mono">supabase/migrations</code> and ensure the
        RPC exists. ({error.message})
      </div>
    );
  }

  const rows = (board ?? []) as LeaderRow[];
  const postIds = rows.map((r) => r.post_id);
  const authorIds = [...new Set(rows.map((r) => r.author_id))];

  if (postIds.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-chirp-muted">
        <h1 className="text-xl font-bold text-chirp-text">Today (UTC)</h1>
        <p className="mt-2 text-sm">
          No root posts yet for the UTC calendar day. Score = likes + replies
          (no reposts).
        </p>
      </div>
    );
  }

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

  const cards: { post: PostRow; score: number }[] = rows.map((r) => ({
    score: Number(r.score),
    post: {
      id: r.post_id,
      content: r.content,
      created_at: r.created_at,
      author_id: r.author_id,
      profiles: profileById.get(r.author_id) ?? null,
      post_media: mediaByPost.get(r.post_id) ?? null,
    },
  }));

  return (
    <div>
      <div className="border-b border-chirp-border px-4 py-3">
        <h1 className="text-xl font-bold text-chirp-text">Today (UTC)</h1>
        <p className="text-sm text-chirp-muted">
          Global posts from the current UTC day, ranked by likes + replies (no
          reposts). Separate from your Following timeline.
        </p>
      </div>
      {cards.map(({ post, score }) => (
        <div key={post.id}>
          <div className="flex items-center justify-end px-4 pt-3">
            <span className="rounded-full bg-chirp-surface px-2 py-0.5 text-xs font-medium text-chirp-accent ring-1 ring-chirp-border">
              score {score.toFixed(0)}
            </span>
          </div>
          <PostCard
            post={post}
            likeCount={likeCount.get(post.id) ?? 0}
            likedByMe={likedByMe.has(post.id)}
          />
        </div>
      ))}
    </div>
  );
}
