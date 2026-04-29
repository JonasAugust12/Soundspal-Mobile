import React, { useEffect, useState } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
    ChallengeInfo,
    Podium,
    RankList,
    LeaderboardSkeleton,
    ScoreDetailModal,
} from '@/components/leaderboard';
import { CommonHeader } from '@/components/common';
import { useGetBeatById, useGetLeaderboard } from '@/hooks/useChallengeApi';
import { useAudioStore } from '@/stores/audioStore';
import { type BeatEntry } from '@/types/challenge.type';

export default function LeaderboardScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: beatData } = useGetBeatById(id);
    const { data: leaderboardData, isLoading } = useGetLeaderboard(id, 50, 0, true);
    const [selectedEntry, setSelectedEntry] = useState<BeatEntry | null>(null);

    const stopEntry = useAudioStore((s) => s.stopEntry);
    useEffect(() => {
        return () => {
            stopEntry();
        };
    }, [stopEntry]);

    const beat = beatData;
    const entries = leaderboardData?.entries || [];

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <CommonHeader showSearch={false} />

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
