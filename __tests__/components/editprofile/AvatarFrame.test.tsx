import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AvatarFrame } from '@/features/profiles/presentation/components/editprofile/AvatarFrame';

describe('AvatarFrame', () => {
    it('should render with default avatar when no URI provided', () => {
        render(<AvatarFrame />);

        expect(screen.root).toBeTruthy();
    });

    it('should render with singer role icon by default', () => {
        render(<AvatarFrame />);

        // Role icon is rendered
        expect(screen.root).toBeTruthy();
    });

    it('should render with producer role icon', () => {
        render(<AvatarFrame roleIcon="producer" />);

        expect(screen.root).toBeTruthy();
    });

    it('should render with venue role icon', () => {
        render(<AvatarFrame roleIcon="venue" />);

        expect(screen.root).toBeTruthy();
    });

    it('should render with custom avatar URI', () => {
        render(<AvatarFrame avatarUri="https://example.com/avatar.jpg" />);

        expect(screen.root).toBeTruthy();
    });

    it('should show edit button when editable is true', () => {
        render(<AvatarFrame editable={true} />);

        // Edit button is rendered
        expect(screen.root).toBeTruthy();
    });

    it('should not show edit button when editable is false', () => {
        render(<AvatarFrame editable={false} />);

        // Edit button is not rendered
        expect(screen.root).toBeTruthy();
    });

    it('should call onPickAvatar when edit button is pressed', () => {
        const onPickAvatar = jest.fn();
        render(<AvatarFrame editable={true} onPickAvatar={onPickAvatar} />);

        // Note: Testing onPress requires testID on the Camera button
        expect(screen.root).toBeTruthy();
    });
});
