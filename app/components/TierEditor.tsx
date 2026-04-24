import { Icon } from "@iconify/react";
import Button from "./ui/Button";
import FormTextField from "./ui/FormTextField";

type TierRow = { minAmount: string; maxAmount: string; points: string };

type TierEditorProps = {
  tiers: TierRow[];
  onChange: (tiers: TierRow[]) => void;
};

export default function TierEditor({ tiers, onChange }: TierEditorProps) {
  const update = (index: number, field: keyof TierRow, val: string) => {
    onChange(tiers.map((t, i) => (i === index ? { ...t, [field]: val } : t)));
  };

  const add = () =>
    onChange([...tiers, { minAmount: "", maxAmount: "", points: "" }]);
  const remove = (index: number) =>
    onChange(tiers.filter((_, i) => i !== index));

  return (
    <div className="col-span-full flex flex-col gap-3">
      {/* Column headers */}
      {tiers.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 px-1">
          {["Min Amount", "Max Amount", "Points"].map((h) => (
            <span
              key={h}
              className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400"
            >
              {h}
            </span>
          ))}
          <span />
        </div>
      )}

      {/* Tier rows */}
      <div className="flex flex-col gap-2">
        {tiers.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3">
            <Icon
              icon="fluent:info-24-regular"
              className="text-gray-300 text-base shrink-0"
            />
            <span className="text-xs text-gray-400">
              No tiers yet. Click "Add Tier" to begin.
            </span>
          </div>
        ) : (
          tiers.map((tier, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 items-start"
            >
              <FormTextField
                label=""
                value={tier.minAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update(index, "minAmount", e.target.value)
                }
                type="number"
                size="small"
                fullWidth
                placeholder="0"
              />
              <FormTextField
                label=""
                value={tier.maxAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update(index, "maxAmount", e.target.value)
                }
                type="number"
                size="small"
                fullWidth
                placeholder="0"
              />
              <FormTextField
                label=""
                value={tier.points}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update(index, "points", e.target.value)
                }
                type="number"
                size="small"
                fullWidth
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove tier ${index + 1}`}
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-400 transition-all hover:bg-red-100 hover:text-red-600"
              >
                <Icon icon="fluent:dismiss-20-regular" className="text-sm" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <Button type="button" onClick={add} className="btn_secondary self-start">
        <Icon icon="fluent:add-20-regular" className="text-sm" />
        Add Tier
      </Button>
    </div>
  );
}
