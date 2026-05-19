import { publicMediaUrl } from "@/lib/media-url";

export type ProfileGridPost = {
  id: string;
  content: string;
  media: {
    kind: "image" | "video";
    storage_path: string;
  } | null;
};

function GridIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
    </svg>
  );
}

function TextPostIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
      />
    </svg>
  );
}

export function ProfilePostGrid({ posts }: { posts: ProfileGridPost[] }) {
  return (
    <>
      <div
        className="flex border-b border-chirp-border"
        role="tablist"
        aria-label="Profile content"
      >
        <div
          role="tab"
          aria-selected
          className="flex flex-1 items-center justify-center gap-1.5 border-b-2 border-chirp-text py-3 text-xs font-semibold uppercase tracking-wide text-chirp-text"
        >
          <GridIcon />
          <span>Posts</span>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-chirp-border">
            <GridIcon />
          </div>
          <p className="text-xl font-light text-chirp-text">No posts yet</p>
        </div>
      ) : (
        <ul className="grid grid-cols-3">
          {posts.map((post) => (
            <li key={post.id} className="aspect-square overflow-hidden">
              {post.media?.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicMediaUrl(post.media.storage_path)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : post.media?.kind === "video" ? (
                <video
                  src={publicMediaUrl(post.media.storage_path)}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-chirp-surface p-3 text-center">
                  <span className="text-chirp-muted">
                    <TextPostIcon />
                  </span>
                  <p className="line-clamp-4 text-xs leading-snug text-chirp-muted">
                    {post.content}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
