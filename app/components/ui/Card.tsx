export default function Card({
  title = "",
  subtitle = "",
  children = null,
  childClassName = "",
  sideComponents = null,
}: {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  childClassName?: string;
  sideComponents?: React.ReactNode;
}) {
  const hasHeader = title || subtitle || sideComponents;

  return (
    <div className="rounded-xl border border-primary/30 bg-background shadow-none">
      {hasHeader && (
        <div className="flex items-center justify-between border-b border-primary/40 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            {title && (
              <span className="text-2xl font-semibold text-primary">
                {title}
              </span>
            )}
            {subtitle && (
              <span className="text-[13px] text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
          {sideComponents && (
            <div className="flex items-center gap-2">{sideComponents}</div>
          )}
        </div>
      )}
      <div className={`px-5 py-4 ${childClassName}`}>{children}</div>
    </div>
  );
}
