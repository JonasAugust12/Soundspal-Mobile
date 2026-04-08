import React from 'react';
import { View, Text, Image, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThumbsUp } from 'lucide-react-native';
import { type BeatEntry } from '@/types/challenge.type';

interface PodiumProps {
    topEntries: BeatEntry[];
}

export function Podium({ topEntries }: PodiumProps) {
    const rank1 = topEntries[0];
    const rank2 = topEntries[1];
    const rank3 = topEntries[2];

    const getAvatar = (entry?: BeatEntry) =>
        entry?.id
            ? `https://api.dicebear.com/7.x/avataaars/png?seed=${entry.username}`
            : 'https://i.pravatar.cc/150';

    const EmptyRank = ({ flex }: { flex: number }) => <View style={{ flex }} />;

    return (
        <View className="flex-row items-end justify-center gap-3 mb-10 h-[340px]">
            {/* Rank 2 (Silver) */}
            {rank2 ? (
                <View
                    style={[styles.cardShadow]}
                    className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center justify-end h-[260px] relative overflow-hidden"
                >
                    <Text className="absolute top-4 right-4 text-3xl font-black text-gray-100 italic font-heading">
                        #2
                    </Text>

                    <View className="w-16 h-16 rounded-full border-[3px] border-gray-300 p-0.5 mb-3">
                        <Image
                            source={{ uri: getAvatar(rank2) }}
                            className="w-full h-full rounded-full"
                        />
                    </View>

                    <Text
                        className="font-heading text-base font-bold text-gray-900"
                        numberOfLines={1}
                    >
                        {rank2.display_name || rank2.username}
                    </Text>
                    <Text className="font-heading text-2xl font-black text-gray-600">
                        {Number(rank2.total_score).toFixed(1)}
                    </Text>

                    <View className="mt-3 flex-row items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                        <ThumbsUp size={12} color="#f471b7" fill="#f471b7" />
                        <Text className="text-[10px] font-bold text-gray-700">
                            {rank2.vote_count}
                        </Text>
                    </View>
                </View>
            ) : (
                <EmptyRank flex={1} />
            )}

            {/* Rank 1 (Gold/Primary) */}
            {rank1 ? (
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
                            source={{ uri: getAvatar(rank1) }}
                            className="w-full h-full rounded-full"
                        />
                    </View>

                    <Text
                        className="font-heading text-lg font-black text-primary"
                        numberOfLines={1}
                    >
                        {rank1.display_name || rank1.username}
                    </Text>
                    <Text className="font-heading text-4xl font-black text-gray-900 mb-2">
                        {Number(rank1.total_score).toFixed(1)}
                    </Text>

                    <LinearGradient
                        colors={['#7d3bed', '#f471b7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="mt-2 flex-row items-center gap-1.5 px-5 py-2 rounded-full"
                    >
                        <ThumbsUp size={14} color="white" fill="white" />
                        <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                            {rank1.vote_count}
                        </Text>
                    </LinearGradient>
                </View>
            ) : (
                <EmptyRank flex={1.2} />
            )}

            {/* Rank 3 (Bronze) */}
            {rank3 ? (
                <View
                    style={[styles.cardShadow]}
                    className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center justify-end h-[240px] relative overflow-hidden"
                >
                    <Text className="absolute top-4 right-4 text-3xl font-black text-gray-100 italic font-heading">
                        #3
                    </Text>

                    <View className="w-16 h-16 rounded-full border-[3px] border-orange-300 p-0.5 mb-3">
                        <Image
                            source={{ uri: getAvatar(rank3) }}
                            className="w-full h-full rounded-full"
                        />
                    </View>

                    <Text
                        className="font-heading text-base font-bold text-gray-900"
                        numberOfLines={1}
                    >
                        {rank3.display_name || rank3.username}
                    </Text>
                    <Text className="font-heading text-2xl font-black text-orange-500">
                        {Number(rank3.total_score).toFixed(1)}
                    </Text>

                    <View className="mt-3 flex-row items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                        <ThumbsUp size={12} color="#f471b7" fill="#f471b7" />
                        <Text className="text-[10px] font-bold text-gray-700">
                            {rank3.vote_count}
                        </Text>
                    </View>
                </View>
            ) : (
                <EmptyRank flex={1} />
            )}
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
