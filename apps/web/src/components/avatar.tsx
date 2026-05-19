import Image from "next/image";

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
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizePx = { sm: 36, md: 44, lg: 88 } as const;

export function Avatar({ displayName, handle, avatarUrl, size = "md" }: Props) {
  const dim =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : size === "lg"
        ? "h-20 w-20 text-xl md:h-[88px] md:w-[88px] md:text-2xl"
        : "h-11 w-11 text-sm";
  const px = sizePx[size];

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={px}
        height={px}
        className={`${dim} shrink-0 rounded-full object-cover ring-2 ring-chirp-accent/40`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-chirp-accent/30 to-chirp-surface font-semibold text-chirp-accent ring-2 ring-chirp-accent/40`}
      aria-hidden
    >
      {initials(displayName, handle)}
    </div>
  );
}
