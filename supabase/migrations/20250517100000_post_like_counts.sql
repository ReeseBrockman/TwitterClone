-- Aggregate like counts for a set of posts (avoids loading every like row in the feed).
create or replace function public.post_like_counts(p_post_ids uuid[])
returns table(post_id uuid, like_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select l.post_id, count(*)::bigint
  from public.likes l
  where l.post_id = any(p_post_ids)
  group by l.post_id;
$$;

grant execute on function public.post_like_counts(uuid[]) to authenticated;
