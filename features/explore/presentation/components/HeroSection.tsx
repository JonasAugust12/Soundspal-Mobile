import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { Beat } from '@/features/challenge/domain/entities/challenge.type';

interface HeroSectionProps {
    trendingBeat?: Beat;
}

export function HeroSection({ trendingBeat }: HeroSectionProps) {
    const router = useRouter();

    if (!trendingBeat) {
        return null;
    }

    // Convert entries count to shorthand (e.g., 12000 -> 12k)
    const formatCount = (count: number) => {
        if (count >= 1000) return `+${(count / 1000).toFixed(1).replace('.0', '')}k`;
        return `+${count}`;
    };

    return (
        <View className="mb-10 relative overflow-hidden rounded-3xl bg-gray-50 mt-4 border border-gray-100">
            {/* Background Image & Gradient */}
            <View className="absolute inset-0 z-0">
                <Image
                    source={{
                        uri:
                            trendingBeat.cover_image_url ||
                            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
                    }}
                    className="w-full h-full opacity-30"
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.7)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFillObject}
                />
            </View>

            {/* Content */}
            <View className="p-8 z-10 w-full">
                <Text className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-02 mb-2">
                    Thịnh hành
                </Text>
                <Text
                    className="text-gray-900 text-3xl font-heading tracking-tight leading-tight mb-6"
                    numberOfLines={2}
                >
                    {trendingBeat.title.toUpperCase()}
                </Text>

                <View className="flex-row items-center justify-between gap-6 mt-2">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.shadowButton, { borderRadius: 16 }]}
                        onPress={() =>
                            router.push(`/(challenge)/beat-detail?id=${trendingBeat.id}`)
                        }
                    >
                        <LinearGradient
                            colors={['#7d3bed', '#f471b7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 16 }}
                            className="px-6 py-3 flex-row items-center gap-2"
                        >
                            <Play size={16} color="white" fill="white" />
                            <Text className="text-white font-bold font-body">THAM GIA NGAY</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Avatars */}
                    <View className="flex-row -space-x-3 shrink-0">
                        <View className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                            <Image
                                source={{ uri: 'https://i.pravatar.cc/150?img=5' }}
                                className="w-full h-full"
                            />
                        </View>
                        <View className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                            <Image
                                source={{ uri: 'https://i.pravatar.cc/150?img=8' }}
                                className="w-full h-full"
                            />
                        </View>
                        <View className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 items-center justify-center shadow-sm">
                            <Text className="text-[9px] font-bold text-primary">
                                {formatCount(trendingBeat.entry_count)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    shadowButton: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
});
