"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BIO_MAX, DISPLAY_NAME_MAX } from "@chirp/shared";
import { createClient } from "@/lib/supabase/client";

export default function EditProfilePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        .select("display_name, bio")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && profile) {
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const name = displayName.trim();
    if (name.length > DISPLAY_NAME_MAX) {
      setError(`Display name must be ${DISPLAY_NAME_MAX} characters or less.`);
      return;
    }
    const bioText = bio.trim();
    if (bioText.length > BIO_MAX) {
      setError(`Bio must be ${BIO_MAX} characters or less.`);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setSaving(false);
      return;
    }
    const { error: upErr } = await supabase
      .from("profiles")
      .update({
        display_name: name,
        bio: bioText,
      })
      .eq("id", user.id);
    setSaving(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setMessage("Saved.");
    router.refresh();
  }

  if (loading) {
    return <div className="px-5 py-8 text-chirp-muted">Loading…</div>;
  }

  return (
    <>
      <header className="border-b border-chirp-border bg-chirp-bg/60 px-5 py-4 backdrop-blur-sm">
        <Link
          href="/settings"
          className="text-sm text-chirp-muted hover:text-chirp-accent"
        >
          ← Settings
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-chirp-text">
          Edit profile
        </h1>
        <p className="mt-1 text-sm text-chirp-muted">Display name and bio</p>
      </header>
      <form className="max-w-md space-y-4 px-5 py-6" onSubmit={(e) => void save(e)}>
        <label className="block text-sm font-medium text-chirp-muted">
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={DISPLAY_NAME_MAX}
            className="mt-1 w-full rounded-xl border border-chirp-border bg-chirp-bg px-3 py-2 text-chirp-text outline-none ring-chirp-accent focus:ring-2"
            placeholder="Name shown on posts"
          />
        </label>
        <label className="block text-sm font-medium text-chirp-muted">
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            rows={4}
            className="mt-1 w-full resize-none rounded-xl border border-chirp-border bg-chirp-bg px-3 py-2 text-chirp-text outline-none ring-chirp-accent focus:ring-2"
            placeholder="Short bio"
          />
        </label>
        <p className="text-xs text-chirp-muted">{BIO_MAX - bio.length} left</p>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-chirp-accent" role="status">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-chirp-accent px-5 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </>
  );
}
