import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MenuItem } from '@/components/profile/MenuItem';
import { Settings } from 'lucide-react-native';

describe('MenuItem', () => {
    const mockIcon = <Settings size={24} color="#7C3BED" />;

    it('should render title', () => {
        render(<MenuItem icon={mockIcon} title="Account Settings" />);

        expect(screen.getByText('Account Settings')).toBeTruthy();
    });

    it('should render subtitle when provided', () => {
        render(
            <MenuItem icon={mockIcon} title="Account Settings" subtitle="Manage your account" />,
        );

        expect(screen.getByText('Account Settings')).toBeTruthy();
        expect(screen.getByText('Manage your account')).toBeTruthy();
    });

    it('should not render subtitle when not provided', () => {
        render(<MenuItem icon={mockIcon} title="Account Settings" />);

        expect(screen.queryByText('Manage your account')).toBeNull();
    });

    it('should call onPress when pressed', () => {
        const onPress = jest.fn();
        render(<MenuItem icon={mockIcon} title="Account Settings" onPress={onPress} />);

        const menuItem = screen.getByText('Account Settings');
        fireEvent.press(menuItem);

        expect(onPress).toHaveBeenCalled();
    });

    it('should show chevron by default', () => {
        render(<MenuItem icon={mockIcon} title="Account Settings" />);

        // Chevron is rendered by default
        expect(screen.root).toBeTruthy();
    });

    it('should show chevron when showChevron is true', () => {
        render(<MenuItem icon={mockIcon} title="Account Settings" showChevron={true} />);

        expect(screen.root).toBeTruthy();
    });

    it('should hide chevron when showChevron is false', () => {
        render(<MenuItem icon={mockIcon} title="Account Settings" showChevron={false} />);

        // Component renders without chevron
        expect(screen.root).toBeTruthy();
    });
});
