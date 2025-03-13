import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CountryInput from '../CountryInput';

describe('CountryInput Component', () => {
  it('renders with the correct label', () => {
    render(<CountryInput />);
    expect(screen.getByLabelText('Country of Citizenship')).toBeInTheDocument();
  });

  it('displays the selected country when value is provided', () => {
    render(<CountryInput value="United States" />);
    expect(screen.getByDisplayValue('United States')).toBeInTheDocument();
  });

  it('calls onChange when a new country is selected', async () => {
    const handleChange = jest.fn();
    render(<CountryInput onChange={handleChange} />);
    
    // Open the dropdown
    const input = screen.getByLabelText('Country of Citizenship');
    await userEvent.click(input);
    
    // Select a country from the dropdown (assuming 'Canada' exists in the list)
    const option = await screen.findByText('Canada');
    await userEvent.click(option);
    
    expect(handleChange).toHaveBeenCalledWith('Canada');
  });

  it('calls onBlur when the input loses focus', () => {
    const handleBlur = jest.fn();
    render(<CountryInput onBlur={handleBlur} />);
    
    const input = screen.getByLabelText('Country of Citizenship');
    fireEvent.focus(input);
    fireEvent.blur(input);
    
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('has country flags in the dropdown', async () => {
    render(<CountryInput />);
    
    // Open the dropdown
    const input = screen.getByLabelText('Country of Citizenship');
    await userEvent.click(input);
    
    // Check if images (flags) are present in the dropdown
    const flags = await screen.findAllByRole('img');
    expect(flags.length).toBeGreaterThan(0);
  });
}); 