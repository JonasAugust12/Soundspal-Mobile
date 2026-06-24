import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { JobApplyModal } from '@/components/jobs/JobApplyModal';
import { Alert } from 'react-native';

// Mock the API hook
jest.mock('@/hooks/useJobApi', () => ({
    useSubmitJobApplication: () => ({
        mutate: jest.fn((data, options) => {
            if (options?.onSuccess) {
                options.onSuccess({ message: 'Success' });
            }
        }),
        isPending: false,
    }),
}));

// Mock MediaPicker component
jest.mock('@/components/jobs/MediaPicker', () => ({
    MediaPicker: 'MediaPicker',
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('JobApplyModal', () => {
    const defaultProps = {
        visible: true,
        onClose: jest.fn(),
        jobId: 'job-123',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render when visible is true', () => {
        render(<JobApplyModal {...defaultProps} />);

        expect(screen.getByText('Ứng tuyển công việc')).toBeTruthy();
        expect(screen.getByPlaceholderText('Nhập họ và tên')).toBeTruthy();
        expect(screen.getByPlaceholderText('email@example.com')).toBeTruthy();
        expect(screen.getByPlaceholderText('0912345678')).toBeTruthy();
    });

    it('should validate empty full name', () => {
        render(<JobApplyModal {...defaultProps} />);

        fireEvent.press(screen.getByText('Gửi đơn ứng tuyển'));

        expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Họ và tên phải có ít nhất 2 ký tự');
    });

    it('should validate invalid email', () => {
        render(<JobApplyModal {...defaultProps} />);

        fireEvent.changeText(screen.getByPlaceholderText('Nhập họ và tên'), 'John Doe');
        fireEvent.changeText(screen.getByPlaceholderText('email@example.com'), 'invalid-email');

        fireEvent.press(screen.getByText('Gửi đơn ứng tuyển'));

        expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Email không hợp lệ');
    });

    it('should validate invalid phone number', () => {
        render(<JobApplyModal {...defaultProps} />);

        fireEvent.changeText(screen.getByPlaceholderText('Nhập họ và tên'), 'John Doe');
        fireEvent.changeText(screen.getByPlaceholderText('email@example.com'), 'john@test.com');
        fireEvent.changeText(screen.getByPlaceholderText('0912345678'), '123'); // Invalid phone

        fireEvent.press(screen.getByText('Gửi đơn ứng tuyển'));

        expect(Alert.alert).toHaveBeenCalledWith(
            'Lỗi',
            expect.stringContaining('Số điện thoại không hợp lệ'),
        );
    });

    it('should validate cover letter length', () => {
        render(<JobApplyModal {...defaultProps} />);

        fireEvent.changeText(screen.getByPlaceholderText('Nhập họ và tên'), 'John Doe');
        fireEvent.changeText(screen.getByPlaceholderText('email@example.com'), 'john@test.com');
        fireEvent.changeText(screen.getByPlaceholderText('0912345678'), '0912345678');
        // Setting short cover letter (less than 50 chars)
        fireEvent.changeText(screen.getByPlaceholderText(/Chia sẻ về kinh nghiệm/i), 'Too short');

        fireEvent.press(screen.getByText('Gửi đơn ứng tuyển'));

        expect(Alert.alert).toHaveBeenCalledWith(
            'Lỗi',
            'Giới thiệu bản thân phải có ít nhất 50 ký tự',
        );
    });

    it('should call onClose when close button is pressed', () => {
        render(<JobApplyModal {...defaultProps} />);

        fireEvent.press(screen.getByText('Huỷ'));

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should render media picker section', () => {
        render(<JobApplyModal {...defaultProps} />);

        // This is the trigger for the media picker
        expect(screen.getByText('Chọn từ phương tiện của tôi')).toBeTruthy();
    });
});
