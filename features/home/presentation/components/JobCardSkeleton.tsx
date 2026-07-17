import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cardShadow } from '@/shared/presentation/ui/shadows';
import { JOB_CARD_HEIGHT } from './JobCard';
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
            withSequence(withTiming(1, { duration: 800 }), withTiming(0.3, { duration: 800 })),
            -1,
            false,
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.cardWrapper, { width, height: JOB_CARD_HEIGHT }]}>
            <View className="flex-1 rounded-2xl bg-white border border-gray-200 overflow-hidden">
                <View className="flex-row items-center gap-2 p-3 border-b border-gray-200">
                    <Animated.View
                        style={animatedStyle}
                        className="w-8 h-8 rounded-full bg-gray-200"
                    />
                    <View className="flex-1 gap-1">
                        <Animated.View
                            style={animatedStyle}
                            className="h-3 w-20 rounded bg-gray-200"
                        />
                        <Animated.View
                            style={animatedStyle}
                            className="h-2.5 w-16 rounded bg-gray-200"
                        />
                    </View>
                    <Animated.View
                        style={animatedStyle}
                        className="h-5 w-16 rounded-full bg-gray-200"
                    />
                </View>

                <View className="flex-1 px-3 pt-3 pb-3 justify-between">
                    <View className="gap-1.5">
                        <Animated.View
                            style={animatedStyle}
                            className="h-4 w-[90%] rounded bg-gray-200"
                        />
                        <Animated.View
                            style={animatedStyle}
                            className="h-3 w-full rounded bg-gray-200"
                        />
                        <Animated.View
                            style={animatedStyle}
                            className="h-3 w-[70%] rounded bg-gray-200"
                        />
                        <View className="flex-row gap-1">
                            <Animated.View
                                style={animatedStyle}
                                className="h-5 w-12 rounded-full bg-gray-200"
                            />
                            <Animated.View
                                style={animatedStyle}
                                className="h-5 w-12 rounded-full bg-gray-200"
                            />
                            <Animated.View
                                style={animatedStyle}
                                className="h-5 w-12 rounded-full bg-gray-200"
                            />
                        </View>
                        <Animated.View
                            style={animatedStyle}
                            className="h-3 w-[80%] rounded bg-gray-200"
                        />
                    </View>

                    <View className="gap-1.5 mt-2.5">
                        <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
                            <Animated.View
                                style={animatedStyle}
                                className="h-3 w-16 rounded bg-gray-200"
                            />
                            <Animated.View
                                style={animatedStyle}
                                className="h-3 w-20 rounded bg-gray-200"
                            />
                        </View>
                        <Animated.View
                            style={animatedStyle}
                            className="h-3 w-[75%] rounded bg-gray-200"
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
        borderRadius: 16,
    },
});
