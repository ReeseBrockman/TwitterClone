-- Today leaderboard: likes + replies only (no repost term; product has no repost UI).
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
      + (select count(*)::numeric from public.posts c where c.parent_id = p.id) * 1
    ) as score
  from public.posts p
  where p.parent_id is null
    and (p.created_at at time zone 'utc')::date = (now() at time zone 'utc')::date
  order by score desc, p.created_at desc
  limit greatest(1, least(p_limit, 100));
$$;
