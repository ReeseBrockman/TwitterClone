import Image from "next/image";
import { publicMediaUrl } from "@/lib/media-url";

type Media = {
  kind: "image" | "video";
  storage_path: string;
  width: number | null;
  height: number | null;
};

export function PostFeedMedia({ media }: { media: Media }) {
  const url = publicMediaUrl(media.storage_path);

  if (media.kind === "image") {
    const w = media.width && media.width > 0 ? media.width : 1200;
    const h = media.height && media.height > 0 ? media.height : 800;
    return (
      <div className="relative mt-3 w-full overflow-hidden rounded-2xl border border-chirp-border">
        <Image
          src={url}
          alt=""
          width={w}
          height={h}
          sizes="(max-width: 576px) 100vw, 576px"
          className="h-auto w-full"
          style={{ height: "auto" }}
        />
      </div>
    );
  }

  return (
    <video
      src={url}
      controls
      preload="metadata"
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      className="mt-3 block h-auto w-full max-w-full rounded-2xl border border-chirp-border"
    />
  );
}
