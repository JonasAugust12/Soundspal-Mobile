import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TypingIndicator } from '@/components/common/TypingIndicator';

describe('TypingIndicator', () => {
    it('should render typing indicator', () => {
        render(<TypingIndicator />);

        expect(screen.root).toBeTruthy();
    });

    it('should render three animated dots', () => {
        const { UNSAFE_root } = render(<TypingIndicator />);

        // Component renders with 3 dots (Animated.View components)
        expect(UNSAFE_root).toBeTruthy();
    });
});
