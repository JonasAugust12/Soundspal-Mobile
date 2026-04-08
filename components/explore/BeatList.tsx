import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { BeatCard } from './BeatCard';

const DUMMY_DATA = [
    {
        id: '1',
        title: 'NEON NIGHTMARE',
        producer: 'Ghostface',
        bpm: 145,
        duration: '2:45',
        genre: 'Electric Drill',
        entries: '4.2k',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80',
        isHot: true,
        tagColorType: 'primary' as const,
    },
    {
        id: '2',
        title: 'SYNTHETIC RAIN',
        producer: 'DJ Velocity',
        bpm: 128,
        duration: '3:12',
        genre: 'Future Bass',
        entries: '1.8k',
        imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80',
        isHot: false,
        tagColorType: 'secondary' as const,
    },
    {
        id: '3',
        title: 'BASSOON BLASTER',
        producer: 'Orchestral Chaos',
        bpm: 160,
        duration: '1:55',
        genre: 'Orchestral Trap',
        entries: '8.5k',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        isHot: false,
        tagColorType: 'primary' as const,
    },
    {
        id: '4',
        title: 'GLITCH REALITY',
        producer: 'Pixel Heart',
        bpm: 110,
        duration: '4:20',
        genre: 'Glitchcore',
        entries: '542',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        isHot: false,
        tagColorType: 'tertiary' as const,
    },
];

export function BeatList() {
    const router = useRouter();

    return (
        <View className="mb-24">
            {DUMMY_DATA.map((beat) => (
                <BeatCard
                    key={beat.id}
                    title={beat.title}
                    producer={beat.producer}
                    bpm={beat.bpm}
                    duration={beat.duration}
                    genre={beat.genre}
                    entries={beat.entries}
                    imageUrl={beat.imageUrl}
                    isHot={beat.isHot}
                    tagColorType={beat.tagColorType}
                    onPress={() => router.push('/(challenge)/beat-detail')}
                />
            ))}
        </View>
    );
}
