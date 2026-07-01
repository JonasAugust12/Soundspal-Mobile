/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { JobCardFull } from '@/features/jobs/presentation/components/JobCardFull';

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock JobApplyModal to avoid complex child component rendering
jest.mock('@/features/jobs/presentation/components/JobApplyModal', () => ({
    JobApplyModal: 'JobApplyModal',
}));

describe('JobCardFull', () => {
    const mockJob = {
        id: 'job-123',
        title: 'Senior React Native Developer',
        budget_min: 15000000,
        budget_max: 25000000,
        budget_currency: 'VND',
        created_at: '2026-06-24T10:00:00Z',
        type: 'Thỏa thuận',
        recruitment_type: 'Toàn thời gian',
        location: 'Hà Nội',
        assets: [{ thumbnail_url: 'https://example.com/thumb.jpg', storage_url: '' }],
        status: 'OPEN',
        user_id: 'user-123',
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render job title correctly', () => {
        render(<JobCardFull job={mockJob} />);

        expect(screen.getByText('Senior React Native Developer')).toBeTruthy();
    });

    it('should render basic job information', () => {
        render(<JobCardFull job={mockJob} />);

        expect(screen.getByText('Hình thức')).toBeTruthy();
        expect(screen.getByText('Toàn thời gian')).toBeTruthy();

        expect(screen.getByText('Địa điểm')).toBeTruthy();
        expect(screen.getByText('Hà Nội')).toBeTruthy();

        expect(screen.getByText('Ngân sách')).toBeTruthy();
        expect(screen.getByText('Ngày đăng')).toBeTruthy();
    });

    it('should show "Toán quốc" if no location is provided', () => {
        const jobNoLocation = { ...mockJob, location: null };
        render(<JobCardFull job={jobNoLocation} />);

        expect(screen.getByText('Toàn quốc')).toBeTruthy();
    });

    it('should show ownership badge when isOwned is true', () => {
        render(<JobCardFull job={mockJob} isOwned={true} />);

        expect(screen.getByText('Của tôi')).toBeTruthy();
    });

    it('should show "Chỉnh sửa" button when isOwned is true', () => {
        render(<JobCardFull job={mockJob} isOwned={true} />);

        expect(screen.getByText('Chỉnh sửa')).toBeTruthy();
        expect(screen.queryByText('Ứng tuyển ngay')).toBeNull();
    });

    it('should show "Ứng tuyển ngay" button when isOwned is false', () => {
        render(<JobCardFull job={mockJob} isOwned={false} />);

        expect(screen.getByText('Ứng tuyển ngay')).toBeTruthy();
        expect(screen.queryByText('Chỉnh sửa')).toBeNull();
    });

    it('should call onEdit when Chỉnh sửa button is clicked and onEdit is provided', () => {
        const onEdit = jest.fn();
        render(<JobCardFull job={mockJob} isOwned={true} onEdit={onEdit} />);

        const editButton = screen.getByText('Chỉnh sửa');
        fireEvent.press(editButton);

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should render "Chi tiết" button', () => {
        render(<JobCardFull job={mockJob} />);

        expect(screen.getByText('Chi tiết')).toBeTruthy();
    });
});
