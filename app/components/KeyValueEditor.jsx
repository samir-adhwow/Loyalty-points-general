import { Box, FormHelperText, IconButton, Typography } from "@mui/material";
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
    const updated = rows.map((row, i) =>
      i === index ? { ...row, key: newKey } : row,
    );
    onChange(updated);
  };

  const handleValueChange = (index, newValue) => {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, value: newValue } : row,
    );
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...rows, { key: "", value: "" }]);
  };

  const handleRemove = (index) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography
        variant="body2"
        fontWeight={500}
        mb={1}
        color={error ? "error.main" : "text.secondary"}
      >
        {label}
      </Typography>

      <Box display="flex" flexdirection="column" rowgap={2}>
        {rows.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ pl: 0.5 }}>
            No entries yet. Click "Add Entry" to begin.
          </Typography>
        )}

        {rows.map((row, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexdirection: "row",
              flexWrap: "nowrap",
              alignitems: "center",
              width: "100%",
              columnGap: 1,
              mb: 2,
              mt: 1,
            }}
          >
            <FormTextField
              label="Key"
              value={row.key}
              onChange={(e) => handleKeyChange(index, e.target.value)}
              size="small"
              fullWidth={false}
              sx={{ flex: "1 1 0", minWidth: 0, mr: 0 }}
            />
            <FormTextField
              label="Value"
              value={row.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              size="small"
              fullWidth={false}
              sx={{ flex: "1 1 0", minWidth: 0, mr: 0 }}
              inputprops={{ "aria-label": `${label} value ${index + 1}` }}
            />
            <IconButton
              onClick={() => handleRemove(index)}
              size="small"
              color="error"
              aria-label={`Remove entry ${index + 1}`}
              sx={{ mt: 0.25 }}
            >
              &times;
            </IconButton>
          </Box>
        ))}
      </Box>

      <Button
        text="Add Entry"
        onClick={handleAdd}
        className="btn_secondary mt-1"
      />

      <FormHelperText error={error} sx={{ mt: 0.5 }}>
        {helperText}
      </FormHelperText>
    </Box>
  );
}
