type Props = {
  title: string;
  description?: string;
  badge?: string;
};

export function PageHeader({ title, description, badge }: Props) {
  return (
    <header className="border-b border-chirp-border bg-chirp-bg/60 px-5 py-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-chirp-text">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-chirp-muted">{description}</p>
          ) : null}
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full border border-chirp-accent/40 bg-chirp-accent/10 px-2.5 py-1 text-xs font-medium text-chirp-accent">
            {badge}
          </span>
        ) : null}
      </div>
    </header>
  );
}
