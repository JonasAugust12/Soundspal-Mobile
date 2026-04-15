import React, { useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { ThumbsUp, Play, Square, Clock } from 'lucide-react-native';
import { type BeatEntry } from '@/types/challenge.type';
import { challengeApi } from '@/hooks/useChallengeApi';
import { useAudioStore } from '@/stores/audioStore';
import Toast from 'react-native-toast-message';
import { useState } from 'react';

interface RankListProps {
    remainingEntries: BeatEntry[];
}

export function RankList({ remainingEntries }: RankListProps) {
    const playEntry = useAudioStore((s) => s.playEntry);
    const stopEntry = useAudioStore((s) => s.stopEntry);
    const currentEntry = useAudioStore((s) => s.currentEntry);
    const isEntryPlaying = useAudioStore((s) => s.isEntryPlaying);
    const isEntryLoading = useAudioStore((s) => s.isEntryLoading);

    const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

    // Stop playback when component unmounts (navigated away)
    useEffect(() => {
        return () => {
            stopEntry();
        };
    }, [stopEntry]);

    const handleVote = async (entry: BeatEntry) => {
        const alreadyVoted = votedIds.has(entry.id);
        try {
            if (alreadyVoted) {
                await challengeApi.removeVote(entry.id);
                setVotedIds((prev) => {
                    const s = new Set(prev);
                    s.delete(entry.id);
                    return s;
                });
                setVoteCounts((prev) => ({
                    ...prev,
                    [entry.id]: (prev[entry.id] ?? entry.vote_count) - 1,
                }));
            } else {
                await challengeApi.voteEntry(entry.id, 'up');
                setVotedIds((prev) => new Set(prev).add(entry.id));
                setVoteCounts((prev) => ({
                    ...prev,
                    [entry.id]: (prev[entry.id] ?? entry.vote_count) + 1,
                }));
            }
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể bình chọn.' });
        }
    };

    if (!remainingEntries || remainingEntries.length === 0) return null;

    const getAvatar = (item: BeatEntry) =>
        `https://api.dicebear.com/7.x/avataaars/png?seed=${item.username}`;

    return (
        <View className="gap-3">
            {remainingEntries.map((item, index) => {
                const rank = index + 4;
                const isPending = item.scoring_status === 'pending';
                const isVoted = votedIds.has(item.id);
                const voteCount = voteCounts[item.id] ?? item.vote_count;
                const isThisPlaying = currentEntry?.id === item.id && isEntryPlaying;
                const isThisLoading = currentEntry?.id === item.id && isEntryLoading;

                return (
                    <View
                        key={item.id}
                        style={styles.card}
                        className={`p-4 rounded-2xl border-l-[3px] bg-white ${isPending ? 'border-l-amber-400' : 'border-l-primary/40'}`}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3 flex-1">
                                <Text className="w-7 font-heading font-black text-gray-400 text-lg text-center">
                                    {rank}
                                </Text>
                                <View className="w-11 h-11 rounded-xl overflow-hidden border border-gray-100">
                                    <Image
                                        source={{ uri: getAvatar(item) }}
                                        className="w-full h-full"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className="font-bold text-gray-900 font-heading text-sm"
                                        numberOfLines={1}
                                    >
                                        {item.display_name || item.username}
                                    </Text>
                                    {isPending ? (
                                        <View className="flex-row items-center gap-1 mt-0.5">
                                            <Clock size={9} color="#f59e0b" />
                                            <Text className="text-[9px] text-amber-500 font-body font-bold uppercase tracking-widest">
                                                Đang chờ chấm
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text className="text-[9px] text-gray-400 font-body uppercase tracking-widest">
                                            KHỚP {Number(item.rhythm_score).toFixed(0)}%
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View className="flex-row items-center gap-2">
                                <View className="items-end min-w-[40px]">
                                    {isPending ? (
                                        <Text className="font-heading font-black text-lg text-amber-300">
                                            —
                                        </Text>
                                    ) : (
                                        <>
                                            <Text className="font-heading font-black text-xl text-primary">
                                                {Number(item.total_score).toFixed(1)}
                                            </Text>
                                            <Text className="text-[8px] text-[#f471b7] font-bold uppercase">
                                                Điểm AI
                                            </Text>
                                        </>
                                    )}
                                </View>

                                {/* Play button */}
                                <TouchableOpacity
                                    onPress={() => playEntry(item)}
                                    className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center"
                                    activeOpacity={0.7}
                                >
                                    {isThisLoading ? (
                                        <ActivityIndicator size="small" color="#7d3bed" />
                                    ) : isThisPlaying ? (
                                        <Square size={15} color="#7d3bed" fill="#7d3bed" />
                                    ) : (
                                        <Play
                                            size={15}
                                            color="#7d3bed"
                                            fill="#7d3bed"
                                            style={{ marginLeft: 2 }}
                                        />
                                    )}
                                </TouchableOpacity>

                                {/* Vote button */}
                                <TouchableOpacity
                                    className="items-center justify-center min-w-[28px]"
                                    activeOpacity={0.6}
                                    onPress={() => handleVote(item)}
                                >
                                    <ThumbsUp
                                        size={18}
                                        color={isVoted ? '#f471b7' : '#9ca3af'}
                                        fill={isVoted ? '#f471b7' : 'transparent'}
                                    />
                                    <Text
                                        className={`text-[9px] font-black mt-0.5 ${isVoted ? 'text-[#f471b7]' : 'text-gray-500'}`}
                                    >
                                        {voteCount}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: '#f3f4f6',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: { elevation: 2 },
        }),
    },
});
