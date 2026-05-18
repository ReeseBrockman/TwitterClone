import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthBranding } from "@/components/auth-branding";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/following");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <AuthBranding />
      <div className="flex flex-row flex-nowrap justify-center gap-3">
        <Link
          href="/login"
          className="rounded-full bg-chirp-accent px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-chirp-accent px-5 py-2.5 text-sm font-semibold text-chirp-accent hover:bg-chirp-accent/10"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
