import React from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { HeroSection, FilterChips, BeatList, MiniPlayer } from '@/components/explore';
import { CommonHeader } from '@/components/common';

export default function ExploreScreen() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <CommonHeader />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 80,
                    paddingHorizontal: 24,
                    paddingBottom: 100,
                }}
                showsVerticalScrollIndicator={false}
            >
                <HeroSection />
                <FilterChips />
                <BeatList />
            </ScrollView>

            <MiniPlayer />
        </View>
    );
}
