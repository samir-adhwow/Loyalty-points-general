import { Icon } from "@iconify/react";
import { prettifyKey } from "../RuleValueRenderer";
import FieldBox from "./FieldBox";

export default function SectionGroup({
  label,
  icon,
  keys,
  cols = "grid-cols-2",
  rule,
}: {
  label: string;
  icon: string;
  keys: string[];
  cols?: string;
  rule: Record<string, unknown>;
}) {
  const presentEntries = keys
    .map((k) => [k, rule[k]] as [string, unknown])
    .filter(([k]) => k in rule);

  if (presentEntries.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <span className={`w-1 h-5 rounded-full bg-primary`} />
        <Icon icon={icon} className={`text-base text-primary`} />
        <span
          className={`text-sm font-bold uppercase tracking-widest text-primary`}
        >
          {label}
        </span>
        <span className="flex-1 border-t border-dashed border-primary" />
      </div>

      {/* Fields grid */}
      <div className={`grid ${cols} gap-4 pl-2`}>
        {presentEntries.map(([key, value]) => (
          <FieldBox key={key} label={prettifyKey(key)} value={value ?? ""} />
        ))}
      </div>
    </div>
  );
}
