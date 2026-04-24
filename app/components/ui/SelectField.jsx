import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Select,
} from "@mui/material";

export default function SelectField({
  dataField,
  label,
  value,
  onChange,
  error,
  helperText,
  required = true,
  children,
}) {
  return (
    <Grid data-field={dataField}>
      <FormControl fullWidth error={Boolean(error)}>
        <InputLabel
          required={required}
          sx={{ "& .MuiFormLabel-asterisk": { color: "error.main" } }}
        >
          {label}
        </InputLabel>
        <Select
          label={label}
          value={value}
          onChange={onChange}
          required={required}
        >
          {children}
        </Select>
        <FormHelperText>{helperText || " "}</FormHelperText>
      </FormControl>
    </Grid>
  );
}
