-- Chirp: schema + RLS (Supabase Postgres)
-- Feed: chronological from follows only (enforced in app queries).
-- Leaderboard: global, UTC calendar day (computed in app or via RPC).

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle citext not null unique,
  display_name text not null default '',
  avatar_url text,
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint handle_format check (handle ~ '^[a-zA-Z0-9_]{2,30}$')
);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index follows_follower_idx on public.follows (follower_id);
create index follows_following_idx on public.follows (following_id);

-- Root posts have parent_id null; replies reference parent root (flat thread for MVP).
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.posts (id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  constraint content_length check (char_length(content) <= 280)
);

create index posts_author_created_idx on public.posts (author_id, created_at desc);
create index posts_created_idx on public.posts (created_at desc);
create index posts_parent_idx on public.posts (parent_id) where parent_id is not null;

-- At most one media row per post (image OR video).
create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null,
  mime_type text not null,
  width int,
  height int,
  duration_seconds numeric(10,2),
  created_at timestamptz not null default now(),
  constraint post_media_one_per_post unique (post_id),
  constraint video_duration_cap check (
    kind <> 'video' or (duration_seconds is not null and duration_seconds <= 60)
  )
);

create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index likes_post_idx on public.likes (post_id);

create table public.reposts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index reposts_post_idx on public.reposts (post_id);

-- New user profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  h text;
  n int := 0;
begin
  base := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
  if base is null or length(base) < 2 then
    base := 'user';
  end if;
  base := left(base, 26);
  h := base;
  while exists (select 1 from public.profiles p where p.handle = h::citext) loop
    n := n + 1;
    h := left(base, 20) || n::text;
  end loop;
  insert into public.profiles (id, handle, display_name)
  values (new.id, h::citext, coalesce(new.raw_user_meta_data->>'full_name', h));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.likes enable row level security;
alter table public.reposts enable row level security;

-- Profiles: readable to logged-in users; users update own
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated using (true);

create policy "profiles_update_own"
  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Follow graph
create policy "follows_select_authenticated"
  on public.follows for select to authenticated using (true);

create policy "follows_insert_self"
  on public.follows for insert to authenticated
  with check (follower_id = auth.uid());

create policy "follows_delete_self"
  on public.follows for delete to authenticated using (follower_id = auth.uid());

-- Posts
create policy "posts_select_authenticated"
  on public.posts for select to authenticated using (true);

create policy "posts_insert_authenticated"
  on public.posts for insert to authenticated
  with check (author_id = auth.uid());

create policy "posts_update_own"
  on public.posts for update to authenticated using (author_id = auth.uid());

create policy "posts_delete_own"
  on public.posts for delete to authenticated using (author_id = auth.uid());

-- Media
create policy "post_media_select_authenticated"
  on public.post_media for select to authenticated using (true);

create policy "post_media_insert_author"
  on public.post_media for insert to authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

create policy "post_media_delete_author"
  on public.post_media for delete to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

-- Likes
create policy "likes_select_authenticated"
  on public.likes for select to authenticated using (true);

create policy "likes_insert_self"
  on public.likes for insert to authenticated with check (user_id = auth.uid());

create policy "likes_delete_self"
  on public.likes for delete to authenticated using (user_id = auth.uid());

-- Reposts
create policy "reposts_select_authenticated"
  on public.reposts for select to authenticated using (true);

create policy "reposts_insert_self"
  on public.reposts for insert to authenticated with check (user_id = auth.uid());

create policy "reposts_delete_self"
  on public.reposts for delete to authenticated using (user_id = auth.uid());

-- Storage: public bucket for demo (read). Upload limited to own folder prefix = user id.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read"
  on storage.objects for select to public using (bucket_id = 'media');

create policy "media_insert_own_prefix"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "media_update_own_prefix"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'media'
    and owner = auth.uid()
  );

create policy "media_delete_own_prefix"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'media'
    and owner = auth.uid()
  );

-- Today's leaderboard (UTC calendar day). Score = likes*1 + reposts*2 + replies*1.
create or replace function public.leaderboard_today_utc(p_limit int default 50)
returns table (
  post_id uuid,
  author_id uuid,
  content text,
  created_at timestamptz,
  score numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id,
    p.author_id,
    p.content,
    p.created_at,
    (
      (select count(*)::numeric from public.likes l where l.post_id = p.id) * 1
      + (select count(*)::numeric from public.reposts r where r.post_id = p.id) * 2
      + (select count(*)::numeric from public.posts c where c.parent_id = p.id) * 1
    ) as score
  from public.posts p
  where p.parent_id is null
    and (p.created_at at time zone 'utc')::date = (now() at time zone 'utc')::date
  order by score desc, p.created_at desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.leaderboard_today_utc(int) to authenticated;
