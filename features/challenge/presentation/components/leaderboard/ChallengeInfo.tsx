import React from 'react';
import { View, Text } from 'react-native';
import { Activity } from 'lucide-react-native';
import { type Beat } from '@/features/challenge/domain/entities/challenge.type';

interface ChallengeInfoProps {
    beat?: Beat;
    entryCount?: number;
}

export function ChallengeInfo({ beat, entryCount = 0 }: ChallengeInfoProps) {
    return (
        <View className="mb-8 mt-4">
            <Text className="font-body text-[10px] uppercase tracking-[0.2em] text-[#f471b7] font-bold mb-2">
                Thử thách hiện tại
            </Text>
            <Text className="font-heading text-4xl text-gray-900 font-extrabold tracking-tight mb-4 leading-tight">
                Bảng xếp hạng - {beat?.title || 'Cyberpunk Drift'}
            </Text>

            <View className="flex-row items-center gap-3 p-4 bg-gray-50 rounded-2xl border-l-4 border-primary">
                <Activity size={24} color="#7d3bed" />
                <Text className="text-sm text-gray-600 font-medium font-body flex-1">
                    đã có {entryCount} bài dự thi. Cùng tham gia ngay hôm nay để nhận giải thưởng
                    hấp dẫn!
                </Text>
            </View>
        </View>
    );
}
