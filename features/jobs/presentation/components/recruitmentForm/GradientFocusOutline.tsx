import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_GRADIENT, RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

const BORDER_WIDTH = 2;

interface GradientFocusOutlineProps {
    focused: boolean;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    borderRadius?: number;
}

export function GradientFocusOutline({
    focused,
    children,
    style,
    borderRadius = 12,
}: GradientFocusOutlineProps) {
    const innerRadius = Math.max(borderRadius - BORDER_WIDTH, 0);
    const borderColors = focused
        ? ([...PRIMARY_GRADIENT] as [string, string, ...string[]])
        : ([RECRUITMENT_FORM_COLORS.border, RECRUITMENT_FORM_COLORS.border] as [string, string]);

    return (
        <View style={[styles.host, style]}>
            <LinearGradient
                colors={borderColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientShell, { borderRadius }]}
            >
                <View
                    style={[
                        styles.inner,
                        { borderRadius: innerRadius },
                        focused ? styles.innerFocused : styles.innerDefault,
                    ]}
                >
                    {children}
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    host: {
        minWidth: 0,
    },
    gradientShell: {
        padding: BORDER_WIDTH,
    },
    inner: {
        overflow: 'hidden',
    },
    innerFocused: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
    },
    innerDefault: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surfaceMuted,
    },
});
