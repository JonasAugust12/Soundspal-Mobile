import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, ScrollViewProps, ViewStyle } from 'react-native';

interface TabScreenWrapperProps {
    children: React.ReactNode;
    scrollable?: boolean;
    scrollViewProps?: Omit<ScrollViewProps, 'children'>;
    safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
    className?: string;
}

export const TabScreenWrapper = ({
    children,
    scrollable = true,
    scrollViewProps,
    safeAreaEdges = ['left', 'right'],
    className = 'flex-1 bg-white dark:bg-gray-900',
}: TabScreenWrapperProps) => {
    return (
        <SafeAreaView className={className} edges={safeAreaEdges}>
            {scrollable ? (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 100,
                        ...(scrollViewProps?.contentContainerStyle as object),
                    }}
                    {...scrollViewProps}
                >
                    {children}
                </ScrollView>
            ) : (
                children
            )}
        </SafeAreaView>
    );
};
