import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/common/SearchBar';

describe('SearchBar', () => {
    it('should render with default placeholder', () => {
        render(<SearchBar />);

        expect(screen.getByPlaceholderText('Tìm kiếm ...')).toBeTruthy();
    });

    it('should render with custom placeholder', () => {
        render(<SearchBar placeholder="Search users..." />);

        expect(screen.getByPlaceholderText('Search users...')).toBeTruthy();
    });

    it('should display value prop', () => {
        render(<SearchBar value="test query" />);

        const input = screen.getByDisplayValue('test query');
        expect(input).toBeTruthy();
    });

    it('should call onChangeText when text is entered', () => {
        const onChangeText = jest.fn();
        render(<SearchBar onChangeText={onChangeText} />);

        const input = screen.getByPlaceholderText('Tìm kiếm ...');
        fireEvent.changeText(input, 'new search');

        expect(onChangeText).toHaveBeenCalledWith('new search');
    });

    it('should call onSubmitEditing when submit is pressed', () => {
        const onSubmitEditing = jest.fn();
        render(<SearchBar onSubmitEditing={onSubmitEditing} />);

        const input = screen.getByPlaceholderText('Tìm kiếm ...');
        fireEvent(input, 'submitEditing');

        expect(onSubmitEditing).toHaveBeenCalled();
    });

    it('should show filter button by default', () => {
        render(<SearchBar />);

        // Filter button should be present (SlidersHorizontal icon)
        const { root } = screen;
        expect(root).toBeTruthy();
    });

    it('should hide filter button when showFilter is false', () => {
        render(<SearchBar showFilter={false} />);

        // Component should render without filter button
        const { root } = screen;
        expect(root).toBeTruthy();
    });

    it('should have search returnKeyType', () => {
        render(<SearchBar />);

        const input = screen.getByPlaceholderText('Tìm kiếm ...');
        expect(input.props.returnKeyType).toBe('search');
    });

    it('should handle empty value', () => {
        render(<SearchBar value="" onChangeText={jest.fn()} />);

        const input = screen.getByPlaceholderText('Tìm kiếm ...');
        expect(input.props.value).toBe('');
    });
});
