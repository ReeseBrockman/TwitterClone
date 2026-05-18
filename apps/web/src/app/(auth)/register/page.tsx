"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.replace("/following");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-chirp-border bg-chirp-surface p-6 shadow-xl">
      <h1 className="text-2xl font-bold text-chirp-text">Create account</h1>
      <p className="mt-1 text-sm text-chirp-muted">
        Already have one?{" "}
        <Link href="/login" className="text-chirp-accent hover:underline">
          Log in
        </Link>
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-chirp-muted">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-chirp-border bg-chirp-bg px-3 py-2 text-chirp-text outline-none ring-chirp-accent focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-chirp-muted">
          Password
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-chirp-border bg-chirp-bg px-3 py-2 text-chirp-text outline-none ring-chirp-accent focus:ring-2"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-chirp-accent py-2.5 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
