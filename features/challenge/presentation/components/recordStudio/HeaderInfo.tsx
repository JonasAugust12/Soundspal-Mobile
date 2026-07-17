import React from 'react';
import { View, Text } from 'react-native';
import { type Beat } from '@/features/challenge/domain/entities/challenge.type';

interface HeaderInfoProps {
    beat?: Beat;
    durationMillis?: number;
    isRecording?: boolean;
}

export function HeaderInfo({ beat, durationMillis = 0, isRecording = false }: HeaderInfoProps) {
    const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
    const minutes = Math.floor(durationMillis / 60000);
    const seconds = Math.floor((durationMillis % 60000) / 1000);
    const ms = Math.floor((durationMillis % 1000) / 10);
    const timeString = `${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;

    return (
        <View className="px-6 mt-8 flex-row justify-between items-start">
            <View className="space-y-1 flex-1 pr-4">
                <Text className="font-body text-[10px] uppercase tracking-widest text-[#f471b7] font-bold">
                    {isRecording ? 'Đang thu âm' : 'Sẵn sàng thu âm'}
                </Text>
                <Text
                    className="font-heading text-3xl text-gray-900 font-extrabold tracking-tight"
                    numberOfLines={1}
                >
                    {beat?.title || 'Midnight Cypher Vol. 4'}
                </Text>
                <Text className="font-body mt-2 text-gray-500 text-sm">
                    Beat: "{beat?.title || 'Neon Rain'}" - {beat?.bpm || 128} BPM
                </Text>
            </View>
            <View
                className={`border px-3 py-1.5 rounded-full flex-row items-center gap-2 ${isRecording ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}
            >
                {isRecording && <View className="w-2 h-2 rounded-full bg-red-500" />}
                <Text
                    className={`font-mono font-bold text-lg ${isRecording ? 'text-red-500' : 'text-gray-500'}`}
                >
                    {timeString}
                </Text>
            </View>
        </View>
    );
}
