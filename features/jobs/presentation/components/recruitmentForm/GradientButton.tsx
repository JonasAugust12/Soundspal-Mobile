import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_GRADIENT } from './recruitmentFormTheme';

interface GradientButtonProps extends TouchableOpacityProps {
    label: string;
    compact?: boolean;
}

export function GradientButton({ label, compact, style, ...rest }: GradientButtonProps) {
    return (
        <TouchableOpacity activeOpacity={0.85} style={[styles.wrap, style]} {...rest}>
            <LinearGradient
                colors={[...PRIMARY_GRADIENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradient, compact && styles.gradientCompact]}
            >
                <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
                    {label}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: {
        borderRadius: 14,
        overflow: 'hidden',
        flexShrink: 0,
    },
    gradient: {
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    gradientCompact: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 46,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    labelCompact: {
        fontSize: 13,
    },
});
