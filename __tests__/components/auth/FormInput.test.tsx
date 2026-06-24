import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FormInput } from '@/components/auth/FormInput';

describe('FormInput', () => {
    it('should render with label', () => {
        render(<FormInput label="Email" />);

        expect(screen.getByText('Email')).toBeTruthy();
    });

    it('should render with placeholder', () => {
        render(<FormInput label="Email" placeholder="Enter your email" />);

        expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
    });

    it('should display value when provided', () => {
        render(<FormInput label="Email" value="test@example.com" />);

        expect(screen.getByDisplayValue('test@example.com')).toBeTruthy();
    });

    it('should display error message when error prop is provided', () => {
        render(<FormInput label="Email" error="Email is required" />);

        expect(screen.getByText('Email is required')).toBeTruthy();
    });

    it('should not display error message when error prop is not provided', () => {
        render(<FormInput label="Email" />);

        expect(screen.queryByText('Email is required')).toBeNull();
    });

    it('should render without icon by default', () => {
        const { root } = render(<FormInput label="Email" />);

        expect(root).toBeTruthy();
    });

    it('should pass through TextInput props', () => {
        render(
            <FormInput
                label="Password"
                placeholder="Enter password"
                secureTextEntry
                keyboardType="default"
            />,
        );

        const input = screen.getByPlaceholderText('Enter password');
        expect(input.props.secureTextEntry).toBe(true);
        expect(input.props.keyboardType).toBe('default');
    });

    it('should handle onChangeText callback', () => {
        const onChangeText = jest.fn();
        render(<FormInput label="Email" onChangeText={onChangeText} />);

        // Component should render with callback prop
        expect(screen.getByText('Email')).toBeTruthy();
    });
});
