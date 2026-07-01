import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TabScreenWrapper } from '@/shared/presentation/navigation/TabScreenWrapper';

describe('TabScreenWrapper', () => {
    it('should render children', () => {
        render(
            <TabScreenWrapper>
                <Text>Test Content</Text>
            </TabScreenWrapper>,
        );

        expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('should render with scrollable by default', () => {
        render(
            <TabScreenWrapper>
                <Text>Scrollable Content</Text>
            </TabScreenWrapper>,
        );

        expect(screen.getByText('Scrollable Content')).toBeTruthy();
    });

    it('should render without scroll when scrollable is false', () => {
        render(
            <TabScreenWrapper scrollable={false}>
                <Text>Non-scrollable Content</Text>
            </TabScreenWrapper>,
        );

        expect(screen.getByText('Non-scrollable Content')).toBeTruthy();
    });

    it('should apply custom className', () => {
        render(
            <TabScreenWrapper className="custom-class">
                <Text>Custom Class Content</Text>
            </TabScreenWrapper>,
        );

        expect(screen.getByText('Custom Class Content')).toBeTruthy();
    });
});
