import { TextField } from "@mui/material";
import { FieldValues, Path } from "react-hook-form";
import React, { forwardRef } from "react";

// Create a generic interface that extends basic props
interface TextInputProps<TFieldValues extends FieldValues> {
	label?: string;
	id: Path<TFieldValues>;
	multiline?: boolean;
	minRows?: number;
	onFocus?: () => void;
	onBlur?: () => void;
	placeholder?: string;
	value?: string;
	disabled?: boolean;
}

const TextInput = forwardRef(<TFieldValues extends FieldValues>(
	{ 
		label, 
		id,
		multiline = false,
		minRows = 1,
		onFocus,
		onBlur,
		placeholder,
		value,
		disabled = false,
		...rest
	}: TextInputProps<TFieldValues>,
	ref: React.Ref<HTMLDivElement>
) => {
	return (
		<TextField
			ref={ref}
			id={id}
			label={label}
			className="bg-white"
			sx={{
				'& .MuiOutlinedInput-root': {
					borderRadius: '0.5rem',
					paddingY: '0.5rem',
					'&.Mui-focused input, &.Mui-focused textarea': {
						borderColor: 'transparent', // TextField has a border color, this removes it from the input
						boxShadow: 'none',
					}
				}
			}}
			fullWidth
			multiline={multiline}
			minRows={minRows}
			onFocus={onFocus}
			onBlur={onBlur}
			placeholder={placeholder}
			value={value}
			disabled={disabled}
			{...rest}
		/>
	);
});

// Add display name for better debugging
TextInput.displayName = 'TextInput';

export default TextInput;
