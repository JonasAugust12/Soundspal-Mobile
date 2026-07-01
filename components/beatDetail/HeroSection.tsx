import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Play, Pause, Headphones, Mic } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioStore } from '@/stores/audioStore';
import type { Beat } from '@/types/challenge.type';

interface HeroSectionProps {
    beat?: Beat;
}

export function HeroSection({ beat }: HeroSectionProps) {
    const currentBeat = useAudioStore((state) => state.currentBeat);
    const isPlaying = useAudioStore((state) => state.isPlaying);
    const isLoading = useAudioStore((state) => state.isLoading);
    const playBeat = useAudioStore((state) => state.playBeat);
    const togglePlay = useAudioStore((state) => state.togglePlay);

    const isCurrentBeat = currentBeat?.id === beat?.id;

    const handlePlay = () => {
        if (!beat) return;
        if (isCurrentBeat) {
            togglePlay();
        } else {
            playBeat(beat);
        }
    };

    return (
        <View className="relative w-full aspect-square md:aspect-video overflow-hidden">
            <Image
                source={{
                    uri:
                        beat?.cover_image_url ||
                        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80',
                }}
                className="w-full h-full object-cover"
            />

            {/* Blend into the white canvas */}
            <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.7)', '#ffffff']}
                className="absolute inset-0"
            />

            <View className="absolute inset-0 items-center justify-center -mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="w-20 h-20 rounded-full bg-white/90 border border-white items-center justify-center"
                    style={styles.playShadow}
                    onPress={handlePlay}
                >
                    {isLoading && isCurrentBeat ? (
                        <ActivityIndicator size="large" color="#7d3bed" />
                    ) : isPlaying && isCurrentBeat ? (
                        <Pause size={40} color="#7d3bed" fill="#7d3bed" />
                    ) : (
                        <Play size={40} color="#7d3bed" fill="#7d3bed" style={{ marginLeft: 6 }} />
                    )}
                </TouchableOpacity>
            </View>

            <View className="absolute bottom-10 left-6 flex-row gap-3">
                <View className="bg-white/90 px-4 py-2 rounded-full flex-row items-center gap-2 border border-gray-200">
                    <Headphones size={14} color="#7d3bed" />
                    <Text className="text-[10px] font-bold tracking-widest text-gray-900 font-body">
                        {beat?.duration_seconds ? `${beat.duration_seconds}s` : '0L'} LƯỢT NGHE
                    </Text>
                </View>
                <View className="bg-white/90 px-4 py-2 rounded-full flex-row items-center gap-2 border border-gray-200">
                    <Mic size={14} color="#f471b7" />
                    <Text className="text-[10px] font-bold tracking-widest text-gray-900 font-body">
                        {beat?.entry_count || 0} LƯỢT THAM GIA
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    playShadow: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
});
