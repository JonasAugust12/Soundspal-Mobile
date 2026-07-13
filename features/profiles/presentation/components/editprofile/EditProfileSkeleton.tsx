import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Skeleton loading cho màn Chỉnh sửa hồ sơ (artist & venue).
 * Mô phỏng: header, cover + avatar, thanh tab, và vài trường form.
 */
export function EditProfileSkeleton() {
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.85,
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

    const Box = ({ className }: { className?: string }) => (
        <Animated.View
            className={`bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}
            style={{ opacity: pulseAnim }}
        />
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center gap-3 p-4">
                <Box className="w-9 h-9 rounded-full" />
                <Box className="w-40 h-6" />
            </View>

            {/* Cover + avatar */}
            <View className="relative mb-16">
                <Box className="w-full h-40 rounded-none" />
                <View className="absolute -bottom-14 left-0 right-0 items-center">
                    <Box className="w-28 h-28 rounded-3xl border-4 border-background" />
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row gap-2.5 px-4 mb-6">
                <Box className="w-20 h-10 rounded-full" />
                <Box className="w-24 h-10 rounded-full" />
                <Box className="w-20 h-10 rounded-full" />
                <Box className="w-16 h-10 rounded-full" />
            </View>

            {/* Form fields */}
            <View className="px-4 gap-6">
                <View className="gap-2">
                    <Box className="w-24 h-4" />
                    <Box className="w-full h-14 rounded-xl" />
                </View>
                <View className="gap-2">
                    <Box className="w-28 h-4" />
                    <Box className="w-full h-24 rounded-xl" />
                </View>
                <View className="gap-2">
                    <Box className="w-20 h-4" />
                    <Box className="w-full h-14 rounded-xl" />
                </View>
                <Box className="w-full h-14 rounded-xl mt-2" />
            </View>
        </SafeAreaView>
    );
}
