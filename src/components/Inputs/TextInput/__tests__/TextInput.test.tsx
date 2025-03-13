import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import '@testing-library/jest-dom';
import TextInput from '../TextInput';

describe('TextInput Component', () => {
  it('renders with a label', () => {
    render(<TextInput id="testInput" label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders with a placeholder', () => {
    render(<TextInput id="testInput" placeholder="Test Placeholder" />);
    expect(screen.getByPlaceholderText('Test Placeholder')).toBeInTheDocument();
  });

  it('accepts and displays a value', () => {
    render(<TextInput id="testInput" value="Test Value" />);
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    render(<TextInput id="testInput" disabled={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders as multiline when specified', () => {
    render(<TextInput id="testInput" multiline={true} minRows={3} />);
    const textArea = screen.getByRole('textbox');
    expect(textArea.tagName.toLowerCase()).toBe('textarea');
  });

  it('calls onFocus and onBlur handlers', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <TextInput 
        id="testInput" 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
}); 