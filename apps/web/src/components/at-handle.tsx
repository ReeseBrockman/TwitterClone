export function AtHandle({
  handle,
  className = "",
}: {
  handle: string;
  className?: string;
}) {
  return (
    <span className={`font-mono text-chirp-accent ${className}`.trim()}>
      @{handle}
    </span>
  );
}
