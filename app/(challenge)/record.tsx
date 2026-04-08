import React from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import {
    HeaderInfo,
    WaveformCanvas,
    StudioDashboard,
    EffectsBento,
} from '@/components/recordStudio';
import { CommonHeader } from '@/components/common';

export default function RecordStudioScreen() {
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
                <HeaderInfo />
                <WaveformCanvas />
                <StudioDashboard />
                <EffectsBento />
            </ScrollView>
        </View>
    );
}
