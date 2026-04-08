import React from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { HeroSection, InfoCard, TopEntries } from '@/components/beatDetail';
import { CommonHeader } from '@/components/common';

export default function BeatDetailScreen() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <CommonHeader />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                bounces={false} // Prevents pulling down the image ungracefully
            >
                <HeroSection />
                <InfoCard />
                <TopEntries />
            </ScrollView>
        </View>
    );
}
