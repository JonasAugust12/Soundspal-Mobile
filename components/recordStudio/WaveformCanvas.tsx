import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const WaveformCanvas = memo(function WaveformCanvas() {
    const bars = [
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

    return (
        <View className="flex-1 flex justify-center items-center relative overflow-hidden my-6 py-6 h-64 min-h-[250px]">
            {/* Center Line Guide */}
            <View className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-[#f471b7]/40 z-10" />

            {/* Ghost Text */}
            <View className="absolute inset-0 items-center justify-center pointer-events-none z-0">
                <Text className="text-gray-100 text-7xl font-black font-heading uppercase italic tracking-tighter opacity-90">
                    THU ÂM
                </Text>
            </View>

            {/* Waveform Bars */}
            <View className="flex-row items-center justify-center gap-1.5 px-4 z-10 w-full h-full">
                {bars.map((bar, index) => {
                    let bgColor = '#e5e7eb'; // gray-200 base
                    let extraStyle = {};

                    if (bar.type === 'active') bgColor = '#7d3bed'; // primary
                    if (bar.type === 'highlight') {
                        bgColor = '#f471b7';
                        extraStyle = styles.glowShadow;
                    }
                    if (bar.type === 'inactive') bgColor = '#c4b5fd'; // light primary representing past
                    if (bar.type === 'future') bgColor = '#e5e7eb'; // future is gray

                    return (
                        <View
                            key={index}
                            style={[
                                {
                                    height: bar.height,
                                    backgroundColor: bgColor,
                                    width: 3.5,
                                    borderRadius: 9999,
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
});
