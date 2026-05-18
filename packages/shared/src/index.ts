/** Classic tweet length */
export const POST_MAX_LENGTH = 280;

/** Max one image attachment per post */
export const POST_MAX_IMAGES = 1;

/** Video duration cap (seconds) */
export const POST_MAX_VIDEO_SECONDS = 60;

/** Leaderboard uses UTC calendar day */
export const LEADERBOARD_TIMEZONE = "UTC";

export const SCORE_WEIGHT_LIKE = 1;
export const SCORE_WEIGHT_REPOST = 2;
export const SCORE_WEIGHT_REPLY = 1;

export type PostMediaKind = "image" | "video";

/** Matches DB constraint on profiles.handle */
export const HANDLE_REGEX = /^[a-zA-Z0-9_]{2,30}$/;

export function isValidHandle(handle: string): boolean {
  return HANDLE_REGEX.test(handle.trim());
}

/** Display name length cap (product UX; DB allows longer text). */
export const DISPLAY_NAME_MAX = 50;

/** Short profile bio (UI cap; DB allows longer text). */
export const BIO_MAX = 160;
