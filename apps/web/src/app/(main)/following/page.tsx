import { EmptyState } from "@/components/empty-state";
import { FeedTitle } from "@/components/feed-title";
import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { SetupRequired } from "@/components/setup-required";
import { loadFeedForAuthors } from "@/lib/feed";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/auth";

export default async function FollowingPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { supabase, user } = await getAuthUser();
  if (!user) return null;

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = (follows ?? []).map((f) => f.following_id);
  const feedAuthorIds = [...new Set([...followingIds, user.id])];

  let rows;
  let likeCount;
  let likedByMe;
  try {
    ({ rows, likeCount, likedByMe } = await loadFeedForAuthors(
      supabase,
      feedAuthorIds,
      user.id,
    ));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not load your feed.";
    return (
      <>
        <PageHeader
          title={<FeedTitle />}
          description="Posts from people you follow"
        />
        <p className="px-5 py-8 text-sm text-red-400" role="alert">
          {message}
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={<FeedTitle />}
        description="Posts from people you follow"
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description={
            followingIds.length === 0
              ? "Follow people to see their posts here, or write your first post."
              : "People you follow haven't posted. Check back later or write something."
          }
          action={{ href: "/compose", label: "Write a post" }}
        />
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
    </>
  );
}
