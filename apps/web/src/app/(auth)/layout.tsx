import { AuthBranding } from "@/components/auth-branding";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-chirp-bg px-4 py-12">
      <AuthBranding size="sm" />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
