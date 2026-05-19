import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SetupRequired } from "@/components/setup-required";
import { PostCard, type PostRow } from "@/components/post-card";
import { enrichPostsWithMedia, fetchLikeState } from "@/lib/feed";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/auth";

type LeaderRow = {
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  score: number;
};

export default async function TodayPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { supabase, user } = await getAuthUser();
  if (!user) return null;

  const { data: board, error } = await supabase.rpc("leaderboard_today_utc", {
    p_limit: 50,
  });

  if (error) {
    return (
      <div className="px-4 py-8 text-sm text-red-400">
        Could not load Top leaderboard. Apply the SQL migration in{" "}
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
      <>
        <PageHeader
          title="Top"
          description="Top posts from the UTC day · likes + replies"
          badge="UTC"
        />
        <EmptyState
          title="Quiet day"
          description="No posts yet for today's board. Be the first to post."
          action={{ href: "/compose", label: "Write a post" }}
        />
      </>
    );
  }

  const [{ data: profiles }, { likeCount, likedByMe }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, handle, display_name, avatar_url")
      .in("id", authorIds),
    fetchLikeState(supabase, postIds, user.id),
  ]);

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id, p] as const),
  );

  const basePosts: PostRow[] = rows.map((r) => ({
    id: r.post_id,
    content: r.content,
    created_at: r.created_at,
    author_id: r.author_id,
    profiles: profileById.get(r.author_id) ?? null,
    post_media: null,
  }));

  const posts = await enrichPostsWithMedia(supabase, basePosts);

  const cards = rows.map((r, i) => ({
    score: Number(r.score),
    post: posts[i],
  }));

  return (
    <>
      <PageHeader
        title="Top"
        description="Top posts from the UTC day · separate from your home feed"
        badge="UTC"
      />
      {cards.map(({ post, score }) => (
        <div key={post.id}>
          <div className="flex items-center justify-end px-5 pt-3">
            <span className="rounded-full border border-chirp-accent/40 bg-chirp-accent/10 px-2.5 py-0.5 text-xs font-medium text-chirp-accent">
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
    </>
  );
}
