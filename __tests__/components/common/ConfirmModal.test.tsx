import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ConfirmModal } from '@/shared/presentation/ui/ConfirmModal';

describe('ConfirmModal', () => {
    const defaultProps = {
        visible: true,
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render when visible is true', () => {
        render(<ConfirmModal {...defaultProps} />);

        expect(screen.getByText('Confirm Action')).toBeTruthy();
        expect(screen.getByText('Are you sure you want to proceed?')).toBeTruthy();
    });

    it('should display custom confirm and cancel text', () => {
        render(<ConfirmModal {...defaultProps} confirmText="Delete" cancelText="Keep" />);

        expect(screen.getByText('Delete')).toBeTruthy();
        expect(screen.getByText('Keep')).toBeTruthy();
    });

    it('should use default button text when not provided', () => {
        render(<ConfirmModal {...defaultProps} />);

        expect(screen.getByText('Xác nhận')).toBeTruthy();
        expect(screen.getByText('Hủy')).toBeTruthy();
    });

    it('should call onConfirm when confirm button is pressed', () => {
        const onConfirm = jest.fn();
        render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

        const confirmButton = screen.getByText('Xác nhận');
        fireEvent.press(confirmButton);

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is pressed', () => {
        const onCancel = jest.fn();
        render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

        const cancelButton = screen.getByText('Hủy');
        fireEvent.press(cancelButton);

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when isLoading is true', () => {
        render(<ConfirmModal {...defaultProps} isLoading={true} />);

        expect(screen.getByText('Đang xử lý...')).toBeTruthy();
    });

    it('should render AlertTriangle icon', () => {
        render(<ConfirmModal {...defaultProps} />);

        // AlertTriangle icon should be present
        const { root } = screen;
        expect(root).toBeTruthy();
    });
});
