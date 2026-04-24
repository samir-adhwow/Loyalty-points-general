import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";

type DateTimePickerFieldProps = {
  label: string;
  value: string | null | undefined;
  onChange: (value: Dayjs | null) => void;
  name: string;
  inputRef?: React.Ref<HTMLInputElement>;
  error?: boolean;
  helperText?: string;
  required?: boolean;
};

export default function DateTimePickerField({
  label,
  value,
  onChange,
  name,
  inputRef,
  error,
  helperText,
  required,
}: DateTimePickerFieldProps) {
  const parsed = value ? dayjs(value) : null;

  return (
    <DateTimePicker
      label={label}
      value={parsed}
      onChange={onChange}
      sx={{ width: "100%" }}
      slotProps={{
        textField: {
          fullWidth: true,
          name,
          inputRef,
          error,
          required,
          helperText: helperText || " ",
        },
      }}
    />
  );
}
