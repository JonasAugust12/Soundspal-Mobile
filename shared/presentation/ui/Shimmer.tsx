import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface ShimmerProps {
    style?: StyleProp<ViewStyle>;
    baseColor?: string;
    highlightColor?: string;
    /** Bo góc cho khối shimmer (vd avatar tròn: 999). */
    borderRadius?: number;
}

/**
 * Hiệu ứng skeleton "nhịp sáng" cho ảnh/khối đang tải.
 *
 * Cố ý KHÔNG dùng LinearGradient quét ngang: khi có hàng chục ảnh cùng tải (vd trang
 * chủ / landing) thì mỗi gradient động là một lớp compositor riêng, gây giật khi cuộn.
 * Ở đây chỉ nhấp nháy `opacity` của một lớp phủ màu bằng native driver — chạy trên
 * luồng UI, gần như không tốn JS/GPU, mà hiệu ứng "đang tải" vẫn rõ ràng.
 */
export function Shimmer({
    style,
    baseColor = '#E5E7EB',
    highlightColor = 'rgba(255,255,255,0.65)',
    borderRadius,
}: ShimmerProps) {
    // Biên độ nhấp nháy nhẹ (0.2 → 0.6) để giữ màu nhạt, không loé sáng gắt.
    const opacity = useRef(new Animated.Value(0.2)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.6,
                    duration: 750,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.2,
                    duration: 750,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [opacity]);

    return (
        <View
            style={[
                { backgroundColor: baseColor, overflow: 'hidden' },
                borderRadius != null ? { borderRadius } : null,
                style,
            ]}
        >
            <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { backgroundColor: highlightColor, opacity }]}
            />
        </View>
    );
}
