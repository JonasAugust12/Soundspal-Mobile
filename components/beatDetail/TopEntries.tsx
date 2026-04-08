import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useGetLeaderboard } from '@/hooks/useChallengeApi';
import { type BeatEntry } from '@/types/challenge.type';

const TOP_ENTRIES = [
    {
        rank: 1,
        name: 'CYBER_GHOST',
        score: '98.4 ĐIỂM',
        votes: '1.2K BÌNH CHỌN',
        avatar: 'https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?w=150&q=80',
        rankBg: 'bg-primary',
    },
    {
        rank: 2,
        name: 'LYRICIST_X',
        score: '94.2 ĐIỂM',
        votes: '856 BÌNH CHỌN',
        avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&q=80',
        rankBg: 'bg-gray-400',
    },
];

interface TopEntriesProps {
    beatId: string;
}

export function TopEntries({ beatId }: TopEntriesProps) {
    const router = useRouter();
    const { data } = useGetLeaderboard(beatId, 2);
    const apiEntries = data?.entries || [];

    return (
        <View className="px-6 pb-6">
            <View className="flex-row justify-between items-end mb-6">
                <View>
                    <Text className="font-body text-[#f471b7] text-[10px] uppercase tracking-widest font-bold mb-1">
                        Đang thịnh hành
                    </Text>
                    <Text className="font-heading text-2xl font-black italic text-gray-900 uppercase">
                        Tham gia hàng đầu
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                        router.push({
                            pathname: '/(challenge)/leaderboard',
                            params: { id: beatId },
                        })
                    }
                >
                    <Text className="text-primary font-bold text-xs uppercase tracking-widest font-body">
                        Xem tất cả
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="gap-3">
                {(apiEntries.length > 0 ? apiEntries : TOP_ENTRIES).map(
                    (entry: BeatEntry | (typeof TOP_ENTRIES)[number], index: number) => {
                        const isMock = !('vote_count' in entry);
                        return (
                            <TouchableOpacity
                                key={isMock ? entry.rank : entry.id}
                                activeOpacity={0.7}
                                className="bg-white p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100"
                                style={styles.cardShadow}
                            >
                                <View className="relative">
                                    <View className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                        <Image
                                            source={{
                                                uri: isMock
                                                    ? entry.avatar
                                                    : 'https://api.dicebear.com/7.x/avataaars/png?seed=' +
                                                      entry.username,
                                            }}
                                            className="w-full h-full"
                                        />
                                    </View>
                                    <View
                                        className={`absolute -top-2 -left-2 ${index === 0 ? 'bg-primary' : 'bg-gray-400'} w-6 h-6 rounded-full flex items-center justify-center border-2 border-white`}
                                    >
                                        <Text className="text-[10px] text-white font-black font-heading">
                                            {index + 1}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-1">
                                    <Text className="font-heading font-bold text-sm text-gray-900 mb-1">
                                        {isMock ? entry.name : entry.display_name || entry.username}
                                    </Text>
                                    <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">
                                        {isMock ? entry.score : `${entry.total_score} ĐIỂM`} •{' '}
                                        <Text className="text-[#f471b7]">
                                            🔥{' '}
                                            {isMock ? entry.votes : `${entry.vote_count} BÌNH CHỌN`}
                                        </Text>
                                    </Text>
                                </View>

                                <TouchableOpacity className="p-2">
                                    <MoreVertical size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    },
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
});
