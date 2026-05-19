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
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-8 text-center sm:gap-8 sm:px-6 sm:py-16">
      <AuthBranding />
      <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/login"
          className="rounded-full bg-chirp-accent px-5 py-2.5 text-center text-sm font-semibold text-black hover:brightness-110"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-chirp-accent px-5 py-2.5 text-center text-sm font-semibold text-chirp-accent hover:bg-chirp-accent/10"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
