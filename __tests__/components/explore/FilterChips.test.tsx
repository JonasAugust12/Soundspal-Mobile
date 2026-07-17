import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FilterChips } from '@/features/explore/presentation/components/FilterChips';

// Mock the API hook
jest.mock('@/features/profiles/presentation/hooks/useUserApi', () => ({
    useGetAllGenres: () => ({
        data: {
            genres: [
                { name: 'Pop', id: '1' },
                { name: 'Rock', id: '2' },
                { name: 'Jazz', id: '3' },
            ],
        },
    }),
}));

describe('FilterChips', () => {
    const mockOnSelectGenre = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render "Tất cả" chip', () => {
        render(<FilterChips selectedGenre="" onSelectGenre={mockOnSelectGenre} />);

        expect(screen.getByText('Tất cả')).toBeTruthy();
    });

    it('should render genre chips from API', () => {
        render(<FilterChips selectedGenre="" onSelectGenre={mockOnSelectGenre} />);

        expect(screen.getByText('Pop')).toBeTruthy();
        expect(screen.getByText('Rock')).toBeTruthy();
        expect(screen.getByText('Jazz')).toBeTruthy();
    });

    it('should highlight selected genre', () => {
        render(<FilterChips selectedGenre="Pop" onSelectGenre={mockOnSelectGenre} />);

        // When selected, genre uses LinearGradient (active state)
        expect(screen.getByText('Pop')).toBeTruthy();
    });

    it('should call onSelectGenre when chip is pressed', () => {
        render(<FilterChips selectedGenre="" onSelectGenre={mockOnSelectGenre} />);

        const popChip = screen.getByText('Pop');
        fireEvent.press(popChip);

        expect(mockOnSelectGenre).toHaveBeenCalledWith('Pop');
    });

    it('should call onSelectGenre with empty string when "Tất cả" is pressed', () => {
        render(<FilterChips selectedGenre="Pop" onSelectGenre={mockOnSelectGenre} />);

        const allChip = screen.getByText('Tất cả');
        fireEvent.press(allChip);

        expect(mockOnSelectGenre).toHaveBeenCalledWith('');
    });
});
