# Chirp

Monorepo: chronological **Following** feed (only people you follow, newest first), **Today (UTC)** global board (score = **likes + replies**, no repost UI), email/password auth, **Supabase** (Postgres + Storage). Web has full media compose; mobile supports **one photo** per post plus text.

## Stack

- **Web:** `apps/web` (Next.js 16) → deploy on [Vercel](https://vercel.com) Hobby.
- **Mobile:** `apps/mobile` (Expo 54) → Expo Go or EAS builds.
- **Backend:** [Supabase](https://supabase.com) free tier.

---

## From zero to running (step by step)

### 1. Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. **New project** → pick organization, name, **database password**, region → create.
3. Wait until the project is healthy.

#### Database password (what to use)

Use a **long random password** (for example **20+ characters**) from a password manager generator. You do **not** put this password into Chirp’s Next.js or Expo env files; it is for **Postgres itself** (backups, external DB tools, rare direct connections). Save it in your password manager.

#### The three security toggles (typical choices for Chirp)

| Toggle | Recommendation | Why |
|--------|------------------|-----|
| **Enable Data API** | **On** | The JavaScript client talks to Supabase through the Data API (PostgREST). Off would break the normal app setup unless you use a different architecture. |
| **Automatically expose new tables** | **Off** (preferred) | Safer default: new tables are not visible to the API until you intentionally grant access. Chirp’s SQL migrations create your tables; if Supabase shows an error about **missing privileges** on a table, run the **suggested `GRANT` SQL** from the dashboard once. |
| **Enable automatic RLS** | **On** (preferred) | New `public` tables get **RLS turned on automatically**, which defaults to “no access” until you add policies. Our migrations also define explicit RLS policies—together that matches an industry-style “secure by default” posture. |

### 2. Run the database migrations

You need **both** SQL files in order (the second updates the leaderboard function).

**Option A — SQL Editor (simplest)**

1. In Supabase: **SQL Editor** → **New query**.
2. Paste the full contents of `supabase/migrations/20250514120000_init.sql` → **Run**.
3. New query → paste `supabase/migrations/20250515100000_leaderboard_no_reposts.sql` → **Run**.

**Option B — Supabase CLI**

Install the CLI, link the project, then `supabase db push` from this repo if you add a root `config.toml` later.

### 3. Auth settings (email + password)

1. **Authentication** → **Providers** → **Email** → ensure it is enabled.
2. For a **demo** where friends can sign up quickly: **Authentication** → **Providers** → **Email** and consider disabling **Confirm email** (optional; less secure but fewer support emails).

### 4. Get API keys

1. **Project Settings** (gear) → **API**.
2. Copy **Project URL** and the **anon public** key (not the service role key).

### 5. Web app environment

1. In `apps/web`, copy `.env.example` to `.env.local`.
2. Set:

   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key  

3. From the **repository root**:

   ```bash
   npm install
   npm run dev:web
   ```

4. Open [http://localhost:3000](http://localhost:3000) → **Create account** → then use **Following**, **Today**, **Post**, **Settings**.

### 6. Mobile app environment

1. Create `apps/mobile/.env` (same folder as `app.json`) with:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

2. From repo root:

   ```bash
   npm run dev:mobile
   ```

3. Scan the QR code with **Expo Go** (iOS/Android). Grant **photo library** access when you add an image to a post.

> **Native rebuild:** If you change `app.json` plugins (e.g. image picker), run a new dev client / EAS build; Expo Go already includes many native modules, but release builds need matching config.

### 7. Deploy web (optional, Vercel)

1. Push the repo to GitHub.
2. Import the repo in Vercel; set **Root Directory** to `apps/web` (or deploy from monorepo with that root).
3. Add the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel → **Settings** → **Environment Variables**.
4. Deploy. Share `https://your-app.vercel.app/register` for sign-ups.

### 8. Invite friends

Send them your deployed URL + `/register` (or local URL for testing). They each get a profile (auto handle from email until they change it under **Settings** on web or **Account** on mobile).

---

## Product rules

- Posts: **280** characters; **one** image **or** **one** video on **web**; video **≤ 60s** on web. **Mobile:** text and/or **one JPEG/PNG/WebP** (HEIC blocked for now).
- **Following:** chronological, followed authors only, root posts.
- **Today:** UTC calendar day, global, score = **likes + replies** (reposts are not part of the product UI or score).

## Repo layout

- `apps/web` — Auth, feeds, **Search** (`/search`), compose + media, likes, `/u/[handle]`, **Profile** (`/settings`: handle, display name, bio).
- `apps/mobile` — Auth, **stack + tabs**: Following, **Search** (usernames), Today, Post (text + photo), **Profile** (you + follow from **UserProfile** opened from Search).
- `packages/shared` — Limits and `isValidHandle`.
- `supabase/migrations` — Schema, RLS, storage, `leaderboard_today_utc`.
