export function prettifyKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

export function formatRuleValue(key, value) {
  if (value === null || value === undefined || value === "") return "-";

  const loweredKey = key.toLowerCase();
  if (
    loweredKey.includes("date") ||
    loweredKey.includes("from") ||
    loweredKey.includes("to")
  ) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }

  if (typeof value === "object") return value;

  return String(value);
}

export default function RuleValueRenderer({ value, itemKey = "", depth = 0 }) {
  value = formatRuleValue(itemKey, value);

  if (value === null || value === undefined || value === "") {
    return <span className="text-sm text-gray-400 italic">—</span>;
  }

  const isCompactLevel = depth >= 2;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-sm text-gray-400 italic">Empty list</span>;
    }
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {value.map((item, index) => (
          <div
            key={`${itemKey}-arr-${index}`}
            className="border border-dashed border-primary/20 rounded-lg p-2 bg-primary/2 flex-1 min-w-[220px]"
          >
            <RuleValueRenderer
              value={item}
              itemKey={`${itemKey}-${index}`}
              depth={depth + 1}
            />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className="text-sm text-gray-400 italic">—</span>;
    }

    if (isCompactLevel) {
      return (
        <div className="flex flex-col gap-1">
          {entries.map(([nestedKey, nestedValue]) => (
            <div
              key={`${itemKey}-${nestedKey}`}
              className="flex gap-3 items-start"
            >
              <span className="text-xs text-gray-400 shrink-0 min-w-[120px]">
                {prettifyKey(nestedKey)}:
              </span>
              <div className="flex-1">
                <RuleValueRenderer
                  value={nestedValue}
                  itemKey={`${itemKey}-${nestedKey}`}
                  depth={depth + 1}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {entries.map(([nestedKey, nestedValue]) => (
          <div
            key={`${itemKey}-${nestedKey}`}
            className="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5"
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400">
              {prettifyKey(nestedKey)}
            </span>
            <div className="mt-1">
              <RuleValueRenderer
                value={nestedValue}
                itemKey={`${itemKey}-${nestedKey}`}
                depth={depth + 1}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className="text-sm font-mono break-all whitespace-pre-wrap text-gray-800">
      {String(value)}
    </span>
  );
}
