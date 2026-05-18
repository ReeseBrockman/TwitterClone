"use client";

import {
  POST_MAX_LENGTH,
  POST_MAX_VIDEO_SECONDS,
} from "@chirp/shared";
import { PageHeader } from "@/components/page-header";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function extFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/quicktime") return "mov";
  return "bin";
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(v.duration) ? v.duration : 0);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata"));
    };
    v.src = url;
  });
}

export default function ComposePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const remaining = POST_MAX_LENGTH - text.length;

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = text.trim();
    if (!trimmed && !file) {
      setError("Write something or attach one photo or video.");
      return;
    }
    if (trimmed.length > POST_MAX_LENGTH) {
      setError(`Posts are limited to ${POST_MAX_LENGTH} characters.`);
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in.");
        setBusy(false);
        return;
      }

      let kind: "image" | "video" | null = null;
      let durationSeconds: number | null = null;
      if (file) {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          setError("Only image or video files are supported.");
          setBusy(false);
          return;
        }
        kind = file.type.startsWith("video/") ? "video" : "image";
        if (kind === "video") {
          const dur = await readVideoDuration(file);
          if (dur > POST_MAX_VIDEO_SECONDS + 0.25) {
            setError(`Video must be ${POST_MAX_VIDEO_SECONDS} seconds or shorter.`);
            setBusy(false);
            return;
          }
          durationSeconds = dur;
        }
      }

      const { data: post, error: postErr } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          content: trimmed,
          parent_id: null,
        })
        .select("id")
        .single();
      if (postErr || !post) {
        setError(postErr?.message ?? "Could not create post.");
        setBusy(false);
        return;
      }

      if (file && kind) {
        const ext = extFromMime(file.type);
        const path = `${user.id}/${post.id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
          });
        if (upErr) {
          await supabase.from("posts").delete().eq("id", post.id);
          setError(upErr.message);
          setBusy(false);
          return;
        }
        const { error: mediaErr } = await supabase.from("post_media").insert({
          post_id: post.id,
          kind,
          storage_path: path,
          mime_type: file.type,
          duration_seconds: kind === "video" ? durationSeconds : null,
        });
        if (mediaErr) {
          await supabase.storage.from("media").remove([path]);
          await supabase.from("posts").delete().eq("id", post.id);
          setError(mediaErr.message);
          setBusy(false);
          return;
        }
      }

      router.replace("/following");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setBusy(false);
  }

  return (
    <>
      <PageHeader
        title="New post"
        description={`Up to ${POST_MAX_LENGTH} chars · 1 image or 1 video (${POST_MAX_VIDEO_SECONDS}s max)`}
      />
      <form className="space-y-4 px-5 py-4" onSubmit={(e) => void publish(e)}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={POST_MAX_LENGTH}
          rows={5}
          placeholder="What is happening?"
          className="w-full resize-none rounded-xl border border-chirp-border bg-chirp-bg px-3 py-2 text-[15px] text-chirp-text outline-none ring-chirp-accent focus:ring-2"
        />
        <div className="flex items-center justify-between text-xs text-chirp-muted">
          <span className={remaining < 40 ? "text-chirp-accent" : undefined}>
            {remaining} left
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-chirp-muted">
            Photo or video (optional, one file)
            <input
              type="file"
              accept="image/*,video/*"
              className="mt-1 block w-full text-sm text-chirp-muted file:mr-3 file:rounded-full file:border-0 file:bg-chirp-surface file:px-3 file:py-1.5 file:text-chirp-text hover:file:ring-1 hover:file:ring-chirp-accent"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
              }}
            />
          </label>
        </div>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-chirp-accent px-5 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post"}
        </button>
      </form>
    </>
  );
}
