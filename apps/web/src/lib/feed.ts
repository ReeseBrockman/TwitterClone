import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostRow } from "@/components/post-card";

type PostMediaRow = {
  kind: string;
  storage_path: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
};

type ProfileEmbed = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
};

type EmbeddedPost = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: ProfileEmbed | ProfileEmbed[] | null;
  post_media: PostMediaRow[] | PostMediaRow | null;
};

function normalizeProfile(
  raw: ProfileEmbed | ProfileEmbed[] | null,
): PostRow["profiles"] {
  if (!raw) return null;
  const p = Array.isArray(raw) ? raw[0] : raw;
  return p ?? null;
}

function normalizeMedia(
  raw: PostMediaRow[] | PostMediaRow | null,
): PostRow["post_media"] {
  if (!raw) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row) return null;
  return [
    {
      kind: row.kind as "image" | "video",
      storage_path: row.storage_path,
      mime_type: row.mime_type,
      width: row.width,
      height: row.height,
      duration_seconds: row.duration_seconds,
    },
  ];
}

export async function fetchPostsByAuthors(
  supabase: SupabaseClient,
  authorIds: string[],
  limit: number,
): Promise<EmbeddedPost[]> {
  if (authorIds.length === 0) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      created_at,
      author_id,
      profiles (
        id,
        handle,
        display_name,
        avatar_url
      ),
      post_media (
        kind,
        storage_path,
        mime_type,
        width,
        height,
        duration_seconds
      )
    `,
    )
    .is("parent_id", null)
    .in("author_id", authorIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as EmbeddedPost[];
}

export async function fetchLikeState(
  supabase: SupabaseClient,
  postIds: string[],
  userId: string,
): Promise<{ likeCount: Map<string, number>; likedByMe: Set<string> }> {
  const likeCount = new Map<string, number>();
  const likedByMe = new Set<string>();
  if (postIds.length === 0) return { likeCount, likedByMe };

  const [{ data: counts }, { data: myLikes }] = await Promise.all([
    supabase.rpc("post_like_counts", { p_post_ids: postIds }),
    supabase.from("likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
  ]);

  for (const row of counts ?? []) {
    likeCount.set(row.post_id, Number(row.like_count));
  }
  for (const row of myLikes ?? []) {
    likedByMe.add(row.post_id);
  }

  return { likeCount, likedByMe };
}

export function toPostRows(posts: EmbeddedPost[]): PostRow[] {
  return posts.map((p) => ({
    id: p.id,
    content: p.content,
    created_at: p.created_at,
    author_id: p.author_id,
    profiles: normalizeProfile(p.profiles),
    post_media: normalizeMedia(p.post_media),
  }));
}

export async function enrichPostsWithMedia(
  supabase: SupabaseClient,
  posts: Pick<PostRow, "id" | "content" | "created_at" | "author_id" | "profiles">[],
): Promise<PostRow[]> {
  const postIds = posts.map((p) => p.id);
  if (postIds.length === 0) return posts as PostRow[];

  const { data: mediaRows } = await supabase
    .from("post_media")
    .select(
      "post_id, kind, storage_path, mime_type, width, height, duration_seconds",
    )
    .in("post_id", postIds);

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
  const posts = await fetchPostsByAuthors(supabase, authorIds, limit);
  const postIds = posts.map((p) => p.id);
  const { likeCount, likedByMe } = await fetchLikeState(supabase, postIds, userId);
  return { rows: toPostRows(posts), likeCount, likedByMe };
}
