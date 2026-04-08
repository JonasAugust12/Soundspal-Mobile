import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { PlayCircle, PauseCircle } from 'lucide-react-native';
import { useAudioStore } from '@/stores/audioStore';

export function MiniPlayer() {
    const { currentBeat, isPlaying, isLoading, togglePlay } = useAudioStore();

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

                {/* Audio Visualizer */}
                <View className="flex-row items-end gap-[3px] h-3 mt-1">
                    {[1, 0.6, 0.8, 0.4, 0.9, 0.5].map((h, i) => (
                        <View
                            key={i}
                            className={`w-[3px] bg-primary rounded-full transition-all`}
                            style={{
                                height: isPlaying ? `${h * 100}%` : '20%',
                                opacity: isPlaying ? 1 : 0.5,
                            }}
                        />
                    ))}
                </View>
            </View>

            <TouchableOpacity activeOpacity={0.7} className="ml-2" onPress={togglePlay}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#7d3bed" />
                ) : isPlaying ? (
                    <PauseCircle
                        size={32}
                        color="#7d3bed"
                        fill="#ffffff"
                        strokeWidth={1}
                        opacity={0.9}
                    />
                ) : (
                    <PlayCircle
                        size={32}
                        color="#7d3bed"
                        fill="#ffffff"
                        strokeWidth={1}
                        opacity={0.9}
                    />
                )}
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
