import React from 'react';
import { View, Text, Image, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThumbsUp } from 'lucide-react-native';

export function Podium() {
    return (
        <View className="flex-row items-end justify-center gap-3 mb-10 h-[340px]">
            {/* Rank 2 (Silver) */}
            <View
                style={[styles.cardShadow]}
                className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center justify-end h-[260px] relative overflow-hidden"
            >
                <Text className="absolute top-4 right-4 text-3xl font-black text-gray-100 italic font-heading">
                    #2
                </Text>

                <View className="w-16 h-16 rounded-full border-[3px] border-gray-300 p-0.5 mb-3">
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                        className="w-full h-full rounded-full"
                    />
                </View>

                <Text className="font-heading text-base font-bold text-gray-900" numberOfLines={1}>
                    VibeEngine
                </Text>
                <Text className="font-heading text-2xl font-black text-gray-600">98.2</Text>

                <View className="mt-3 flex-row items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                    <ThumbsUp size={12} color="#f471b7" fill="#f471b7" />
                    <Text className="text-[10px] font-bold text-gray-700">1.2K</Text>
                </View>
            </View>

            {/* Rank 1 (Gold/Primary) */}
            <View
                style={[styles.primaryShadow]}
                className="flex-[1.2] bg-white p-5 rounded-3xl border border-primary/20 items-center justify-end h-[320px] relative overflow-hidden z-10"
            >
                <LinearGradient
                    colors={['#7d3bed', '#f471b7', '#7d3bed']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="absolute top-0 left-0 right-0 h-1"
                />
                <Text className="absolute top-4 right-4 text-5xl font-black text-primary/10 italic font-heading">
                    #1
                </Text>

                <View
                    style={styles.avatarGlow}
                    className="w-20 h-20 rounded-full border-[3px] border-primary p-0.5 mb-4 bg-white"
                >
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=59' }}
                        className="w-full h-full rounded-full"
                    />
                </View>

                <Text className="font-heading text-lg font-black text-primary" numberOfLines={1}>
                    NeonGhost
                </Text>
                <Text className="font-heading text-4xl font-black text-gray-900 mb-2">99.8</Text>

                <LinearGradient
                    colors={['#7d3bed', '#f471b7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="mt-2 flex-row items-center gap-1.5 px-5 py-2 rounded-full"
                >
                    <ThumbsUp size={14} color="white" fill="white" />
                    <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                        3.4K
                    </Text>
                </LinearGradient>
            </View>

            {/* Rank 3 (Bronze) */}
            <View
                style={[styles.cardShadow]}
                className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center justify-end h-[240px] relative overflow-hidden"
            >
                <Text className="absolute top-4 right-4 text-3xl font-black text-gray-100 italic font-heading">
                    #3
                </Text>

                <View className="w-16 h-16 rounded-full border-[3px] border-orange-300 p-0.5 mb-3">
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=33' }}
                        className="w-full h-full rounded-full"
                    />
                </View>

                <Text className="font-heading text-base font-bold text-gray-900" numberOfLines={1}>
                    BassLord
                </Text>
                <Text className="font-heading text-2xl font-black text-orange-500">97.5</Text>

                <View className="mt-3 flex-row items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                    <ThumbsUp size={12} color="#f471b7" fill="#f471b7" />
                    <Text className="text-[10px] font-bold text-gray-700">940</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    primaryShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#7d3bed',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    avatarGlow: {
        ...Platform.select({
            ios: {
                shadowColor: '#7d3bed',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            },
        }),
    },
});
