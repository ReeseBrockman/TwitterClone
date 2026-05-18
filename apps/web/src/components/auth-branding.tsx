export function AuthBranding({ size = "lg" }: { size?: "lg" | "sm" }) {
  const titleClass =
    size === "lg"
      ? "text-4xl font-bold tracking-tight text-chirp-text"
      : "text-3xl font-bold tracking-tight text-chirp-text";
  const taglineClass =
    size === "lg" ? "mt-3 text-lg text-chirp-muted" : "mt-2 text-base text-chirp-muted";
  const soonClass =
    size === "lg" ? "mt-2 text-base text-chirp-muted" : "mt-1 text-sm text-chirp-muted";

  return (
    <div className="text-center">
      <h1 className={titleClass}>chirp.</h1>
      <p className={taglineClass}>Natural social, pre algorithm.</p>
      <p className={soonClass}>Coming soon.</p>
    </div>
  );
}
