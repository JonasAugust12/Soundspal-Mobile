import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CollabTabs } from '@/components/collab/CollabTabs';

describe('CollabTabs', () => {
    const mockOnTabChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render both tabs', () => {
        render(<CollabTabs activeTab="sent" onTabChange={mockOnTabChange} />);

        expect(screen.getByText('Đã gửi')).toBeTruthy();
        expect(screen.getByText('Nhận được')).toBeTruthy();
    });

    it('should highlight active tab', () => {
        render(<CollabTabs activeTab="sent" onTabChange={mockOnTabChange} />);

        // Active tab is rendered
        expect(screen.getByText('Đã gửi')).toBeTruthy();
    });

    it('should call onTabChange when sent tab is pressed', () => {
        render(<CollabTabs activeTab="received" onTabChange={mockOnTabChange} />);

        const sentTab = screen.getByText('Đã gửi');
        fireEvent.press(sentTab);

        expect(mockOnTabChange).toHaveBeenCalledWith('sent');
    });

    it('should call onTabChange when received tab is pressed', () => {
        render(<CollabTabs activeTab="sent" onTabChange={mockOnTabChange} />);

        const receivedTab = screen.getByText('Nhận được');
        fireEvent.press(receivedTab);

        expect(mockOnTabChange).toHaveBeenCalledWith('received');
    });

    it('should render with received tab active', () => {
        render(<CollabTabs activeTab="received" onTabChange={mockOnTabChange} />);

        expect(screen.getByText('Nhận được')).toBeTruthy();
    });
});
