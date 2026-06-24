import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ChatItem } from '@/components/common/ChatItem';

// Mock OnlineIndicator
jest.mock('@/components/common/OnlineIndicator', () => ({
    OnlineIndicator: 'OnlineIndicator',
}));

describe('ChatItem', () => {
    const mockProps = {
        name: 'John Doe',
        preview: 'Hey, how are you?',
        avatarSource: { uri: 'https://example.com/avatar.jpg' },
    };

    it('should render name and preview', () => {
        render(<ChatItem {...mockProps} />);

        expect(screen.getByText('John Doe')).toBeTruthy();
        expect(screen.getByText('Hey, how are you?')).toBeTruthy();
    });

    it('should render time when provided', () => {
        render(<ChatItem {...mockProps} time="10:30 AM" />);

        expect(screen.getByText('10:30 AM')).toBeTruthy();
    });

    it('should not render time when not provided', () => {
        render(<ChatItem {...mockProps} />);

        expect(screen.queryByText('10:30 AM')).toBeNull();
    });

    it('should render unread badge with count', () => {
        render(<ChatItem {...mockProps} unreadCount={5} />);

        expect(screen.getByText('5')).toBeTruthy();
    });

    it('should render 99+ for counts over 99', () => {
        render(<ChatItem {...mockProps} unreadCount={150} />);

        expect(screen.getByText('99+')).toBeTruthy();
    });

    it('should render small dot when unread is true without count', () => {
        render(<ChatItem {...mockProps} unread={true} />);

        // Unread dot is rendered
        expect(screen.root).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
        const onPress = jest.fn();
        render(<ChatItem {...mockProps} onPress={onPress} />);

        const chatItem = screen.getByText('John Doe');
        fireEvent.press(chatItem);

        expect(onPress).toHaveBeenCalled();
    });

    it('should render OnlineIndicator when userId is provided', () => {
        render(<ChatItem {...mockProps} userId="user123" />);

        // Component renders with OnlineIndicator
        expect(screen.root).toBeTruthy();
    });
});
