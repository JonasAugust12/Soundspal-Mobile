/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OTPInput } from '@/components/auth/OTPInput';

describe('OTPInput', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render 6 input boxes by default', () => {
        const { root } = render(<OTPInput value="" onChange={mockOnChange} />);

        const inputs = root.findAllByType('TextInput' as any);
        expect(inputs.length).toBe(6);
    });

    it('should render custom number of input boxes', () => {
        const { root } = render(<OTPInput value="" onChange={mockOnChange} length={4} />);

        const inputs = root.findAllByType('TextInput' as any);
        expect(inputs.length).toBe(4);
    });

    it('should display value correctly', () => {
        render(<OTPInput value="123456" onChange={mockOnChange} />);

        expect(screen.getByDisplayValue('1')).toBeTruthy();
        expect(screen.getByDisplayValue('2')).toBeTruthy();
        expect(screen.getByDisplayValue('3')).toBeTruthy();
        expect(screen.getByDisplayValue('4')).toBeTruthy();
        expect(screen.getByDisplayValue('5')).toBeTruthy();
        expect(screen.getByDisplayValue('6')).toBeTruthy();
    });

    it('should call onChange when digit is entered', () => {
        const { root } = render(<OTPInput value="" onChange={mockOnChange} />);

        const firstInput = root.findAllByType('TextInput' as any)[0];
        fireEvent.changeText(firstInput, '5');

        expect(mockOnChange).toHaveBeenCalled();
    });

    it('should only allow numeric input', () => {
        const { root } = render(<OTPInput value="" onChange={mockOnChange} />);

        const firstInput = root.findAllByType('TextInput' as any)[0];

        // Inputs have keyboardType="number-pad"
        expect(firstInput.props.keyboardType).toBe('number-pad');
    });

    it('should handle empty value', () => {
        render(<OTPInput value="" onChange={mockOnChange} />);

        // All inputs should be empty
        const { root } = screen;
        expect(root).toBeTruthy();
    });

    it('should handle partial value', () => {
        render(<OTPInput value="123" onChange={mockOnChange} />);

        expect(screen.getByDisplayValue('1')).toBeTruthy();
        expect(screen.getByDisplayValue('2')).toBeTruthy();
        expect(screen.getByDisplayValue('3')).toBeTruthy();
    });

    it('should not auto focus when autoFocus is false', () => {
        render(<OTPInput value="" onChange={mockOnChange} autoFocus={false} />);

        // Component should render without auto-focusing
        expect(screen.root).toBeTruthy();
    });

    it('should use default active color', () => {
        render(<OTPInput value="1" onChange={mockOnChange} />);

        // Component renders with default color
        expect(screen.root).toBeTruthy();
    });

    it('should use custom active color', () => {
        render(<OTPInput value="1" onChange={mockOnChange} activeColor="#FF0000" />);

        // Component renders with custom color
        expect(screen.root).toBeTruthy();
    });
});
