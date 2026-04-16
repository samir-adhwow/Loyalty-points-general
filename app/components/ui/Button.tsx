"use client";

export default function Button({
  text = "",
  children = null,
  onClick = () => {},
  onMouseEnter = () => {},
  onMouseLeave = () => {},
  className = "btn_primary",
  type = "button",
  ...props
}: {
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  [key: string]: any;
}) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm transition hover:ring-1 hover:ring-offset-2 ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed";

  const btn_primary =
    "bg-primary text-white border border-primary hover:bg-primary/90 hover:ring-primary";
  const btn_secondary =
    "bg-secondary text-white border border-secondary hover:bg-secondary/90 hover:ring-secondary";
  const btn_ghost =
    "bg-slate-200 text-slate-700 border border-slate-200 hover:bg-slate-300 hover:ring-slate-300";

  const variantClassMap: Record<string, string> = {
    btn_primary,
    btn_secondary,
    btn_ghost,
  };

  const resolvedClassName = className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => variantClassMap[token] ?? token)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${resolvedClassName}`.trim()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children || text}
    </button>
  );
}
