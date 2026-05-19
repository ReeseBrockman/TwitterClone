import { ChirpLogo } from "@/components/chirp-logo";

export function AuthBranding({ size = "lg" }: { size?: "lg" | "sm" }) {
  const titleClass =
    size === "lg"
      ? "text-3xl font-bold tracking-tight text-chirp-text sm:text-4xl"
      : "text-2xl font-bold tracking-tight text-chirp-text sm:text-3xl";
  const taglineClass =
    size === "lg"
      ? "mt-3 text-base text-chirp-muted sm:text-lg"
      : "mt-2 text-sm text-chirp-muted sm:text-base";
  const soonClass =
    size === "lg" ? "mt-2 text-base text-chirp-muted" : "mt-1 text-sm text-chirp-muted";

  return (
    <div className="w-full max-w-sm text-center">
      <h1 className={titleClass}>
        <ChirpLogo />
      </h1>
      <p className={taglineClass}>Natural social, pre algorithm.</p>
      <p className={soonClass}>In Development*</p>
    </div>
  );
}
