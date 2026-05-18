"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  targetId: string;
  initialFollowing: boolean;
};

export function FollowButton({ targetId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetId);
      if (!error) setFollowing(false);
    } else {
      const { error } = await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: targetId,
      });
      if (!error) setFollowing(true);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      className={
        following
          ? "rounded-full border border-chirp-border px-4 py-1.5 text-sm font-semibold text-chirp-text hover:border-red-500 hover:text-red-400"
          : "rounded-full bg-chirp-accent px-4 py-1.5 text-sm font-semibold text-black hover:brightness-110"
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
