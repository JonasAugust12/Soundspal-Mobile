import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { useAudioStore } from '@/features/challenge/presentation/store/audioStore';

export function MiniPlayer() {
    const currentBeat = useAudioStore((state) => state.currentBeat);
    const isPlaying = useAudioStore((state) => state.isPlaying);
    const isLoading = useAudioStore((state) => state.isLoading);
    const togglePlay = useAudioStore((state) => state.togglePlay);

    // Create animated values for 6 bars
    const animations = useRef([...Array(6)].map(() => new Animated.Value(0.2))).current;

    useEffect(() => {
        if (isPlaying) {
            // Start bouncing animation for each bar
            const loops = animations.map((anim, i) => {
                const peak = [1, 0.6, 0.8, 0.5, 0.9, 0.6][i]; // Different heights
                const duration = 250 + (i % 3) * 50; // Different speeds so they desync naturally

                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: peak,
                            duration: duration,
                            useNativeDriver: false,
                        }),
                        Animated.timing(anim, {
                            toValue: 0.2,
                            duration: duration,
                            useNativeDriver: false,
                        }),
                    ]),
                );
            });

            Animated.parallel(loops).start();

            return () => {
                loops.forEach((loop) => loop.stop());
            };
        } else {
            // Smoothly reset to baseline when paused
            animations.forEach((anim) => {
                anim.stopAnimation();
                Animated.timing(anim, {
                    toValue: 0.2,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            });
        }
    }, [isPlaying, animations]);

    if (!currentBeat) return null;

    return (
        <View
            style={styles.container}
            className="absolute shadow-xl bottom-[110px] right-6 p-3 rounded-2xl flex-row items-center gap-4 border border-gray-100"
        >
            <View className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                    source={{
                        uri:
                            currentBeat.cover_image_url ||
                            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&q=80',
                    }}
                    className="w-full h-full object-cover"
                />
            </View>

            <View className="flex-col">
                <Text
                    className="text-gray-900 text-xs font-bold font-heading w-24"
                    numberOfLines={1}
                >
                    {currentBeat.title}
                </Text>

                {/* Animated Audio Visualizer */}
                <View className="flex-row items-end gap-[3px] h-3 mt-1">
                    {animations.map((anim, i) => (
                        <Animated.View
                            key={i}
                            className="w-[3px] bg-primary rounded-full"
                            style={{
                                height: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                                opacity: isPlaying ? 1 : 0.5,
                            }}
                        />
                    ))}
                </View>
            </View>

            <TouchableOpacity activeOpacity={0.7} className="ml-2" onPress={togglePlay}>
                <View className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-sm">
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : isPlaying ? (
                        <Pause size={18} color="#ffffff" fill="#ffffff" />
                    ) : (
                        <Play size={18} color="#ffffff" fill="#ffffff" style={{ marginLeft: 2 }} />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        ...Platform.select({
            ios: {
                shadowColor: '#7d3bed',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
        }),
        zIndex: 40,
    },
});
