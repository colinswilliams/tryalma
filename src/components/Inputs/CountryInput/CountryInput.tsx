import { Autocomplete, Box, TextField } from "@mui/material";
import { countries } from "./utils";
import React, { forwardRef } from "react";

// Define Country type to match the expected structure
interface Country {
	code: string;
	label: string;
}

interface CountryInputProps {
	value?: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
}

const CountryInput = forwardRef<HTMLDivElement, CountryInputProps>(
	({ value = '', onChange, onBlur }, ref) => {
		// Find selected country object based on string value
		const selectedCountry = value ? countries.find(country => country.label === value) || null : null;
		
		return (
			<Autocomplete
				ref={ref}
				id="country-select-demo"
				value={selectedCountry}
				onChange={(_, newValue: Country | null) => {
					onChange?.(newValue?.label || '');
				}}
				onBlur={onBlur}
				isOptionEqualToValue={(option, value) => option.label === value.label}
				sx={{
					'& .MuiOutlinedInput-root': {
						borderRadius: '0.5rem',
						paddingY: '0.5rem',
						'&.Mui-focused input': {
							borderColor: 'transparent', // AutoComplete has a border color, this removes it from the input
							boxShadow: 'none',
						}
					}
				}}
				fullWidth
				options={countries}
				autoHighlight
				getOptionLabel={(option: Country) => option.label}
				renderOption={(props, option) => {
					const { key, ...optionProps } = props;
					return (
						<Box
							key={key}
							component="li"
							sx={{ 
								'& > img': { mr: 2, flexShrink: 0 },
							}}
							{...optionProps}
						>
							<img
								loading="lazy"
								width="20"
								srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
								src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
								alt=""
							/>
							{option.label}
						</Box>
					);
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						label="Country of Citizenship"
						className="bg-white rounded-lg"
						slotProps={{
							htmlInput: {
								...params.inputProps,
								autoComplete: 'new-password', // disable autocomplete and autofill
							},
						}}
					/>
				)}
			/>
		);
	}
);

CountryInput.displayName = 'CountryInput';

export default CountryInput;
