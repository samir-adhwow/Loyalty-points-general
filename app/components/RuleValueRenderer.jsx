import { Typography, Stack, Box } from "@mui/material";

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

  if (typeof value === "object") {
    return value;
  }

  return String(value);
}

export default function RuleValueRenderer({ value, itemKey = "", depth = 0 }) {
  value = formatRuleValue(itemKey, value);

  if (value === null || value === undefined || value === "") {
    return (
      <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
        -
      </Typography>
    );
  }

  const isCompactLevel = depth >= 2;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
          Empty list
        </Typography>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {value.map((item, index) => (
          <Box
            key={`${itemKey}-arr-${index}`}
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1.5,
              p: 1,
              bgcolor: "background.default",
              flex: "1 1 280px",
              minWidth: 0,
            }}
          >
            <RuleValueRenderer
              value={item}
              itemKey={`${itemKey}-${index}`}
              depth={depth + 1}
            />
          </Box>
        ))}
      </Box>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return (
        <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
          Empty object
        </Typography>
      );
    }

    if (isCompactLevel) {
      return (
        <Stack spacing={0.5}>
          {entries.map(([nestedKey, nestedValue]) => (
            <Stack
              key={`${itemKey}-${nestedKey}`}
              direction="row"
              spacing={1}
              alignitems="flex-start"
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  minWidth: 140,
                  fontSize: "1rem",
                }}
              >
                {prettifyKey(nestedKey)}:
              </Typography>
              <Box sx={{ flex: 1 }}>
                <RuleValueRenderer
                  value={nestedValue}
                  itemKey={`${itemKey}-${nestedKey}`}
                  depth={depth + 1}
                />
              </Box>
            </Stack>
          ))}
        </Stack>
      );
    }

    return (
      <Stack spacing={1}>
        {entries.map(([nestedKey, nestedValue]) => (
          <Box
            key={`${itemKey}-${nestedKey}`}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              p: 1,
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {prettifyKey(nestedKey)}
            </Typography>
            <Box sx={{ mt: 0.25 }}>
              <RuleValueRenderer
                value={nestedValue}
                itemKey={`${itemKey}-${nestedKey}`}
                depth={depth + 1}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Typography
      sx={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "var(--font-geist-mono)",
        fontSize: "1rem",
      }}
    >
      {String(value)}
    </Typography>
  );
}
