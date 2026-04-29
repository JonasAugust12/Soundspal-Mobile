import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Play, Square, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useGetLeaderboard } from '@/hooks/useChallengeApi';
import { useAudioStore } from '@/stores/audioStore';
import { type BeatEntry } from '@/types/challenge.type';

interface TopEntriesProps {
    beatId: string;
    onEntryPress?: (entry: BeatEntry) => void;
}

export function TopEntries({ beatId, onEntryPress }: TopEntriesProps) {
    const router = useRouter();
    // Fetch top 5 including unscored entries
    const { data } = useGetLeaderboard(beatId, 5, 0, true);
    const entries = data?.entries || [];

    const playEntry = useAudioStore((s) => s.playEntry);
    const stopEntry = useAudioStore((s) => s.stopEntry);
    const currentEntry = useAudioStore((s) => s.currentEntry);
    const isEntryPlaying = useAudioStore((s) => s.isEntryPlaying);
    const isEntryLoading = useAudioStore((s) => s.isEntryLoading);

    useEffect(() => {
        return () => {
            stopEntry();
        };
    }, [stopEntry]);

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
                {entries.length === 0 ? (
                    <View className="bg-gray-50 rounded-2xl p-6 items-center">
                        <Text className="text-gray-400 font-body text-sm text-center">
                            Chưa có bài dự thi nào. Hãy là người đầu tiên!
                        </Text>
                    </View>
                ) : (
                    (entries as BeatEntry[]).map((entry, index) => {
                        const isPending = entry.scoring_status === 'pending';
                        const isScored =
                            entry.scoring_status === 'scored' ||
                            entry.scoring_status === 'completed';
                        const isThisPlaying = currentEntry?.id === entry.id && isEntryPlaying;
                        const isThisLoading = currentEntry?.id === entry.id && isEntryLoading;

                        return (
                            <TouchableOpacity
                                key={entry.id}
                                activeOpacity={isScored ? 0.7 : 0.9}
                                className="bg-white p-4 rounded-2xl flex-row items-center gap-3 border border-gray-100"
                                style={styles.cardShadow}
                                onPress={() => {
                                    if (isScored && onEntryPress) {
                                        onEntryPress(entry);
                                    } else {
                                        playEntry(entry);
                                    }
                                }}
                            >
                                {/* Rank badge */}
                                <View className="relative">
                                    <View className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100">
                                        <Image
                                            source={{
                                                uri:
                                                    entry.avatar_url ||
                                                    `https://api.dicebear.com/7.x/avataaars/png?seed=${entry.username}`,
                                            }}
                                            className="w-full h-full"
                                        />
                                    </View>
                                    <View
                                        className={`absolute -top-2 -left-2 ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'} w-5 h-5 rounded-full flex items-center justify-center border-2 border-white`}
                                    >
                                        <Text className="text-[9px] text-white font-black font-heading">
                                            {index + 1}
                                        </Text>
                                    </View>
                                </View>

                                {/* Info */}
                                <View className="flex-1">
                                    <Text
                                        className="font-heading font-bold text-sm text-gray-900 mb-0.5"
                                        numberOfLines={1}
                                    >
                                        {entry.display_name || entry.username}
                                    </Text>
                                    {isPending ? (
                                        <View className="flex-row items-center gap-1">
                                            <Clock size={9} color="#f59e0b" />
                                            <Text className="text-[9px] text-amber-500 font-body font-bold uppercase tracking-widest">
                                                Đang chờ chấm
                                            </Text>
                                        </View>
                                    ) : entry.scoring_status === 'failed' ? (
                                        <View className="flex-row items-center gap-1">
                                            <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            <Text className="text-[9px] text-red-500 font-body font-bold uppercase tracking-widest">
                                                Chấm điểm lỗi
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text className="text-gray-400 text-[9px] uppercase font-bold tracking-tighter font-body">
                                            {Number(entry.total_score).toFixed(1)} điểm • 🔥{' '}
                                            {entry.vote_count} bình chọn
                                        </Text>
                                    )}
                                </View>

                                {/* Play indicator */}
                                <TouchableOpacity
                                    onPress={() => playEntry(entry)}
                                    className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center"
                                >
                                    {isThisLoading ? (
                                        <ActivityIndicator size="small" color="#7d3bed" />
                                    ) : isThisPlaying ? (
                                        <Square size={13} color="#7d3bed" fill="#7d3bed" />
                                    ) : (
                                        <Play
                                            size={13}
                                            color="#7d3bed"
                                            fill="#7d3bed"
                                            style={{ marginLeft: 1 }}
                                        />
                                    )}
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })
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
