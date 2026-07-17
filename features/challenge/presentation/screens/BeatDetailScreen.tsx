import React, { useState } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
    HeroSection,
    InfoCard,
    TopEntries,
} from '@/features/challenge/presentation/components/beatDetail';
import { CommonHeader } from '@/shared/presentation/ui';
import { ScoreDetailModal } from '@/features/challenge/presentation/components/leaderboard';
import { useGetBeatById } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { type BeatEntry } from '@/features/challenge/domain/entities/challenge.type';

export default function BeatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: beatData, isLoading } = useGetBeatById(id);
    const [selectedEntry, setSelectedEntry] = useState<BeatEntry | null>(null);
    const { user } = useAuthStore();
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
                <TopEntries
                    beatId={id || ''}
                    currentUserId={user?.id}
                    onEntryPress={setSelectedEntry}
                />
            </ScrollView>

            <ScoreDetailModal
                visible={!!selectedEntry}
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
            />
        </View>
    );
}
