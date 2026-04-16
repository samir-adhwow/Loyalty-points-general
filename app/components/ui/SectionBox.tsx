import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type SectionBoxProps = {
  title: string;
  children: ReactNode;
};

export default function SectionBox({ title, children }: SectionBoxProps) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "#cbd5e1",
        borderRadius: 2,
        p: 3,
        boxShadow: "0 4px 12px 0 rgba(0,0,0,0.14)", // more fuzzy shadow
      }}
    >
      <Typography
        variant="overline"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
          color: "#1c88bd",
          fontWeight: 700,
          "&::after": {
            content: '""',
            flex: 1,
            height: "1px",
            bgcolor: "#1c88bd66",
          },
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}
