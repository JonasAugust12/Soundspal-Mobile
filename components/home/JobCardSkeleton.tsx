import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';

type Props = {
    width?: number;
};

export const JobCardSkeleton = React.memo(function JobCardSkeleton({ width = 210 }: Props) {
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.3, { duration: 800 })
            ),
            -1,
            false
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View
            style={[styles.shadow, { width }]}
            className="rounded-[20px] bg-white border border-gray-200 overflow-hidden"
        >
            {/* Image Skeleton */}
            <Animated.View
                style={animatedStyle}
                className="w-full h-[130px] bg-gray-200"
            />

            {/* Content Skeleton */}
            <View className="p-3 gap-2">
                {/* Title */}
                <Animated.View
                    style={animatedStyle}
                    className="h-4 w-[85%] rounded bg-gray-200"
                />

                {/* Date and Location Row */}
                <View className="flex-row gap-3 items-center">
                    <Animated.View
                        style={animatedStyle}
                        className="h-3 w-15 rounded bg-gray-200"
                    />
                    <Animated.View
                        style={animatedStyle}
                        className="h-3 flex-1 rounded bg-gray-200"
                    />
                </View>

                {/* Footer */}
                <View className="flex-row justify-between items-center mt-1">
                    <Animated.View
                        style={animatedStyle}
                        className="h-3 w-15 rounded bg-gray-200"
                    />
                    <Animated.View
                        style={animatedStyle}
                        className="h-6 w-20 rounded-lg bg-gray-200"
                    />
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});
