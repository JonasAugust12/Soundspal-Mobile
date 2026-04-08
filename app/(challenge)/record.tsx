import React from 'react';
import { View, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetBeatById } from '@/hooks/useChallengeApi';
import {
    HeaderInfo,
    WaveformCanvas,
    StudioDashboard,
    EffectsBento,
} from '@/components/recordStudio';
import { CommonHeader } from '@/components/common';

export default function RecordStudioScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: beatData, isLoading } = useGetBeatById(id);
    const beat = beatData;

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <CommonHeader />

            <ScrollView
                contentContainerStyle={{ paddingTop: 64, paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                className="flex-1"
            >
                {isLoading ? (
                    <View className="flex-1 items-center justify-center pt-20">
                        <ActivityIndicator size="large" color="#7d3bed" />
                    </View>
                ) : (
                    <>
                        <HeaderInfo beat={beat} />
                        <WaveformCanvas />
                        <StudioDashboard beatId={id} />
                        <EffectsBento />
                    </>
                )}
            </ScrollView>
        </View>
    );
}
