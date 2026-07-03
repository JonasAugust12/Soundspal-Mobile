import React from 'react';
import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';

export type ScreenSafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

export const SCREEN_SAFE_AREA_EDGES: ScreenSafeAreaEdge[] = ['top', 'left', 'right'];

interface ScreenSafeAreaProps extends SafeAreaViewProps {
    edges?: ScreenSafeAreaEdge[];
}

export function ScreenSafeArea({
    children,
    edges = SCREEN_SAFE_AREA_EDGES,
    className = 'flex-1',
    ...props
}: ScreenSafeAreaProps) {
    return (
        <SafeAreaView className={className} edges={edges} {...props}>
            {children}
        </SafeAreaView>
    );
}
