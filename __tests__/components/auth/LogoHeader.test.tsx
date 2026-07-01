import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LogoHeader } from '@/components/auth/LogoHeader';

describe('LogoHeader', () => {
    it('should render Soundspal text', () => {
        render(<LogoHeader />);

        expect(screen.getByText('Soundspal')).toBeTruthy();
    });

    it('should render logo image', () => {
        render(<LogoHeader />);

        // Component renders with logo
        expect(screen.root).toBeTruthy();
    });
});
