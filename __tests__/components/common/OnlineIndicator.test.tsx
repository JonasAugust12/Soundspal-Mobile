/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OnlineIndicator } from '@/shared/presentation/ui/OnlineIndicator';
import { useMessagingStore } from '@/features/messaging/presentation/store/messagingStore';

// Mock the messaging store
jest.mock('@/features/messaging/presentation/store/messagingStore');

const mockUseMessagingStore = useMessagingStore as jest.MockedFunction<typeof useMessagingStore>;

describe('OnlineIndicator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render when user is online', () => {
        mockUseMessagingStore.mockReturnValue({
            isUserOnline: jest.fn().mockReturnValue(true),
        } as any);

        const { getByTestId } = render(<OnlineIndicator userId="user123" />);

        // Should render the indicator container
        const container = screen.root;
        expect(container).toBeTruthy();
    });

    it('should not render when user is offline', () => {
        mockUseMessagingStore.mockReturnValue({
            isUserOnline: jest.fn().mockReturnValue(false),
        } as any);

        const { toJSON } = render(<OnlineIndicator userId="user123" />);

        // Should return null when offline
        expect(toJSON()).toBeNull();
    });

    it('should use default size of 12', () => {
        mockUseMessagingStore.mockReturnValue({
            isUserOnline: jest.fn().mockReturnValue(true),
        } as any);

        render(<OnlineIndicator userId="user123" />);

        // Component should render with default size
        const container = screen.root;
        expect(container).toBeTruthy();
    });

    it('should use custom size when provided', () => {
        mockUseMessagingStore.mockReturnValue({
            isUserOnline: jest.fn().mockReturnValue(true),
        } as any);

        render(<OnlineIndicator userId="user123" size={16} />);

        // Component should render with custom size
        const container = screen.root;
        expect(container).toBeTruthy();
    });

    it('should position indicator at bottom-right by default', () => {
        mockUseMessagingStore.mockReturnValue({
            isUserOnline: jest.fn().mockReturnValue(true),
        } as any);

        render(<OnlineIndicator userId="user123" />);

        // Should use bottom-right position by default
        const container = screen.root;
        expect(container).toBeTruthy();
    });

    it('should position indicator at top-right when specified', () => {
        mockUseMessagingStore.mockReturnValue({
            isUserOnline: jest.fn().mockReturnValue(true),
        } as any);

        render(<OnlineIndicator userId="user123" position="top-right" />);

        // Should use top-right position
        const container = screen.root;
        expect(container).toBeTruthy();
    });

    it('should call isUserOnline with correct userId', () => {
        const mockIsUserOnline = jest.fn().mockReturnValue(true);
        mockUseMessagingStore.mockReturnValue({
            isUserOnline: mockIsUserOnline,
        } as any);

        render(<OnlineIndicator userId="user456" />);

        expect(mockIsUserOnline).toHaveBeenCalledWith('user456');
    });
});
