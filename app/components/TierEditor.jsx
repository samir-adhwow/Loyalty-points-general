import {
  Box,
  FormHelperText,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import Button from "./ui/Button";
import FormTextField from "./ui/FormTextField";
import { Icon } from "@iconify/react";

export default function TierEditor({
  tiers,
  onChange,
  error = false,
  helperText = " ",
}) {
  const updateTierField = (index, field, value) => {
    const updated = tiers.map((tier, i) =>
      i === index ? { ...tier, [field]: value } : tier,
    );
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...tiers, { minAmount: "", maxAmount: "", points: "" }]);
  };

  const handleRemove = (index) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  const isLast = (index) => index === tiers.length - 1;

  return (
    <Box>
      {/* Tier rows */}
      <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}>
        {tiers.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ pl: 0.5 }}>
            No tiers yet. Click "Add Tier" to define a slab.
          </Typography>
        )}

        {tiers.map((tier, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              alignItems: "center",
              width: "100%",
              columnGap: 1,
              mb: 2,
              mt: 1,
            }}
          >
            <FormTextField
              label="Min Amount"
              value={tier.minAmount}
              onChange={(e) =>
                updateTierField(index, "minAmount", e.target.value)
              }
              type="number"
              size="small"
              required
              fullWidth={false}
              sx={{ flex: "1 1 0", minWidth: 0, mr: 0 }}
              inputprops={{
                min: 0,
                "aria-label": `Tier ${index + 1} min amount`,
              }}
            />
            <FormTextField
              label="Max Amount"
              value={tier.maxAmount}
              onChange={(e) =>
                updateTierField(index, "maxAmount", e.target.value)
              }
              type="number"
              size="small"
              fullWidth={false}
              sx={{ flex: "1 1 0", minWidth: 0, mr: 0 }}
              placeholder={isLast(index) ? "No upper limit" : ""}
              inputprops={{
                min: 0,
                "aria-label": `Tier ${index + 1} max amount`,
              }}
            />
            <FormTextField
              label="Points"
              value={tier.points}
              onChange={(e) => updateTierField(index, "points", e.target.value)}
              type="number"
              size="small"
              required
              fullWidth={false}
              sx={{ flex: "1 1 0", minWidth: 0, mr: 0 }}
              inputprops={{ min: 0, "aria-label": `Tier ${index + 1} points` }}
            />
            <Tooltip title="Remove tier">
              <IconButton
                onClick={() => handleRemove(index)}
                size="small"
                color="error"
                aria-label={`Remove tier ${index + 1}`}
                sx={{ mt: 0.25 }}
              >
                <Icon icon="mdi:close" width={20} height={20} />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <Button
        text="Add Tier"
        onClick={handleAdd}
        className="btn_secondary self-start"
      />

      <FormHelperText error={error} sx={{ mt: 0.5 }}>
        {helperText}
      </FormHelperText>
    </Box>
  );
}
