"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function sanitize(q: string) {
  return q.replace(/\\/g, "").replace(/%/g, "").replace(/_/g, "").trim();
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [rows, setRows] = useState<
    { id: string; handle: string; display_name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 320);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const term = sanitize(debounced);
    if (term.length < 1) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    void supabase
      .from("profiles")
      .select("id, handle, display_name")
      .ilike("handle", `%${term}%`)
      .order("handle", { ascending: true })
      .limit(40)
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoading(false);
        if (error) {
          setRows([]);
          return;
        }
        setRows(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="border-b border-chirp-border px-4 py-4">
      <h1 className="text-xl font-bold text-chirp-text">Search</h1>
      <p className="text-sm text-chirp-muted">
        Find people by @handle (partial match).
      </p>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search username"
        className="mt-4 w-full rounded-xl border border-chirp-border bg-chirp-bg px-3 py-2 text-chirp-text outline-none ring-chirp-accent focus:ring-2"
        autoComplete="off"
      />
      {loading && debounced.trim().length > 0 ? (
        <p className="mt-4 text-sm text-chirp-muted">Searching…</p>
      ) : null}
      <ul className="mt-4 divide-y divide-chirp-border">
        {rows.length === 0 && debounced.trim().length > 0 && !loading ? (
          <li className="py-6 text-center text-sm text-chirp-muted">
            No matches.
          </li>
        ) : null}
        {rows.map((p) => (
          <li key={p.id} className="py-3">
            <Link
              href={`/u/${p.handle}`}
              className="block hover:opacity-90"
            >
              <span className="font-semibold text-chirp-text">
                {p.display_name?.trim() || p.handle}
              </span>
              <span className="ml-2 font-mono text-sm text-chirp-accent">
                @{p.handle}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {debounced.trim().length < 1 ? (
        <p className="mt-6 text-sm text-chirp-muted">
          Type at least one character to search.
        </p>
      ) : null}
    </div>
  );
}
