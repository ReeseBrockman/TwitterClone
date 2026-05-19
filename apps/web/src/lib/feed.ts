import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostRow } from "@/components/post-card";

function supabaseErrorMessage(error: {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}): string {
  return error.message ?? error.code ?? "Database request failed";
}

export async function fetchPostsByAuthors(
  supabase: SupabaseClient,
  authorIds: string[],
  limit: number,
): Promise<PostRow[]> {
  if (authorIds.length === 0) return [];

  const { data: postsRaw, error: postsError } = await supabase
    .from("posts")
    .select("id, content, created_at, author_id")
    .is("parent_id", null)
    .in("author_id", authorIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (postsError) {
    throw new Error(supabaseErrorMessage(postsError));
  }

  const posts = postsRaw ?? [];
  if (posts.length === 0) return [];

  const authorIdsUnique = [...new Set(posts.map((p) => p.author_id))];
  const postIds = posts.map((p) => p.id);

  const [{ data: profiles, error: profilesError }, { data: mediaRows, error: mediaError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, handle, display_name, avatar_url")
        .in("id", authorIdsUnique),
      supabase
        .from("post_media")
        .select(
          "post_id, kind, storage_path, mime_type, width, height, duration_seconds",
        )
        .in("post_id", postIds),
    ]);

  if (profilesError) {
    throw new Error(supabaseErrorMessage(profilesError));
  }
  if (mediaError) {
    throw new Error(supabaseErrorMessage(mediaError));
  }

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
        width: m.width,
        height: m.height,
        duration_seconds: m.duration_seconds,
      },
    ]);
  }

  return posts.map((p) => ({
    ...p,
    profiles: profileById.get(p.author_id) ?? null,
    post_media: mediaByPost.get(p.id) ?? null,
  }));
}

export async function fetchLikeState(
  supabase: SupabaseClient,
  postIds: string[],
  userId: string,
): Promise<{ likeCount: Map<string, number>; likedByMe: Set<string> }> {
  const likeCount = new Map<string, number>();
  const likedByMe = new Set<string>();
  if (postIds.length === 0) return { likeCount, likedByMe };

  const [{ data: counts, error: countsError }, { data: myLikes, error: likesError }] =
    await Promise.all([
      supabase.rpc("post_like_counts", { p_post_ids: postIds }),
      supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postIds),
    ]);

  if (likesError) {
    throw new Error(supabaseErrorMessage(likesError));
  }

  if (countsError) {
    // RPC missing or not granted — fall back so the feed still loads.
    const { data: allLikes, error: fallbackError } = await supabase
      .from("likes")
      .select("post_id")
      .in("post_id", postIds);
    if (fallbackError) {
      throw new Error(supabaseErrorMessage(fallbackError));
    }
    for (const row of allLikes ?? []) {
      likeCount.set(row.post_id, (likeCount.get(row.post_id) ?? 0) + 1);
    }
  } else {
    for (const row of counts ?? []) {
      likeCount.set(row.post_id, Number(row.like_count));
    }
  }

  for (const row of myLikes ?? []) {
    likedByMe.add(row.post_id);
  }

  return { likeCount, likedByMe };
}

export async function enrichPostsWithMedia(
  supabase: SupabaseClient,
  posts: Pick<PostRow, "id" | "content" | "created_at" | "author_id" | "profiles">[],
): Promise<PostRow[]> {
  const postIds = posts.map((p) => p.id);
  if (postIds.length === 0) return posts as PostRow[];

  const { data: mediaRows, error } = await supabase
    .from("post_media")
    .select(
      "post_id, kind, storage_path, mime_type, width, height, duration_seconds",
    )
    .in("post_id", postIds);

  if (error) {
    throw new Error(supabaseErrorMessage(error));
  }

  const mediaByPost = new Map<string, PostRow["post_media"]>();
  for (const m of mediaRows ?? []) {
    mediaByPost.set(m.post_id, [
      {
        kind: m.kind as "image" | "video",
        storage_path: m.storage_path,
        mime_type: m.mime_type,
        width: m.width,
        height: m.height,
        duration_seconds: m.duration_seconds,
      },
    ]);
  }

  return posts.map((p) => ({
    ...p,
    post_media: mediaByPost.get(p.id) ?? null,
  })) as PostRow[];
}

export async function loadFeedForAuthors(
  supabase: SupabaseClient,
  authorIds: string[],
  userId: string,
  limit = 50,
): Promise<{
  rows: PostRow[];
  likeCount: Map<string, number>;
  likedByMe: Set<string>;
}> {
  const rows = await fetchPostsByAuthors(supabase, authorIds, limit);
  const postIds = rows.map((p) => p.id);
  const { likeCount, likedByMe } = await fetchLikeState(supabase, postIds, userId);
  return { rows, likeCount, likedByMe };
}
