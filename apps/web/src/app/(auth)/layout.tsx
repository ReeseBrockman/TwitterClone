import { AuthBranding } from "@/components/auth-branding";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-chirp-bg px-4 py-8 sm:gap-8 sm:py-12">
      <AuthBranding size="sm" />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
