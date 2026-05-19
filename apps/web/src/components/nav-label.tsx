export function NavLabel({
  word,
  className = "",
}: {
  word: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {word}
      <span className="text-chirp-accent">.</span>
    </span>
  );
}
