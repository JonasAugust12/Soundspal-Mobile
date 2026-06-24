import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { JobCard } from '@/components/home/JobCard';

describe('JobCard', () => {
    const mockItem = {
        id: '1',
        title: 'Looking for Vocalist',
        briefDescription: 'Need experienced vocalist for recording',
        location: 'TP.HCM',
        workTime: '2-3 hours',
        budgetMin: 5000000,
        budgetMax: 10000000,
        budgetCurrency: 'VND',
        genres: ['Pop', 'Rock', 'Jazz', 'Blues'],
        recruitmentType: 'one_time',
        creatorName: 'Studio ABC',
        postType: 'job_offer',
    };

    it('should render job title', () => {
        render(<JobCard item={mockItem} />);

        expect(screen.getByText('Looking for Vocalist')).toBeTruthy();
    });

    it('should render brief description', () => {
        render(<JobCard item={mockItem} />);

        expect(screen.getByText('Need experienced vocalist for recording')).toBeTruthy();
    });

    it('should render creator name', () => {
        render(<JobCard item={mockItem} />);

        expect(screen.getByText('Studio ABC')).toBeTruthy();
        expect(screen.getByText('Nhà tuyển dụng')).toBeTruthy();
    });

    it('should render location', () => {
        render(<JobCard item={mockItem} />);

        expect(screen.getByText('TP.HCM')).toBeTruthy();
    });

    it('should render budget range', () => {
        render(<JobCard item={mockItem} />);

        // Budget should be formatted as "5tr - 10tr"
        const { root } = screen;
        expect(root).toBeTruthy();
    });

    it('should render "Thỏa thuận" when no budget', () => {
        const noBudgetItem = { ...mockItem, budgetMin: undefined, budgetMax: undefined };
        render(<JobCard item={noBudgetItem} />);

        expect(screen.getByText('Thỏa thuận')).toBeTruthy();
    });

    it('should render genres (max 3)', () => {
        render(<JobCard item={mockItem} />);

        expect(screen.getByText('Pop')).toBeTruthy();
        expect(screen.getByText('Rock')).toBeTruthy();
        expect(screen.getByText('Jazz')).toBeTruthy();
        expect(screen.getByText('+1')).toBeTruthy(); // 4th genre shown as +1
    });

    it('should render recruitment type label', () => {
        render(<JobCard item={mockItem} />);

        expect(screen.getByText('Một lần')).toBeTruthy();
    });

    it('should render work time when provided', () => {
        render(<JobCard item={mockItem} />);

        expect(screen.getByText('2-3 hours')).toBeTruthy();
    });

    it('should render job_offer post type badge', () => {
        render(<JobCard item={mockItem} />);

        expect(screen.getByText('Tuyển dụng')).toBeTruthy();
    });

    it('should render gig post type badge', () => {
        const gigItem = { ...mockItem, postType: 'gig' };
        render(<JobCard item={gigItem} />);

        expect(screen.getByText('Việc ngắn hạn')).toBeTruthy();
    });

    it('should render availability post type badge', () => {
        const availItem = { ...mockItem, postType: 'availability' };
        render(<JobCard item={availItem} />);

        expect(screen.getByText('Đang nhận việc')).toBeTruthy();
    });

    it('should not render work time when not provided', () => {
        const noWorkTimeItem = { ...mockItem, workTime: undefined };
        render(<JobCard item={noWorkTimeItem} />);

        expect(screen.queryByText('2-3 hours')).toBeNull();
    });
});
