import React, { useEffect, useState } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
    ChallengeInfo,
    Podium,
    RankList,
    LeaderboardSkeleton,
    ScoreDetailModal,
} from '@/features/challenge/presentation/components/leaderboard';
import { CommonHeader } from '@/shared/presentation/ui';
import {
    useGetBeatById,
    useGetLeaderboard,
} from '@/features/challenge/presentation/hooks/useChallengeApi';
import { useAudioStore } from '@/features/challenge/presentation/store/audioStore';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { filterLeaderboardEntries } from '@/features/challenge/domain/utils/challenge';
import { type BeatEntry } from '@/features/challenge/domain/entities/challenge.type';

export default function LeaderboardScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: beatData } = useGetBeatById(id);
    const { data: leaderboardData, isLoading } = useGetLeaderboard(id, 50, 0, true);
    const [selectedEntry, setSelectedEntry] = useState<BeatEntry | null>(null);
    const { user } = useAuthStore();

    const stopEntry = useAudioStore((s) => s.stopEntry);
    useEffect(() => {
        return () => {
            stopEntry();
        };
    }, [stopEntry]);

    const beat = beatData;
    // Ẩn entry chấm điểm lỗi (scoring_status === 'failed') khỏi BXH — giống web.
    const entries = filterLeaderboardEntries(leaderboardData?.entries || []);

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <CommonHeader />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 80,
                    paddingHorizontal: 20,
                    paddingBottom: 100,
                }}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <LeaderboardSkeleton />
                ) : (
                    <>
                        <ChallengeInfo beat={beat} entryCount={entries.length} />
                        <Podium topEntries={entries.slice(0, 3)} onEntryPress={setSelectedEntry} />
                        <RankList
                            remainingEntries={entries.slice(3)}
                            onEntryPress={setSelectedEntry}
                            currentUserId={user?.id}
                        />
                    </>
                )}
            </ScrollView>

            <ScoreDetailModal
                visible={!!selectedEntry}
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
            />
        </View>
    );
}
