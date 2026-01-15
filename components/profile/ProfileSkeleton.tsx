import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export function ProfileSkeleton() {
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.8,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    const SkeletonBox = ({ className }: { className?: string }) => (
        <Animated.View
            className={`bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}
            style={{ opacity: pulseAnim }}
        />
    );

    return (
        <View className="gap-4 bg-background">
            {/* Background skeleton */}
            <SkeletonBox className="h-60 w-full rounded-none" />

            {/* Avatar and info skeleton */}
            <View className="flex-row items-end gap-4 px-5 -mt-16">
                <SkeletonBox className="w-28 h-28 rounded-2xl border-4 border-background" />
                <View className="gap-3 flex-1 mb-2">
                    <SkeletonBox className="w-48 h-7 rounded-lg" />
                    <View className="flex-row gap-4">
                        <SkeletonBox className="w-24 h-5 rounded" />
                        <SkeletonBox className="w-16 h-5 rounded-full" />
                    </View>
                </View>
            </View>

            {/* Bio skeleton */}
            <View className="px-5 gap-2 mt-4">
                <SkeletonBox className="w-full h-5" />
                <SkeletonBox className="w-full h-5" />
                <SkeletonBox className="w-3/4 h-5" />
            </View>

            {/* Button skeleton */}
            <View className="px-5 mt-2">
                <SkeletonBox className="w-full h-14 rounded-xl" />
            </View>

            {/* Sections skeleton */}
            <View className="px-5 gap-4 mt-4">
                <SkeletonBox className="w-40 h-6" />
                <SkeletonBox className="w-full h-52 rounded-2xl" />
            </View>

            <View className="px-5 gap-4 mt-4 pb-10">
                <SkeletonBox className="w-40 h-6" />
                <View className="flex-row gap-4">
                    <SkeletonBox className="flex-1 h-44 rounded-2xl" />
                    <SkeletonBox className="flex-1 h-44 rounded-2xl" />
                </View>
            </View>
        </View>
    );
}
