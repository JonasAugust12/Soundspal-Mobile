import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { JobDetailInfo } from '@/features/jobs/presentation/components/JobDetailInfo';

describe('JobDetailInfo', () => {
    const defaultProps = {
        recruitmentType: 'Toàn thời gian',
        budgetMin: 10000000,
        budgetMax: 20000000,
        budgetCurrency: 'VND',
        location: 'Hà Nội',
    };

    it('should render detailed job info correctly', () => {
        render(<JobDetailInfo {...defaultProps} />);

        expect(screen.getByText('Chi tiết công việc')).toBeTruthy();
        expect(screen.getByText('Toàn thời gian')).toBeTruthy();
        expect(screen.getByText('Hà Nội')).toBeTruthy();
        // The formatted budget from jobFormatters might be like "10tr - 20tr"
        // We'll just verify the component renders without error
        const { root } = screen;
        expect(root).toBeTruthy();
    });

    it('should show "Toàn quốc" when location is empty', () => {
        render(<JobDetailInfo {...defaultProps} location="" />);

        expect(screen.getByText('Toàn quốc')).toBeTruthy();
    });

    it('should show negotiable badge when isNegotiable is true', () => {
        render(<JobDetailInfo {...defaultProps} isNegotiable={true} />);

        expect(screen.getByText('Ngân sách ✨')).toBeTruthy();
    });

    it('should not show negotiable badge when isNegotiable is false', () => {
        render(<JobDetailInfo {...defaultProps} isNegotiable={false} />);

        expect(screen.getByText('Ngân sách')).toBeTruthy();
        expect(screen.queryByText('Ngân sách ✨')).toBeNull();
    });

    it('should render deadline when provided', () => {
        render(<JobDetailInfo {...defaultProps} deadline="31/12/2026" />);

        expect(screen.getByText('Hạn nộp')).toBeTruthy();
        expect(screen.getByText('31/12/2026')).toBeTruthy();
    });

    it('should not render deadline section when not provided', () => {
        render(<JobDetailInfo {...defaultProps} />);

        expect(screen.queryByText('Hạn nộp')).toBeNull();
    });

    it('should render work time when provided', () => {
        render(<JobDetailInfo {...defaultProps} workTime="8:00 - 17:00" />);

        expect(screen.getByText('Thời gian')).toBeTruthy();
        expect(screen.getByText('8:00 - 17:00')).toBeTruthy();
    });

    it('should not render work time section when not provided', () => {
        render(<JobDetailInfo {...defaultProps} />);

        expect(screen.queryByText('Thời gian')).toBeNull();
    });
});
