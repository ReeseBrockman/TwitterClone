"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (liked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      if (!error) {
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase.from("likes").insert({
        post_id: postId,
        user_id: user.id,
      });
      if (!error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      className={
        liked
          ? "inline-flex items-center gap-1 rounded-full border border-chirp-accent bg-chirp-accent/10 px-2 py-1 text-xs text-chirp-accent disabled:opacity-50"
          : "inline-flex items-center gap-1 rounded-full border border-chirp-border px-2 py-1 text-xs text-chirp-muted hover:border-chirp-accent hover:text-chirp-accent disabled:opacity-50"
      }
    >
      <span aria-hidden className={liked ? "text-chirp-accent" : undefined}>
        {liked ? "♥" : "♡"}
      </span>
      <span className={liked ? "font-medium text-chirp-accent" : undefined}>
        {count}
      </span>
    </button>
  );
}
