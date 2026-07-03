import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cardShadow } from '@/shared/presentation/ui/shadows';
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

export const ArtistCardSkeleton = React.memo(function ArtistCardSkeleton({ width = 170 }: Props) {
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(withTiming(1, { duration: 800 }), withTiming(0.3, { duration: 800 })),
            -1,
            false,
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.cardWrapper, { width }]}>
            <View className="rounded-[20px] bg-white border border-gray-200 overflow-hidden">
                {/* Image Skeleton */}
                <Animated.View style={animatedStyle} className="w-full h-[140px] bg-gray-200" />

                {/* Content Skeleton */}
                <View className="p-3 gap-1.5">
                    {/* Name */}
                    <Animated.View
                        style={animatedStyle}
                        className="h-4 w-[70%] rounded bg-gray-200 self-center"
                    />

                    {/* Description */}
                    <Animated.View
                        style={animatedStyle}
                        className="h-3 w-[50%] rounded bg-gray-200 self-center mb-1"
                    />

                    <View className="gap-2 items-center">
                        {/* Location */}
                        <Animated.View
                            style={animatedStyle}
                            className="h-3 w-20 rounded bg-gray-200"
                        />

                        {/* Skills Badge */}
                        <Animated.View
                            style={animatedStyle}
                            className="h-6 w-15 rounded-lg bg-gray-200"
                        />
                    </View>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    cardWrapper: {
        ...cardShadow,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
});
