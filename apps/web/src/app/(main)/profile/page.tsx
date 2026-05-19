import { redirect } from "next/navigation";
import { getMyProfileHandle } from "@/lib/supabase/auth";

/** Always sends you to your current public profile (avoids stale handle in nav). */
export default async function MyProfilePage() {
  const handle = await getMyProfileHandle();
  if (!handle) redirect("/settings");
  redirect(`/u/${handle}`);
}
