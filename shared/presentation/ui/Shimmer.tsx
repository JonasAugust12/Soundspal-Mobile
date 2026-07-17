import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShimmerProps {
    style?: StyleProp<ViewStyle>;
    baseColor?: string;
    highlightColor?: string;
    /** Bo góc cho khối shimmer (vd avatar tròn: 999). */
    borderRadius?: number;
}

/**
 * Hiệu ứng skeleton "quét sáng" cho ảnh đang tải.
 * Dùng làm lớp phủ (absoluteFill) trên vùng ảnh chưa hiển thị để báo cho người dùng biết đang load.
 */
export function Shimmer({
    style,
    baseColor = '#E5E7EB',
    highlightColor = 'rgba(255,255,255,0.6)',
    borderRadius,
}: ShimmerProps) {
    const progress = useRef(new Animated.Value(0)).current;
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(progress, {
                toValue: 1,
                duration: 1100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );
        loop.start();
        return () => loop.stop();
    }, [progress]);

    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <View
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            style={[
                { backgroundColor: baseColor, overflow: 'hidden' },
                borderRadius != null ? { borderRadius } : null,
                style,
            ]}
        >
            {width > 0 && (
                <Animated.View
                    style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={['transparent', highlightColor, 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            )}
        </View>
    );
}
