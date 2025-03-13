import { Checkbox, FormControlLabel } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface CheckboxInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
}

export default function CheckboxInput<TFieldValues extends FieldValues>({ 
  name, 
  control, 
  label 
}: CheckboxInputProps<TFieldValues>) {
  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field: props }) => (
            <Checkbox
							size="large"
							className="rounded-lg"
              {...props}
              checked={props.value}
              onChange={(e) => props.onChange(e.target.checked)}
            />
          )}
        />
      }
      label={label}
    />
  );
}
