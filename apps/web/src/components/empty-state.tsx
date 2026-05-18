import Link from "next/link";

type Props = {
  title: string;
  description: string;
  action?: { href: string; label: string };
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-chirp-accent/40 bg-chirp-accent/10 ring-4 ring-chirp-accent/10">
        <span className="h-2 w-2 rounded-full bg-chirp-accent" />
      </div>
      <h2 className="text-lg font-semibold text-chirp-text">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-chirp-muted">
        {description}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 rounded-full bg-chirp-accent px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
