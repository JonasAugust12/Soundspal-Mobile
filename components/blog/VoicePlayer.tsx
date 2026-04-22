import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Play, Pause } from 'lucide-react-native';

interface VoicePlayerProps {
    duration: number;
    onPress?: () => void;
}

export function VoicePlayer({ duration, onPress }: VoicePlayerProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPress = () => {
        setIsPlaying(!isPlaying);
        onPress?.();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Generate waveform bars
    const bars = Array.from({ length: 20 }, (_, i) => {
        const random = Math.sin(i * 0.5) * 0.5 + 0.5;
        return {
            height: random,
            isProgress: false,
        };
    });

    return (
        <View
            className={`flex-row items-center gap-3 p-3 rounded-lg ${
                isDark ? 'bg-slate-800' : 'bg-purple-50'
            }`}
        >
            {/* Play button */}
            <TouchableOpacity
                onPress={handlePlayPress}
                className="w-12 h-12 rounded-full bg-purple-600 items-center justify-center"
                activeOpacity={0.8}
            >
                {isPlaying ? (
                    <Pause size={24} color="white" fill="white" />
                ) : (
                    <Play size={24} color="white" fill="white" />
                )}
            </TouchableOpacity>

            {/* Waveform */}
            <View className="flex-1 flex-row items-center justify-center gap-0.5 h-8">
                {bars.map((bar, index) => (
                    <View
                        key={index}
                        className={`flex-1 rounded-full ${
                            bar.isProgress
                                ? 'bg-purple-600'
                                : isDark
                                  ? 'bg-slate-600'
                                  : 'bg-gray-300'
                        }`}
                        style={{
                            height: `${bar.height * 100}%`,
                        }}
                    />
                ))}
            </View>

            {/* Time */}
            <Text
                className={`text-sm font-semibold min-w-[2.5rem] ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
            >
                {formatTime(duration)}
            </Text>
        </View>
    );
}
