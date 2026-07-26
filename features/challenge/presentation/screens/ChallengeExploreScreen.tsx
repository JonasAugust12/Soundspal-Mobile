import React, { useState } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import {
    HeroSection,
    FilterChips,
    BeatList,
    MiniPlayer,
} from '@/features/explore/presentation/components';
import { CommonHeader } from '@/shared/presentation/ui';
import { useGetBeats } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { toggleSelectedGenre } from '@/features/challenge/domain/utils/challenge';

export default function ExploreScreen() {
    // Lọc theo nhiều thể loại (OR) — join bằng dấu phẩy khi gọi API.
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // Fetch global beats to find the trending one
    const { data } = useGetBeats({ page_size: 20 });

    const trendingBeat = data?.beats?.reduce((prev, current) => {
        return (prev.entry_count || 0) > (current.entry_count || 0) ? prev : current;
    }, data?.beats[0]);

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <CommonHeader showCreate={true} />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 80,
                    paddingHorizontal: 24,
                    paddingBottom: 100,
                }}
                showsVerticalScrollIndicator={false}
            >
                <HeroSection trendingBeat={trendingBeat} />
                <FilterChips
                    selectedGenres={selectedGenres}
                    onToggleGenre={(name) =>
                        setSelectedGenres((prev) => toggleSelectedGenre(prev, name))
                    }
                    onClear={() => setSelectedGenres([])}
                />
                <BeatList selectedGenres={selectedGenres} />
            </ScrollView>

            <MiniPlayer />
        </View>
    );
}
