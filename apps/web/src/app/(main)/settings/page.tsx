"use client";

import { useEffect, useState } from "react";
import { isValidHandle, DISPLAY_NAME_MAX, BIO_MAX } from "@chirp/shared";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [handle, setHandle] = useState("");
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
        .select("handle, display_name, bio")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && profile) {
        setHandle(profile.handle);
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
    const nextHandle = handle.trim().toLowerCase();
    if (!isValidHandle(nextHandle)) {
      setError(
        "Username must be 2–30 characters: letters, numbers, and underscores only.",
      );
      return;
    }
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
        handle: nextHandle,
        display_name: name,
        bio: bioText,
      })
      .eq("id", user.id);
    setSaving(false);
    if (upErr) {
      if (
        upErr.code === "23505" ||
        upErr.message?.toLowerCase().includes("duplicate")
      ) {
        setError("That username is already taken. Try another.");
      } else {
        setError(upErr.message);
      }
      return;
    }
    setHandle(nextHandle);
    setMessage("Saved. Your profile URL is now /u/" + nextHandle);
  }

  if (loading) {
    return (
      <div className="border-b border-chirp-border px-4 py-8 text-chirp-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="border-b border-chirp-border px-4 py-6">
      <h1 className="text-xl font-bold text-chirp-text">Profile & account</h1>
      <p className="mt-1 text-sm text-chirp-muted">
        Change your username (@handle), display name, and bio. Usernames must stay
        unique across the app.
      </p>
      <form className="mt-6 max-w-md space-y-4" onSubmit={(e) => void save(e)}>
        <label className="block text-sm font-medium text-chirp-muted">
          Username (handle)
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            autoComplete="username"
            className="mt-1 w-full rounded-xl border border-chirp-border bg-chirp-bg px-3 py-2 font-mono text-chirp-text outline-none ring-chirp-accent focus:ring-2"
            placeholder="your_handle"
          />
        </label>
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
    </div>
  );
}
