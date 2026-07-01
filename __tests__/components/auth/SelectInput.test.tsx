import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SelectInput } from '@/features/auth/presentation/components/SelectInput';
import { User, Briefcase } from 'lucide-react-native';

describe('SelectInput', () => {
    const mockOptions = [
        { label: 'Singer', value: 'singer', icon: User },
        { label: 'Producer', value: 'producer', icon: Briefcase },
    ];

    const mockOnValueChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render label', () => {
        render(
            <SelectInput
                label="Select Role"
                options={mockOptions}
                value="singer"
                onValueChange={mockOnValueChange}
            />,
        );

        expect(screen.getByText('Select Role')).toBeTruthy();
    });

    it('should render all options', () => {
        render(
            <SelectInput
                label="Select Role"
                options={mockOptions}
                value="singer"
                onValueChange={mockOnValueChange}
            />,
        );

        expect(screen.getByText('Singer')).toBeTruthy();
        expect(screen.getByText('Producer')).toBeTruthy();
    });

    it('should call onValueChange when option is pressed', () => {
        render(
            <SelectInput
                label="Select Role"
                options={mockOptions}
                value="singer"
                onValueChange={mockOnValueChange}
            />,
        );

        const producerOption = screen.getByText('Producer');
        fireEvent.press(producerOption);

        expect(mockOnValueChange).toHaveBeenCalledWith('producer');
    });

    it('should render error message when error is provided', () => {
        render(
            <SelectInput
                label="Select Role"
                options={mockOptions}
                value=""
                onValueChange={mockOnValueChange}
                error="Please select a role"
            />,
        );

        expect(screen.getByText('Please select a role')).toBeTruthy();
    });

    it('should not render error when no error provided', () => {
        render(
            <SelectInput
                label="Select Role"
                options={mockOptions}
                value="singer"
                onValueChange={mockOnValueChange}
            />,
        );

        expect(screen.queryByText('Please select a role')).toBeNull();
    });
});
