import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { avatarPublicUrl } from "@/lib/avatar-url";
import { LikeButton } from "@/components/like-button";
import { PostFeedMedia } from "@/components/post-feed-media";

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
        width: number | null;
        height: number | null;
        duration_seconds: number | null;
      }[]
    | null;
};

type Props = {
  post: PostRow;
  likeCount: number;
  likedByMe: boolean;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function PostCard({ post, likeCount, likedByMe }: Props) {
  const profile = post.profiles;
  const handle = profile?.handle ?? "unknown";
  const name = profile?.display_name || handle;
  const media = post.post_media?.[0];

  return (
    <article className="border-b border-chirp-border px-5 py-4 transition-colors hover:bg-white/[0.02]">
      <div className="flex gap-3">
        <Link href={`/u/${handle}`} className="shrink-0">
          <Avatar
            displayName={name}
            handle={handle}
            avatarUrl={avatarPublicUrl(profile?.avatar_url)}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/u/${handle}`}
              className="truncate font-semibold text-chirp-text hover:text-chirp-accent"
            >
              {name}
            </Link>
            <Link
              href={`/u/${handle}`}
              className="truncate text-sm text-chirp-muted hover:text-chirp-accent"
            >
              @{handle}
            </Link>
            <span className="text-xs text-chirp-muted">· {timeAgo(post.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-chirp-text">
            {post.content}
          </p>
          {media ? <PostFeedMedia media={media} /> : null}
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
