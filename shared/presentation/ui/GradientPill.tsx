import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** Gradient thương hiệu: primary01 (#7C3BED) → primary02 (#F471B7). */
export const BRAND_GRADIENT = ['#7C3BED', '#F471B7'] as const;

interface GradientPillProps {
    /** Khi active → nền gradient thương hiệu; ngược lại dùng inactiveClassName. */
    active: boolean;
    onPress?: () => void;
    disabled?: boolean;
    /** Class cho lớp bọc (layout, padding, bo góc...). */
    className?: string;
    /** Class chỉ áp khi KHÔNG active (viền + nền). */
    inactiveClassName?: string;
    /** Bán kính bo góc cho lớp gradient (mặc định pill tròn). */
    radius?: number;
    gradient?: readonly [string, string, ...string[]];
    style?: StyleProp<ViewStyle>;
    activeOpacity?: number;
    children: React.ReactNode;
}

/**
 * Pill/tag có nền gradient thương hiệu khi được chọn. Lớp gradient dùng
 * `borderRadius` riêng (không cần `overflow: hidden`) để không cắt mất shadow.
 */
export function GradientPill({
    active,
    onPress,
    disabled,
    className,
    inactiveClassName,
    radius = 999,
    gradient = BRAND_GRADIENT,
    style,
    activeOpacity = 0.7,
    children,
}: GradientPillProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={activeOpacity}
            style={style}
            className={`${className ?? ''} ${!active ? (inactiveClassName ?? '') : ''}`}
        >
            {active && (
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
                    pointerEvents="none"
                />
            )}
            {children}
        </TouchableOpacity>
    );
}
