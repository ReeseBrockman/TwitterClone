import { AppNav } from "@/components/app-nav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profileHref = "/following";
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("handle")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.handle) profileHref = `/u/${profile.handle}`;
    }
  }

  return (
    <div className="app-shell min-h-dvh w-full text-chirp-text">
      <AppNav profileHref={profileHref} />
      <main className="w-full md:pl-56">
        <div className="mx-auto w-full min-h-dvh max-w-xl box-border px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-3 md:px-4 md:pb-8 md:pt-6">
          <div className="overflow-hidden rounded-2xl border border-chirp-border bg-chirp-surface/90 shadow-2xl shadow-black/50 ring-1 ring-white/5">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
