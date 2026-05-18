import { MainNav } from "@/components/main-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-chirp-bg text-chirp-text">
      <MainNav />
      <main className="mx-auto max-w-xl">{children}</main>
    </div>
  );
}
