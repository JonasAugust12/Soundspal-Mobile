import React from 'react';
import { StyleSheet, Platform, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** Gradient thương hiệu của app: tím → hồng. */
export const THEME_GRADIENT: readonly [string, string] = ['#8B5CF6', '#EC4899'];

interface GradientIconProps {
    Icon: React.ElementType;
    /** Kích thước icon bên trong. */
    size?: number;
    /** Kích thước ô gradient. */
    box?: number;
    style?: ViewStyle;
}

/**
 * Icon đặt trên ô gradient theme + đổ bóng tím để nổi bật khỏi nền kính.
 */
export function GradientIcon({ Icon, size = 22, box = 44, style }: GradientIconProps) {
    return (
        <LinearGradient
            colors={THEME_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                { width: box, height: box, borderRadius: box * 0.32 },
                styles.center,
                styles.glow,
                style,
            ]}
        >
            <Icon size={size} color="#ffffff" strokeWidth={2.2} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: Platform.select({
        ios: {
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.22,
            shadowRadius: 6,
        },
        android: { elevation: 3 },
        default: {},
    }) as ViewStyle,
});
