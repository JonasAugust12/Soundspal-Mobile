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
    const onToggleGenre = jest.fn();
    const onClear = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render "Tất cả" chip', () => {
        render(<FilterChips selectedGenres={[]} onToggleGenre={onToggleGenre} onClear={onClear} />);

        expect(screen.getByText('Tất cả')).toBeTruthy();
    });

    it('should render genre chips from API', () => {
        render(<FilterChips selectedGenres={[]} onToggleGenre={onToggleGenre} onClear={onClear} />);

        expect(screen.getByText('Pop')).toBeTruthy();
        expect(screen.getByText('Rock')).toBeTruthy();
        expect(screen.getByText('Jazz')).toBeTruthy();
    });

    it('should highlight selected genres (multi-select)', () => {
        render(
            <FilterChips
                selectedGenres={['Pop', 'Jazz']}
                onToggleGenre={onToggleGenre}
                onClear={onClear}
            />,
        );

        // Selected genres render with the active (LinearGradient) state
        expect(screen.getByText('Pop')).toBeTruthy();
        expect(screen.getByText('Jazz')).toBeTruthy();
    });

    it('should call onToggleGenre with the genre name when a chip is pressed', () => {
        render(<FilterChips selectedGenres={[]} onToggleGenre={onToggleGenre} onClear={onClear} />);

        fireEvent.press(screen.getByText('Pop'));

        expect(onToggleGenre).toHaveBeenCalledWith('Pop');
    });

    it('should call onClear when "Tất cả" is pressed', () => {
        render(
            <FilterChips
                selectedGenres={['Pop']}
                onToggleGenre={onToggleGenre}
                onClear={onClear}
            />,
        );

        fireEvent.press(screen.getByText('Tất cả'));

        expect(onClear).toHaveBeenCalled();
    });
});
