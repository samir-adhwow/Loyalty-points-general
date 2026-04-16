"use client";

import MuiTextField from "@mui/material/TextField";

export default function FormTextField({
  required = false,
  fullWidth = true,
  slotProps,
  sx,
  disabled = false,
  ...props
}: {
  required?: boolean;
  fullWidth?: boolean;
  slotProps?: any;
  sx?: any;
  disabled?: boolean;
  [key: string]: any;
}) {
  return (
    <MuiTextField
      required={required}
      fullWidth={fullWidth}
      disabled={disabled}
      sx={{
        ...(sx || {}),
        ...(disabled
          ? {
              "& .MuiInputBase-root.Mui-disabled": {
                backgroundColor: "#f3f4f6",
              },
            }
          : {}),
      }}
      slotProps={{
        ...slotProps,
        inputLabel: {
          ...(slotProps?.inputLabel || {}),
          sx: {
            ...(slotProps?.inputLabel?.sx || {}),
            "& .MuiFormLabel-asterisk": {
              color: "error.main",
            },
          },
        },
      }}
      {...props}
    />
  );
}
