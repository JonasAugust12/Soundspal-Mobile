import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { ThumbsUp, Play, Square, Clock, Trash2 } from 'lucide-react-native';
import { type BeatEntry } from '@/features/challenge/domain/entities/challenge.type';
import { useDeleteEntry } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { useEntryVotes } from '@/features/challenge/presentation/hooks/useEntryVotes';
import { useAudioStore } from '@/features/challenge/presentation/store/audioStore';
import { ConfirmModal } from '@/shared/presentation/ui/ConfirmModal';

interface RankListProps {
    remainingEntries: BeatEntry[];
    onEntryPress: (entry: BeatEntry) => void;
    currentUserId?: string;
}

export function RankList({ remainingEntries, onEntryPress, currentUserId }: RankListProps) {
    const playEntry = useAudioStore((s) => s.playEntry);
    const stopEntry = useAudioStore((s) => s.stopEntry);
    const currentEntry = useAudioStore((s) => s.currentEntry);
    const isEntryPlaying = useAudioStore((s) => s.isEntryPlaying);
    const isEntryLoading = useAudioStore((s) => s.isEntryLoading);

    const { isLiked, voteCount, toggle: handleVote } = useEntryVotes();
    const [confirmTarget, setConfirmTarget] = useState<BeatEntry | null>(null);

    const deleteEntryMutation = useDeleteEntry();

    // Stop playback when component unmounts (navigated away)
    useEffect(() => {
        return () => {
            stopEntry();
        };
    }, [stopEntry]);

    const handleDeleteConfirm = async () => {
        if (!confirmTarget) return;
        try {
            await deleteEntryMutation.mutateAsync(confirmTarget.id);
        } finally {
            setConfirmTarget(null);
        }
    };

    if (!remainingEntries || remainingEntries.length === 0) return null;

    const getAvatar = (item: BeatEntry) =>
        item.avatar_url || `https://api.dicebear.com/7.x/avataaars/png?seed=${item.username}`;

    return (
        <>
            <View className="gap-3">
                {remainingEntries.map((item, index) => {
                    const rank = index + 4;
                    const isPending = item.scoring_status === 'pending';
                    const isFailed = item.scoring_status === 'failed';
                    const isScored =
                        item.scoring_status === 'scored' || item.scoring_status === 'completed';
                    const isVoted = isLiked(item);
                    const itemVoteCount = voteCount(item);
                    const isThisPlaying = currentEntry?.id === item.id && isEntryPlaying;
                    const isThisLoading = currentEntry?.id === item.id && isEntryLoading;
                    const isOwner = !!currentUserId && item.user_id === currentUserId;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={isScored ? 0.7 : 1}
                            onPress={() => isScored && onEntryPress(item)}
                            style={styles.card}
                            className={`p-4 rounded-2xl border-l-[3px] bg-white ${isPending ? 'border-l-amber-400' : isFailed ? 'border-l-red-400' : 'border-l-primary/40'}`}
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
                                        ) : isFailed ? (
                                            <View className="flex-row items-center gap-1 mt-0.5">
                                                <View className="w-2 h-2 rounded-full bg-red-500" />
                                                <Text className="text-[9px] text-red-500 font-body font-bold uppercase tracking-widest">
                                                    Chấm điểm lỗi
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
                                        {isPending || isFailed ? (
                                            <Text
                                                className={`font-heading font-black text-lg ${isPending ? 'text-amber-300' : 'text-red-300'}`}
                                            >
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

                                    {/* Delete button — only for own entries */}
                                    {isOwner ? (
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation?.();
                                                setConfirmTarget(item);
                                            }}
                                            style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 12,
                                                backgroundColor: '#fff',
                                                borderWidth: 1,
                                                borderColor: '#fee2e2',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowOpacity: 0.05,
                                                shadowRadius: 2,
                                                elevation: 1,
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Trash2 size={15} color="#F43F5E" />
                                        </TouchableOpacity>
                                    ) : (
                                        /* Vote button — only for other entries */
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
                                                {itemVoteCount}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ConfirmModal
                visible={!!confirmTarget}
                title="Xóa entry"
                message="Bạn có chắc muốn xóa entry này không? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isDestructive
                isLoading={deleteEntryMutation.isPending}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmTarget(null)}
            />
        </>
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
