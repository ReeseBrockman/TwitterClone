export function FeedTitle({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      feed<span className="text-chirp-accent">.</span>
    </span>
  );
}
