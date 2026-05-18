import Link from "next/link";

export function SetupRequired() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-bold text-chirp-text">Backend not connected yet</h1>
      <p className="mt-3 text-sm leading-relaxed text-chirp-muted">
        The UI is running, but Supabase is not configured. Create a free project at{" "}
        <a
          href="https://supabase.com/dashboard"
          className="text-chirp-accent underline"
          target="_blank"
          rel="noreferrer"
        >
          supabase.com
        </a>
        , run the SQL migrations in this repo, then add your URL and anon key to{" "}
        <code className="rounded bg-chirp-surface px-1 font-mono text-chirp-text">
          apps/web/.env.local
        </code>{" "}
        and restart the dev server.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-chirp-muted">
        <li>New project → save the database password in a password manager.</li>
        <li>
          SQL Editor: run{" "}
          <code className="font-mono text-chirp-text">
            supabase/migrations/20250514120000_init.sql
          </code>{" "}
          then{" "}
          <code className="font-mono text-chirp-text">
            20250515100000_leaderboard_no_reposts.sql
          </code>
        </li>
        <li>
          Settings → API: copy Project URL + anon public key into{" "}
          <code className="font-mono text-chirp-text">.env.local</code>
        </li>
        <li>
          Auth → Email: enable email provider (optional: turn off confirm email for
          demos).
        </li>
      </ol>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-chirp-accent px-5 py-2 text-sm font-semibold text-black"
      >
        Back to home
      </Link>
    </div>
  );
}
