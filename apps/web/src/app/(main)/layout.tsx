import { AppNav } from "@/components/app-nav";
import { getMyProfileHandle } from "@/lib/supabase/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileHandle = await getMyProfileHandle();

  return (
    <div className="app-shell min-h-dvh w-full text-chirp-text">
      <AppNav profileHandle={profileHandle} />
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
