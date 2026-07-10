import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    type ViewStyle,
    type StyleProp,
} from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    className?: string;
}

/**
 * Card mặt phẳng bo góc.
 *
 * QUAN TRỌNG — nền phải ĐỤC HẲN (không alpha): trên Android, khi View có
 * borderRadius + overflow:hidden + elevation + nền bán trong suốt, hệ thống vẽ một
 * tấm nền trắng đục KHÔNG bo góc phía sau để đổ bóng → hiện ra "mảng trắng" trong card.
 * Dùng màu đục để triệt tiêu artifact này (Android không hỗ trợ glass trong suốt kèm bóng).
 */
export function GlassCard({ children, onPress, style, className }: GlassCardProps) {
    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                className={className}
                style={[styles.card, style]}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View className={className} style={[styles.card, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.06)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: { elevation: 2 },
        }),
    },
});
