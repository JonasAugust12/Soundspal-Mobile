import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

interface InitialsAvatarProps {
    name?: string | null;
    /** Kích thước cạnh (px). Bỏ qua nếu dùng `fill`. */
    size?: number;
    /** Phủ toàn bộ khối cha (absoluteFill) — dùng cho thumbnail. */
    fill?: boolean;
    borderRadius?: number;
    fontSize?: number;
    style?: StyleProp<ViewStyle>;
}

/** Lấy tối đa 2 chữ cái đầu (chữ đầu của từ đầu + từ cuối). */
function getInitials(name?: string | null): string {
    const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Màu nền ổn định suy ra từ tên (cùng tên → cùng màu). */
function colorFromName(name?: string | null): string {
    const str = name ?? '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 58%, 52%)`;
}

/**
 * Avatar mặc định dạng chữ cái đầu, màu nền suy ra từ tên (giống Gmail/Slack).
 * Dùng khi tài khoản chưa có ảnh đại diện.
 */
export function InitialsAvatar({
    name,
    size = 48,
    fill = false,
    borderRadius,
    fontSize,
    style,
}: InitialsAvatarProps) {
    const initials = getInitials(name);
    const bg = colorFromName(name);
    const computedFontSize = fontSize ?? Math.round((fill ? size : size) * 0.4);

    return (
        <View
            style={[
                fill ? StyleSheet.absoluteFillObject : { width: size, height: size },
                {
                    backgroundColor: bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: borderRadius ?? (fill ? 0 : size / 2),
                },
                style,
            ]}
        >
            <Text
                style={{ color: '#FFFFFF', fontWeight: '800', fontSize: computedFontSize }}
                numberOfLines={1}
            >
                {initials}
            </Text>
        </View>
    );
}
