-- Required when "automatically expose new tables" is OFF.
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.follows to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.post_media to authenticated;
grant select, insert, update, delete on public.likes to authenticated;
grant select, insert, update, delete on public.reposts to authenticated;

grant execute on function public.leaderboard_today_utc(int) to authenticated;
