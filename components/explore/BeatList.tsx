import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { BeatCard } from './BeatCard';
import { BeatCardSkeleton } from './BeatCardSkeleton';
import { useGetBeats, useDeleteBeat } from '@/hooks/useChallengeApi';
import { useAudioStore } from '@/stores/audioStore';
import { useAuthStore } from '@/stores/authStore';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { type Beat } from '@/types/challenge.type';

const DUMMY_DATA = [
    {
        id: '1',
        title: 'NEON NIGHTMARE',
        producer: 'Ghostface',
        bpm: 145,
        duration: '2:45',
        genre: 'Electric Drill',
        entries: '4.2k',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80',
        isHot: true,
        tagColorType: 'primary' as const,
    },
    {
        id: '2',
        title: 'SYNTHETIC RAIN',
        producer: 'DJ Velocity',
        bpm: 128,
        duration: '3:12',
        genre: 'Future Bass',
        entries: '1.8k',
        imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80',
        isHot: false,
        tagColorType: 'secondary' as const,
    },
    {
        id: '3',
        title: 'BASSOON BLASTER',
        producer: 'Orchestral Chaos',
        bpm: 160,
        duration: '1:55',
        genre: 'Orchestral Trap',
        entries: '8.5k',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        isHot: false,
        tagColorType: 'primary' as const,
    },
    {
        id: '4',
        title: 'GLITCH REALITY',
        producer: 'Pixel Heart',
        bpm: 110,
        duration: '4:20',
        genre: 'Glitchcore',
        entries: '542',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        isHot: false,
        tagColorType: 'tertiary' as const,
    },
];

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

    // Fallback to DUMMY_DATA if API has no beats (app is new) or failed
    if (beats.length === 0 || isError) {
        return (
            <View className="mb-24">
                {DUMMY_DATA.map((beat) => (
                    <BeatCard
                        key={beat.id}
                        title={beat.title}
                        producer={beat.producer}
                        bpm={beat.bpm}
                        duration={beat.duration}
                        genre={beat.genre}
                        entries={beat.entries}
                        imageUrl={beat.imageUrl}
                        isHot={beat.isHot}
                        tagColorType={beat.tagColorType}
                        onPress={() =>
                            router.push({
                                pathname: '/(challenge)/beat-detail',
                                params: { id: beat.id },
                            })
                        }
                        onRecord={() =>
                            router.push({
                                pathname: '/(challenge)/record',
                                params: { id: beat.id },
                            })
                        }
                    />
                ))}
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
