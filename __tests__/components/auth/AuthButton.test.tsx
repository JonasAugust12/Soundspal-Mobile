 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AuthButton } from '@/components/auth/AuthButton';

describe('AuthButton', () => {
    it('should render with children text', () => {
        render(<AuthButton>Login</AuthButton>);

        expect(screen.getByText('Login')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
        const onPress = jest.fn();
        render(<AuthButton onPress={onPress}>Login</AuthButton>);

        const button = screen.getByText('Login');
        fireEvent.press(button);

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
        const onPress = jest.fn();
        render(
            <AuthButton onPress={onPress} disabled={true}>
                Login
            </AuthButton>,
        );

        const button = screen.getByText('Login');
        fireEvent.press(button);

        expect(onPress).not.toHaveBeenCalled();
    });

    it('should render with primary variant by default', () => {
        render(<AuthButton>Login</AuthButton>);

        expect(screen.getByText('Login')).toBeTruthy();
    });

    it('should render with outlined variant', () => {
        render(<AuthButton variant="outlined">Login</AuthButton>);

        expect(screen.getByText('Login')).toBeTruthy();
    });

    it('should render children text correctly', () => {
        render(<AuthButton>Sign Up</AuthButton>);

        expect(screen.getByText('Sign Up')).toBeTruthy();
    });
});
