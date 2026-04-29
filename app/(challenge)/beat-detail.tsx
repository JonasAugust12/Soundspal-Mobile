import React, { useState } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { HeroSection, InfoCard, TopEntries } from '@/components/beatDetail';
import { CommonHeader } from '@/components/common';
import { ScoreDetailModal } from '@/components/leaderboard';
import { useGetBeatById } from '@/hooks/useChallengeApi';
import { type BeatEntry } from '@/types/challenge.type';

export default function BeatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: beatData, isLoading } = useGetBeatById(id);
    const [selectedEntry, setSelectedEntry] = useState<BeatEntry | null>(null);
    const beat = beatData;

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <CommonHeader />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                bounces={false} // Prevents pulling down the image ungracefully
            >
                <HeroSection beat={beat} />
                <InfoCard beat={beat} isLoading={isLoading} />
                <TopEntries beatId={id || ''} onEntryPress={setSelectedEntry} />
            </ScrollView>

            <ScoreDetailModal
                visible={!!selectedEntry}
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
            />
        </View>
    );
}
