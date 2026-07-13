import React from 'react';
import { View, Text } from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import {
    computeProfileCompletion,
    type ProfileCompletionInput,
} from '@/features/profiles/domain/utils/profileCompletion';

interface ProfileCompletionBarProps {
    input: ProfileCompletionInput;
}

export function ProfileCompletionBar({ input }: ProfileCompletionBarProps) {
    const { pct, items } = computeProfileCompletion(input);

    // Ẩn khi đã hoàn thiện 100% (giống web)
    if (pct === 100) return null;

    return (
        <View className="mx-4 mb-4 p-4 rounded-2xl border border-border bg-card">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Hoàn thiện hồ sơ
                </Text>
                <Text className="text-sm font-bold text-purple-600">{pct}%</Text>
            </View>

            {/* Progress bar */}
            <View className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-3">
                <View className="h-full rounded-full bg-purple-600" style={{ width: `${pct}%` }} />
            </View>

            {/* Checklist */}
            <View className="flex-row flex-wrap">
                {items.map((item) => (
                    <View key={item.key} className="w-1/2 flex-row items-center gap-1.5 py-0.5">
                        {item.done ? (
                            <Check size={14} color="#22C55E" />
                        ) : (
                            <Circle size={14} color="#9CA3AF" />
                        )}
                        <Text
                            className={`text-xs ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                            {item.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
