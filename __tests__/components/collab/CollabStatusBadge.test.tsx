import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CollabStatusBadge } from '@/features/collab/presentation/components/CollabStatusBadge';

describe('CollabStatusBadge', () => {
    it('should render pending_review status', () => {
        render(<CollabStatusBadge status="pending_review" />);

        expect(screen.getByText('Đang chờ xem xét')).toBeTruthy();
    });

    it('should render accepted status', () => {
        render(<CollabStatusBadge status="accepted" />);

        expect(screen.getByText('Chấp nhận')).toBeTruthy();
    });

    it('should render rejected status', () => {
        render(<CollabStatusBadge status="rejected" />);

        expect(screen.getByText('Từ chối')).toBeTruthy();
    });

    it('should render withdrawn status', () => {
        render(<CollabStatusBadge status="withdrawn" />);

        expect(screen.getByText('Đã rút lại')).toBeTruthy();
    });

    it('should render with small size', () => {
        render(<CollabStatusBadge status="accepted" size="sm" />);

        expect(screen.getByText('Chấp nhận')).toBeTruthy();
    });

    it('should render with medium size (default)', () => {
        render(<CollabStatusBadge status="accepted" size="md" />);

        expect(screen.getByText('Chấp nhận')).toBeTruthy();
    });

    it('should render with large size', () => {
        render(<CollabStatusBadge status="accepted" size="lg" />);

        expect(screen.getByText('Chấp nhận')).toBeTruthy();
    });
});
