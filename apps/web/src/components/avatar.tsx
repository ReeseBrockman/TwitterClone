function initials(displayName: string, handle: string) {
  const source = displayName.trim() || handle;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

type Props = {
  displayName: string;
  handle: string;
  size?: "sm" | "md";
};

export function Avatar({ displayName, handle, size = "md" }: Props) {
  const dim = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-chirp-accent/30 to-chirp-surface font-semibold text-chirp-accent ring-2 ring-chirp-accent/40`}
      aria-hidden
    >
      {initials(displayName, handle)}
    </div>
  );
}
