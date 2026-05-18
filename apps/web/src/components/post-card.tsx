import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { publicMediaUrl } from "@/lib/media-url";

export type PostRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    handle: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  post_media:
    | {
        kind: "image" | "video";
        storage_path: string;
        mime_type: string;
        duration_seconds: number | null;
      }[]
    | null;
};

type Props = {
  post: PostRow;
  likeCount: number;
  likedByMe: boolean;
};

export function PostCard({ post, likeCount, likedByMe }: Props) {
  const profile = post.profiles;
  const handle = profile?.handle ?? "unknown";
  const name = profile?.display_name || handle;
  const media = post.post_media?.[0];

  return (
    <article className="border-b border-chirp-border px-4 py-4">
      <div className="flex gap-3">
        <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-chirp-surface ring-1 ring-chirp-border" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="truncate font-semibold text-chirp-text">{name}</span>
            <Link
              href={`/u/${handle}`}
              className="truncate text-sm text-chirp-muted hover:text-chirp-accent"
            >
              @{handle}
            </Link>
            <span className="text-xs text-chirp-muted">
              {new Date(post.created_at).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-chirp-text">
            {post.content}
          </p>
          {media?.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={publicMediaUrl(media.storage_path)}
              alt=""
              className="mt-3 max-h-80 w-full rounded-xl border border-chirp-border object-cover"
            />
          ) : null}
          {media?.kind === "video" ? (
            <video
              src={publicMediaUrl(media.storage_path)}
              controls
              className="mt-3 max-h-80 w-full rounded-xl border border-chirp-border"
            />
          ) : null}
          <div className="mt-3">
            <LikeButton
              postId={post.id}
              initialCount={likeCount}
              initialLiked={likedByMe}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
