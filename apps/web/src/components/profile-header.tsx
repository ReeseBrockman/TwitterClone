import Link from "next/link";
import { AtHandle } from "@/components/at-handle";
import { Avatar } from "@/components/avatar";
import { avatarPublicUrl } from "@/lib/avatar-url";
import { FollowButton } from "@/components/follow-button";

type Props = {
  handle: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  targetId: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isSelf: boolean;
  initialFollowing: boolean;
};

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center md:text-left">
      <p className="text-base font-semibold tabular-nums text-chirp-text md:text-lg">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-chirp-muted">{label}</p>
    </div>
  );
}

export function ProfileHeader({
  handle,
  displayName,
  bio,
  avatarUrl,
  targetId,
  postCount,
  followerCount,
  followingCount,
  isSelf,
  initialFollowing,
}: Props) {
  const name = displayName?.trim() || handle;

  return (
    <header className="border-b border-chirp-border px-4 py-5 md:px-6 md:py-6">
      <div className="flex gap-5 md:gap-8">
        <Avatar
          displayName={name}
          handle={handle}
          avatarUrl={avatarPublicUrl(avatarUrl)}
          size="lg"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <h1 className="min-w-0 truncate">
              <AtHandle
                handle={handle}
                className="text-sm font-semibold md:text-base"
              />
            </h1>
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2 min-[420px]:justify-start">
              {isSelf ? (
                <Link
                  href="/settings"
                  className="rounded-lg border border-chirp-border px-4 py-1.5 text-sm font-semibold text-chirp-text transition-colors hover:bg-white/5"
                >
                  Edit profile
                </Link>
              ) : (
                <FollowButton
                  targetId={targetId}
                  initialFollowing={initialFollowing}
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-around gap-4 md:mt-5 md:justify-start md:gap-8">
            <Stat value={postCount} label="posts" />
            <Stat value={followerCount} label="followers" />
            <Stat value={followingCount} label="following" />
          </div>

          <div className="mt-4 hidden md:block">
            <p className="text-sm font-semibold text-chirp-text">{name}</p>
            {bio?.trim() ? (
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-chirp-text">
                {bio}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 md:hidden">
        <p className="text-sm font-semibold text-chirp-text">{name}</p>
        {bio?.trim() ? (
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-chirp-text">
            {bio}
          </p>
        ) : null}
      </div>
    </header>
  );
}
