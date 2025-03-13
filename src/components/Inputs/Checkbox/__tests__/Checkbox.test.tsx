import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';
import CheckboxInput from '../Checkbox';

// Create a wrapper component to provide the form context
const CheckboxTestWrapper = ({ defaultChecked = false, onChangeCallback = jest.fn() }) => {
  const { control, watch } = useForm({
    defaultValues: {
      testCheckbox: defaultChecked
    }
  });
  
  // Watch for changes to the checkbox value
  const watchTest = watch("testCheckbox");
  React.useEffect(() => {
    onChangeCallback(watchTest);
  }, [watchTest, onChangeCallback]);
  
  return (
    <div>
      <CheckboxInput 
        name="testCheckbox" 
        control={control} 
        label="Test Checkbox" 
      />
      <div data-testid="checkbox-value">{watchTest ? 'true' : 'false'}</div>
    </div>
  );
};

describe('CheckboxInput Component', () => {
  it('renders with the correct label', () => {
    render(<CheckboxTestWrapper />);
    expect(screen.getByLabelText('Test Checkbox')).toBeInTheDocument();
  });

  it('initializes with the default value', () => {
    render(<CheckboxTestWrapper defaultChecked={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('updates form value when clicked', async () => {
    const handleChange = jest.fn();
    render(<CheckboxTestWrapper onChangeCallback={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Check if the value was updated in the form
    expect(screen.getByTestId('checkbox-value')).toHaveTextContent('true');
    expect(handleChange).toHaveBeenCalledWith(true);
    
    // Click again to uncheck
    fireEvent.click(checkbox);
    expect(screen.getByTestId('checkbox-value')).toHaveTextContent('false');
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('uses the large size as specified', () => {
    render(<CheckboxTestWrapper />);
    const checkbox = screen.getByRole('checkbox');
    
    // Check for size classes on the component
    const checkboxContainer = checkbox.closest('.MuiCheckbox-root');
    expect(checkboxContainer).toHaveClass('MuiCheckbox-sizeLarge');
  });
}); 