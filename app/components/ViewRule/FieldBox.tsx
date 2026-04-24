import RuleValueRenderer from "../RuleValueRenderer";

export default function FieldBox({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-white px-3.5 py-3 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-150">
      <span className="text-xs font-bold uppercase tracking-widest text-label">
        {label}
      </span>
      <div>
        <RuleValueRenderer
          value={typeof value === "string" ? value.replace("_", " ") : value}
          itemKey={label}
          depth={0}
        />
      </div>
    </div>
  );
}
