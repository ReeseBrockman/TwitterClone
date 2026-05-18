export function ChirpLogo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={className}>
      chirp<span className="text-chirp-accent">.</span>
    </span>
  );
}
