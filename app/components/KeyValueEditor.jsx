import { Icon } from "@iconify/react";
import Button from "./ui/Button";
import FormTextField from "./ui/FormTextField";

export default function KeyValueEditor({
  label,
  rows,
  onChange,
  error = false,
  helperText = " ",
}) {
  const handleKeyChange = (index, newKey) => {
    onChange(
      rows.map((row, i) => (i === index ? { ...row, key: newKey } : row)),
    );
  };

  const handleValueChange = (index, newValue) => {
    onChange(
      rows.map((row, i) => (i === index ? { ...row, value: newValue } : row)),
    );
  };

  const handleAdd = () => onChange([...rows, { key: "", value: "" }]);
  const handleRemove = (index) => onChange(rows.filter((_, i) => i !== index));

  return (
    <div className="col-span-full flex flex-col gap-3">
      {/* Rows */}
      <div className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3">
            <Icon
              icon="fluent:info-24-regular"
              className="text-gray-300 text-base shrink-0"
            />
            <span className="text-xs text-gray-400">
              No entries yet. Click "Add Entry" to begin.
            </span>
          </div>
        ) : (
          rows.map((row, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <FormTextField
                  label="Key"
                  value={row.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  size="small"
                  fullWidth
                />
              </div>
              <div className="flex-1">
                <FormTextField
                  label="Value"
                  value={row.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  size="small"
                  fullWidth
                  inputprops={{ "aria-label": `${label} value ${index + 1}` }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Remove entry ${index + 1}`}
                className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-400 transition-all hover:bg-red-100 hover:text-red-600"
              >
                <Icon icon="fluent:dismiss-20-regular" className="text-sm" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleAdd} className="btn_secondary">
          <Icon icon="fluent:add-20-regular" className="text-sm" />
          Add Entry
        </Button>
        {error && helperText !== " " && (
          <span className="text-xs text-red-500">{helperText}</span>
        )}
      </div>
    </div>
  );
}
