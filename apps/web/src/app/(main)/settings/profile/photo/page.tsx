"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import { avatarPublicUrl } from "@/lib/avatar-url";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function extFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export default function ProfilePhotoPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("handle, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && profile) {
        setHandle(profile.handle);
        setDisplayName(profile.display_name ?? "");
        setAvatarPath(profile.avatar_url);
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function upload(file: File) {
    setMessage(null);
    setError(null);
    if (!file.type.startsWith("image/") || !ACCEPT.includes(file.type)) {
      setError("Use a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setBusy(false);
      return;
    }

    const ext = extFromMime(file.type);
    const path = `${user.id}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", user.id);

    setBusy(false);
    if (profileErr) {
      setError(profileErr.message);
      return;
    }

    setAvatarPath(path);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setMessage("Profile photo updated.");
    router.refresh();
  }

  async function removePhoto() {
    setMessage(null);
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setBusy(false);
      return;
    }

    if (avatarPath) {
      await supabase.storage.from("media").remove([avatarPath]);
    }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    setBusy(false);
    if (profileErr) {
      setError(profileErr.message);
      return;
    }

    setAvatarPath(null);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setMessage("Profile photo removed.");
    router.refresh();
  }

  if (loading) {
    return <div className="px-5 py-8 text-chirp-muted">Loading…</div>;
  }

  const shownUrl =
    previewUrl ?? avatarPublicUrl(avatarPath) ?? undefined;

  return (
    <div className="px-5 py-6">
      <p className="text-sm text-chirp-muted">
        Square images work best. Max 2 MB.
      </p>

      <div className="mt-6 flex flex-col items-center gap-4">
        <Avatar
          displayName={displayName}
          handle={handle}
          avatarUrl={shownUrl ?? null}
          size="lg"
        />

        <label className="block w-full max-w-xs text-sm font-medium text-chirp-muted">
          Choose photo
          <input
            type="file"
            accept={ACCEPT}
            disabled={busy}
            className="mt-1 block w-full text-sm text-chirp-muted file:mr-3 file:rounded-full file:border-0 file:bg-chirp-surface file:px-3 file:py-1.5 file:text-chirp-text hover:file:ring-1 hover:file:ring-chirp-accent disabled:opacity-50"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
              }
              setPreviewUrl(URL.createObjectURL(file));
              void upload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {avatarPath ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void removePhoto()}
          className="mt-6 text-sm text-chirp-muted hover:text-red-400 disabled:opacity-50"
        >
          Remove photo
        </button>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 text-sm text-chirp-accent" role="status">
          {message}
        </p>
      ) : null}
      {busy ? (
        <p className="mt-2 text-xs text-chirp-muted">Uploading…</p>
      ) : null}
    </div>
  );
}
