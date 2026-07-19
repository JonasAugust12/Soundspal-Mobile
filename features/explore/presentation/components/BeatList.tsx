import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BeatCard } from './BeatCard';
import { BeatCardSkeleton } from './BeatCardSkeleton';
import {
    useGetBeats,
    useDeleteBeat,
} from '@/features/challenge/presentation/hooks/useChallengeApi';
import { useAudioStore } from '@/features/challenge/presentation/store/audioStore';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { ConfirmModal } from '@/shared/presentation/ui/ConfirmModal';
import { type Beat } from '@/features/challenge/domain/entities/challenge.type';

export function BeatList({ selectedGenre }: { selectedGenre?: string }) {
    const router = useRouter();
    const { user } = useAuthStore();

    const fetchParams = selectedGenre ? { genre: selectedGenre } : {};
    const { data: beatsData, isLoading, isError } = useGetBeats(fetchParams);
    const playBeat = useAudioStore((state) => state.playBeat);
    const deleteBeatMutation = useDeleteBeat();

    const [confirmTarget, setConfirmTarget] = useState<Beat | null>(null);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleDeleteConfirm = async () => {
        if (!confirmTarget) return;
        try {
            await deleteBeatMutation.mutateAsync(confirmTarget.id);
        } finally {
            setConfirmTarget(null);
        }
    };

    if (isLoading) {
        return (
            <View className="mb-24">
                {[1, 2, 3].map((i) => (
                    <BeatCardSkeleton key={i} />
                ))}
            </View>
        );
    }

    const beats = beatsData?.beats || [];

    if (isError) {
        return (
            <View className="mb-24 items-center px-8 py-12">
                <Text className="font-heading font-bold text-gray-900 text-base mb-1">
                    Không tải được danh sách beat
                </Text>
                <Text className="font-body text-gray-500 text-sm text-center">
                    Vui lòng kiểm tra kết nối mạng và thử lại.
                </Text>
            </View>
        );
    }

    if (beats.length === 0) {
        return (
            <View className="mb-24 items-center px-8 py-12">
                <Text className="font-heading font-bold text-gray-900 text-base mb-1">
                    Chưa có beat nào
                </Text>
                <Text className="font-body text-gray-500 text-sm text-center">
                    {selectedGenre
                        ? 'Không có beat nào thuộc thể loại này.'
                        : 'Hãy là người đầu tiên đăng beat cho cộng đồng!'}
                </Text>
            </View>
        );
    }

    return (
        <>
            <View className="mb-24">
                {beats.map((beat) => {
                    const isOwner = !!user?.id && beat.creator_id === user.id;
                    return (
                        <BeatCard
                            key={beat.id}
                            title={beat.title}
                            producer={beat.creator_username || 'Unknown'}
                            bpm={beat.bpm || 120}
                            duration={formatDuration(beat.duration_seconds || 0)}
                            genre={beat.genre || 'Beat'}
                            entries={beat.entry_count?.toString() || '0'}
                            imageUrl={
                                beat.cover_image_url ||
                                'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80'
                            }
                            isHot={(beat.entry_count || 0) > 50}
                            tagColorType="primary"
                            onPress={() =>
                                router.push({
                                    pathname: '/(challenge)/beat-detail',
                                    params: { id: beat.id },
                                })
                            }
                            onPlayAudio={() => playBeat(beat as Beat)}
                            onRecord={() =>
                                router.push({
                                    pathname: '/(challenge)/record',
                                    params: { id: beat.id },
                                })
                            }
                            showDelete={isOwner}
                            onDelete={() => setConfirmTarget(beat)}
                        />
                    );
                })}
            </View>

            <ConfirmModal
                visible={!!confirmTarget}
                title="Xóa beat"
                message={`Bạn có chắc muốn xóa beat "${confirmTarget?.title}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                isDestructive
                isLoading={deleteBeatMutation.isPending}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmTarget(null)}
            />
        </>
    );
}
