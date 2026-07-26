import React, { useEffect } from 'react';
import {
    View,
    Text,
    Image,
    Platform,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThumbsUp, Play, Square } from 'lucide-react-native';
import { type BeatEntry } from '@/features/challenge/domain/entities/challenge.type';
import { useAudioStore } from '@/features/challenge/presentation/store/audioStore';
import { useEntryVotes } from '@/features/challenge/presentation/hooks/useEntryVotes';

interface PodiumProps {
    topEntries: BeatEntry[];
    onEntryPress: (entry: BeatEntry) => void;
}

export function Podium({ topEntries, onEntryPress }: PodiumProps) {
    const rank1 = topEntries[0];
    const rank2 = topEntries[1];
    const rank3 = topEntries[2];

    const playEntry = useAudioStore((s) => s.playEntry);
    const stopEntry = useAudioStore((s) => s.stopEntry);
    const currentEntry = useAudioStore((s) => s.currentEntry);
    const isEntryPlaying = useAudioStore((s) => s.isEntryPlaying);
    const isEntryLoading = useAudioStore((s) => s.isEntryLoading);

    const { isLiked, voteCount, toggle: handleVote, isPending } = useEntryVotes();

    useEffect(() => {
        return () => {
            stopEntry();
        };
    }, [stopEntry]);

    const getAvatar = (entry?: BeatEntry) =>
        entry?.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/png?seed=${entry?.username || entry?.id || 'user'}`;

    const PlayButton = ({ entry, size = 18 }: { entry: BeatEntry; size?: number }) => {
        const isThis = currentEntry?.id === entry.id;
        const isThisPlaying = isThis && isEntryPlaying;
        const isThisLoading = isThis && isEntryLoading;
        return (
            <TouchableOpacity
                onPress={() => playEntry(entry)}
                className="w-8 h-8 rounded-full bg-white/80 items-center justify-center border border-gray-100"
                activeOpacity={0.7}
            >
                {isThisLoading ? (
                    <ActivityIndicator size="small" color="#7d3bed" />
                ) : isThisPlaying ? (
                    <Square size={size - 2} color="#7d3bed" fill="#7d3bed" />
                ) : (
                    <Play
                        size={size - 2}
                        color="#7d3bed"
                        fill="#7d3bed"
                        style={{ marginLeft: 1 }}
                    />
                )}
            </TouchableOpacity>
        );
    };

    const VoteChip = ({ entry, light = false }: { entry: BeatEntry; light?: boolean }) => {
        const isVoted = isLiked(entry);
        const count = voteCount(entry);
        return (
            <TouchableOpacity
                onPress={() => handleVote(entry)}
                disabled={isPending(entry)}
                activeOpacity={0.7}
                className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full border ${isVoted ? 'bg-pink-50 border-pink-200' : light ? 'bg-gray-50 border-gray-100' : 'border-primary/30'}`}
            >
                <ThumbsUp
                    size={11}
                    color={isVoted ? '#f471b7' : light ? '#9ca3af' : '#7d3bed'}
                    fill={isVoted ? '#f471b7' : 'transparent'}
                />
                <Text
                    className={`text-[10px] font-bold ${isVoted ? 'text-[#f471b7]' : light ? 'text-gray-700' : 'text-primary'}`}
                >
                    {count}
                </Text>
            </TouchableOpacity>
        );
    };

    const EmptyRank = ({ flex }: { flex: number }) => <View style={{ flex }} />;

    return (
        <View className="flex-row items-end justify-center gap-3 mb-10 h-[360px]">
            {/* Rank 2 (Silver) */}
            {rank2 ? (
                <TouchableOpacity
                    activeOpacity={
                        rank2.scoring_status === 'scored' || rank2.scoring_status === 'completed'
                            ? 0.7
                            : 1
                    }
                    onPress={() =>
                        (rank2.scoring_status === 'scored' ||
                            rank2.scoring_status === 'completed') &&
                        onEntryPress(rank2)
                    }
                    style={[styles.cardShadow]}
                    className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center justify-end h-[270px] relative overflow-hidden"
                >
                    <Text className="absolute top-4 right-4 text-3xl font-black text-gray-100 italic font-heading">
                        #2
                    </Text>

                    <View className="absolute top-4 left-4">
                        <PlayButton entry={rank2} />
                    </View>

                    <View className="w-16 h-16 rounded-full border-[3px] border-gray-300 p-0.5 mb-3">
                        <Image
                            source={{ uri: getAvatar(rank2) }}
                            className="w-full h-full rounded-full"
                        />
                    </View>

                    <Text
                        className="font-heading text-sm font-bold text-gray-900"
                        numberOfLines={1}
                    >
                        {rank2.display_name || rank2.username}
                    </Text>
                    <Text
                        className={`font-heading text-2xl font-black ${rank2.scoring_status === 'failed' ? 'text-red-400' : 'text-gray-600'}`}
                    >
                        {rank2.scoring_status === 'pending' || rank2.scoring_status === 'failed'
                            ? '—'
                            : Number(rank2.total_score).toFixed(1)}
                    </Text>
                    <VoteChip entry={rank2} light />
                </TouchableOpacity>
            ) : (
                <EmptyRank flex={1} />
            )}

            {/* Rank 1 (Gold/Primary) */}
            {rank1 ? (
                <TouchableOpacity
                    activeOpacity={
                        rank1.scoring_status === 'scored' || rank1.scoring_status === 'completed'
                            ? 0.7
                            : 1
                    }
                    onPress={() =>
                        (rank1.scoring_status === 'scored' ||
                            rank1.scoring_status === 'completed') &&
                        onEntryPress(rank1)
                    }
                    style={[styles.primaryShadow]}
                    className="flex-[1.2] bg-white p-5 rounded-3xl border border-primary/20 items-center justify-end h-[330px] relative overflow-hidden z-10"
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

                    <View className="absolute top-4 left-4">
                        <PlayButton entry={rank1} size={20} />
                    </View>

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
                    <Text
                        className={`font-heading text-4xl font-black mb-2 ${rank1.scoring_status === 'failed' ? 'text-red-400' : 'text-gray-900'}`}
                    >
                        {rank1.scoring_status === 'pending' || rank1.scoring_status === 'failed'
                            ? '—'
                            : Number(rank1.total_score).toFixed(1)}
                    </Text>
                    <VoteChip entry={rank1} />
                </TouchableOpacity>
            ) : (
                <EmptyRank flex={1.2} />
            )}

            {/* Rank 3 (Bronze) */}
            {rank3 ? (
                <TouchableOpacity
                    activeOpacity={
                        rank3.scoring_status === 'scored' || rank3.scoring_status === 'completed'
                            ? 0.7
                            : 1
                    }
                    onPress={() =>
                        (rank3.scoring_status === 'scored' ||
                            rank3.scoring_status === 'completed') &&
                        onEntryPress(rank3)
                    }
                    style={[styles.cardShadow]}
                    className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center justify-end h-[250px] relative overflow-hidden"
                >
                    <Text className="absolute top-4 right-4 text-3xl font-black text-gray-100 italic font-heading">
                        #3
                    </Text>

                    <View className="absolute top-4 left-4">
                        <PlayButton entry={rank3} />
                    </View>

                    <View className="w-16 h-16 rounded-full border-[3px] border-orange-300 p-0.5 mb-3">
                        <Image
                            source={{ uri: getAvatar(rank3) }}
                            className="w-full h-full rounded-full"
                        />
                    </View>

                    <Text
                        className="font-heading text-sm font-bold text-gray-900"
                        numberOfLines={1}
                    >
                        {rank3.display_name || rank3.username}
                    </Text>
                    <Text
                        className={`font-heading text-2xl font-black ${rank3.scoring_status === 'failed' ? 'text-red-400' : 'text-orange-500'}`}
                    >
                        {rank3.scoring_status === 'pending' || rank3.scoring_status === 'failed'
                            ? '—'
                            : Number(rank3.total_score).toFixed(1)}
                    </Text>
                    <VoteChip entry={rank3} light />
                </TouchableOpacity>
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
            android: { elevation: 4 },
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
            android: { elevation: 10 },
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
            android: { elevation: 6 },
        }),
    },
});
