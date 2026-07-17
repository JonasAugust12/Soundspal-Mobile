import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ArtistCard } from '@/features/home/presentation/components/ArtistCard';

describe('ArtistCard', () => {
    const mockItem = {
        id: '1',
        name: 'John Doe',
        description: 'Professional Singer',
        location: 'Hà Nội',
        skills: 'Pop / Rock / Jazz',
        image: { uri: 'https://example.com/image.jpg' },
        role: 'singer' as const,
    };

    it('should render artist name and description', () => {
        render(<ArtistCard item={mockItem} />);

        expect(screen.getByText('John Doe')).toBeTruthy();
        expect(screen.getByText('Professional Singer')).toBeTruthy();
    });

    it('should render location', () => {
        render(<ArtistCard item={mockItem} />);

        expect(screen.getByText('Hà Nội')).toBeTruthy();
    });

    it('should render skills as badges', () => {
        render(<ArtistCard item={mockItem} />);

        expect(screen.getByText('Pop')).toBeTruthy();
        expect(screen.getByText('Rock')).toBeTruthy();
        expect(screen.getByText('Jazz')).toBeTruthy();
    });

    it('should render Singer role badge', () => {
        render(<ArtistCard item={mockItem} />);

        expect(screen.getByText('Singer')).toBeTruthy();
    });

    it('should render Producer role badge', () => {
        const producerItem = { ...mockItem, role: 'producer' as const };
        render(<ArtistCard item={producerItem} />);

        expect(screen.getByText('Producer')).toBeTruthy();
    });

    it('should render Venue role badge', () => {
        const venueItem = { ...mockItem, role: 'venue' as const };
        render(<ArtistCard item={venueItem} />);

        expect(screen.getByText('Venue')).toBeTruthy();
    });

    it('should not render role badge when role is undefined', () => {
        const noRoleItem = { ...mockItem, role: undefined };
        render(<ArtistCard item={noRoleItem} />);

        expect(screen.queryByText('Singer')).toBeNull();
        expect(screen.queryByText('Producer')).toBeNull();
        expect(screen.queryByText('Venue')).toBeNull();
    });

    it('should call onPress when card is pressed', () => {
        const onPress = jest.fn();
        render(<ArtistCard item={mockItem} onPress={onPress} />);

        const card = screen.getByText('John Doe').parent?.parent?.parent;
        if (card) {
            fireEvent.press(card);
            expect(onPress).toHaveBeenCalled();
        }
    });

    it('should handle empty skills', () => {
        const noSkillsItem = { ...mockItem, skills: '' };
        render(<ArtistCard item={noSkillsItem} />);

        expect(screen.getByText('John Doe')).toBeTruthy();
    });
});
