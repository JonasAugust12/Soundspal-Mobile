import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { JobApplyModal } from '@/features/jobs/presentation/components/JobApplyModal';
import { showAppDialog } from '@/shared/presentation/ui';

jest.mock('@/features/jobs/presentation/hooks/useJobApi', () => ({
    useSubmitJobApplication: () => ({
        mutate: jest.fn((data, options) => {
            if (options?.onSuccess) {
                options.onSuccess({ message: 'Success' });
            }
        }),
        isPending: false,
    }),
}));

jest.mock('@/features/jobs/presentation/components/MediaPicker', () => ({
    MediaPicker: 'MediaPicker',
}));

jest.mock('@/shared/presentation/ui', () => {
    const ReactActual = require('react');
    return {
        showAppDialog: jest.fn(),
        KeyboardAwareModalOverlay: ({ children }: { children: React.ReactNode }) =>
            ReactActual.createElement(ReactActual.Fragment, null, children),
    };
});

const mockShowAppDialog = showAppDialog as jest.MockedFunction<typeof showAppDialog>;

function renderModal(props: React.ComponentProps<typeof JobApplyModal>) {
    return render(
        <SafeAreaProvider
            initialMetrics={{
                frame: { x: 0, y: 0, width: 390, height: 844 },
                insets: { top: 0, left: 0, right: 0, bottom: 0 },
            }}
        >
            <JobApplyModal {...props} />
        </SafeAreaProvider>,
    );
}

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
        renderModal(defaultProps);

        expect(screen.getByText('Ứng tuyển công việc')).toBeTruthy();
        expect(screen.getByPlaceholderText('Nhập họ và tên')).toBeTruthy();
        expect(screen.getByPlaceholderText('email@example.com')).toBeTruthy();
        expect(screen.getByPlaceholderText('0912345678')).toBeTruthy();
    });

    it('should validate empty full name', () => {
        renderModal(defaultProps);

        fireEvent.press(screen.getByText('Gửi đơn ứng tuyển'));

        expect(mockShowAppDialog).toHaveBeenCalledWith('Lỗi', 'Họ và tên phải có ít nhất 2 ký tự');
    });

    it('should validate invalid email', () => {
        renderModal(defaultProps);

        fireEvent.changeText(screen.getByPlaceholderText('Nhập họ và tên'), 'John Doe');
        fireEvent.changeText(screen.getByPlaceholderText('email@example.com'), 'invalid-email');

        fireEvent.press(screen.getByText('Gửi đơn ứng tuyển'));

        expect(mockShowAppDialog).toHaveBeenCalledWith('Lỗi', 'Email không hợp lệ');
    });

    it('should validate invalid phone number', () => {
        renderModal(defaultProps);

        fireEvent.changeText(screen.getByPlaceholderText('Nhập họ và tên'), 'John Doe');
        fireEvent.changeText(screen.getByPlaceholderText('email@example.com'), 'john@test.com');
        fireEvent.changeText(screen.getByPlaceholderText('0912345678'), '123');

        fireEvent.press(screen.getByText('Gửi đơn ứng tuyển'));

        expect(mockShowAppDialog).toHaveBeenCalledWith(
            'Lỗi',
            expect.stringContaining('Số điện thoại không hợp lệ'),
        );
    });

    it('should validate cover letter length', () => {
        renderModal(defaultProps);

        fireEvent.changeText(screen.getByPlaceholderText('Nhập họ và tên'), 'John Doe');
        fireEvent.changeText(screen.getByPlaceholderText('email@example.com'), 'john@test.com');
        fireEvent.changeText(screen.getByPlaceholderText('0912345678'), '0912345678');
        fireEvent.changeText(screen.getByPlaceholderText(/Chia sẻ về kinh nghiệm/i), 'Too short');

        fireEvent.press(screen.getByText('Gửi đơn ứng tuyển'));

        expect(mockShowAppDialog).toHaveBeenCalledWith(
            'Lỗi',
            'Giới thiệu bản thân phải có ít nhất 50 ký tự',
        );
    });

    it('should call onClose when close button is pressed', () => {
        renderModal(defaultProps);

        fireEvent.press(screen.getByText('Huỷ'));

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should render media picker section', () => {
        renderModal(defaultProps);

        expect(screen.getByText('Chọn từ phương tiện của tôi')).toBeTruthy();
    });
});
