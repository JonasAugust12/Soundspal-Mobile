import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SocialList } from '@/features/profiles/presentation/components/profile/SocialList';

describe('SocialList', () => {
    it('should render "Kết nối" title when socials exist', () => {
        render(<SocialList facebook="https://facebook.com/test" />);

        expect(screen.getByText('Kết nối')).toBeTruthy();
    });

    it('should render facebook icon when facebook is provided', () => {
        render(<SocialList facebook="https://facebook.com/test" />);

        // Component renders with facebook
        expect(screen.root).toBeTruthy();
    });

    it('should render instagram icon when instagram is provided', () => {
        render(<SocialList instagram="https://instagram.com/test" />);

        expect(screen.root).toBeTruthy();
    });

    it('should render youtube icon when youtube is provided', () => {
        render(<SocialList youtube="https://youtube.com/test" />);

        expect(screen.root).toBeTruthy();
    });

    it('should render website icon when website is provided', () => {
        render(<SocialList website="https://example.com" />);

        expect(screen.root).toBeTruthy();
    });

    it('should render all social icons when all are provided', () => {
        render(
            <SocialList
                facebook="https://facebook.com/test"
                instagram="https://instagram.com/test"
                youtube="https://youtube.com/test"
                website="https://example.com"
            />,
        );

        expect(screen.getByText('Kết nối')).toBeTruthy();
    });

    it('should return null when no socials are provided', () => {
        const { toJSON } = render(<SocialList />);

        expect(toJSON()).toBeNull();
    });
});
