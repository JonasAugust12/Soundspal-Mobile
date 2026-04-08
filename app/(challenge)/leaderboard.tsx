import React from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { ChallengeInfo, Podium, RankList } from '@/components/leaderboard';
import { CommonHeader } from '@/components/common';

export default function LeaderboardScreen() {
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
                <ChallengeInfo />
                <Podium />
                <RankList />
            </ScrollView>
        </View>
    );
}
