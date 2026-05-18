import { AppNav } from "@/components/app-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen text-chirp-text">
      <AppNav />
      <main className="md:pl-56">
        <div className="mx-auto min-h-screen max-w-xl px-3 pb-24 pt-3 md:px-4 md:pb-8 md:pt-6">
          <div className="overflow-hidden rounded-2xl border border-chirp-border bg-chirp-surface/90 shadow-2xl shadow-black/50 ring-1 ring-white/5">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
