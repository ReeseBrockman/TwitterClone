import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** One auth lookup per request (layout + page share the same result). */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});

export const getMyProfileHandle = cache(async () => {
  const { supabase, user } = await getAuthUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.handle ?? null;
});
