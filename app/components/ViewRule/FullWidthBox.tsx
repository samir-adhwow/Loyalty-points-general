import RuleValueRenderer from "../RuleValueRenderer";

export default function FullWidthBox({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-white shadow-sm overflow-hidden mt-6">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-primary/20">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
        <span className="text-sm font-bold uppercase tracking-widest text-primary">
          {label}
        </span>
      </div>
      <div className="px-4 py-3">
        <RuleValueRenderer value={value} itemKey={label} depth={0} />
      </div>
    </div>
  );
}
