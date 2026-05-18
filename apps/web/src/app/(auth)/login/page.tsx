import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-chirp-border bg-chirp-surface p-6 text-chirp-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
