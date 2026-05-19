import { publicMediaUrl } from "@/lib/media-url";

/** `profiles.avatar_url` stores a path in the public `media` bucket. */
export function avatarPublicUrl(storagePath: string | null | undefined) {
  if (!storagePath) return null;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  return publicMediaUrl(storagePath);
}
