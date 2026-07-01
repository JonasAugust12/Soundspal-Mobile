import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const STATIC_BARS = [
    { height: 48, type: 'inactive' },
    { height: 64, type: 'inactive' },
    { height: 96, type: 'inactive' },
    { height: 128, type: 'inactive' },
    { height: 160, type: 'inactive' },
    { height: 112, type: 'inactive' },
    { height: 80, type: 'inactive' },
    { height: 192, type: 'active' },
    { height: 224, type: 'active' },
    { height: 240, type: 'highlight' },
    { height: 176, type: 'active' },
    { height: 128, type: 'active' },
    { height: 96, type: 'future' },
    { height: 64, type: 'future' },
    { height: 144, type: 'future' },
    { height: 208, type: 'future' },
    { height: 160, type: 'future' },
    { height: 80, type: 'future' },
    { height: 48, type: 'future' },
    { height: 32, type: 'future' },
    { height: 96, type: 'future' },
    { height: 144, type: 'future' },
    { height: 80, type: 'future' },
    { height: 48, type: 'future' },
    { height: 64, type: 'future' },
];

interface WaveformCanvasProps {
    isRecording?: boolean;
}

export const WaveformCanvas = memo(function WaveformCanvas({
    isRecording = false,
}: WaveformCanvasProps) {
    // One Animated.Value per bar
    const animations = useRef(STATIC_BARS.map(() => new Animated.Value(1))).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isRecording) {
            // Every 100ms, randomise each bar's scale so they "dance"
            intervalRef.current = setInterval(() => {
                animations.forEach((anim) => {
                    const target = 0.3 + Math.random() * 1.1; // 30% – 140% of original height
                    Animated.spring(anim, {
                        toValue: target,
                        friction: 4,
                        tension: 80,
                        useNativeDriver: true,
                    }).start();
                });
            }, 120);
        } else {
            // Reset all bars to their natural height
            if (intervalRef.current) clearInterval(intervalRef.current);
            animations.forEach((anim) => {
                Animated.spring(anim, {
                    toValue: 1,
                    friction: 6,
                    tension: 60,
                    useNativeDriver: true,
                }).start();
            });
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRecording, animations]);

    return (
        <View className="flex-1 flex justify-center items-center relative overflow-hidden my-6 py-6 h-64 min-h-[250px]">
            {/* Center Line Guide */}
            <View className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-[#f471b7]/40 z-10" />

            {/* Ghost Text */}
            <View className="absolute inset-0 items-center justify-center pointer-events-none z-0">
                <Text className="text-gray-100 text-7xl font-black font-heading uppercase italic tracking-tighter opacity-90">
                    {isRecording ? 'REC' : 'THU ÂM'}
                </Text>
            </View>

            {/* Waveform Bars */}
            <View className="flex-row items-center justify-center gap-1.5 px-4 z-10 w-full h-full">
                {STATIC_BARS.map((bar, index) => {
                    let bgColor = '#e5e7eb';
                    let extraStyle = {};

                    if (bar.type === 'active') bgColor = '#7d3bed';
                    if (bar.type === 'highlight') {
                        bgColor = '#f471b7';
                        extraStyle = isRecording ? styles.recordingGlow : styles.glowShadow;
                    }
                    if (bar.type === 'inactive') bgColor = '#c4b5fd';
                    if (bar.type === 'future') bgColor = '#e5e7eb';

                    // While recording, ALL bars join the dance with the primary accent colour
                    if (isRecording) {
                        bgColor = bar.type === 'highlight' ? '#f471b7' : '#7d3bed';
                    }

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                {
                                    height: bar.height,
                                    backgroundColor: bgColor,
                                    width: 3.5,
                                    borderRadius: 9999,
                                    transform: [{ scaleY: animations[index] }],
                                },
                                extraStyle,
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    glowShadow: {
        shadowColor: '#f471b7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 5,
    },
    recordingGlow: {
        shadowColor: '#f471b7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 16,
        elevation: 8,
    },
});
