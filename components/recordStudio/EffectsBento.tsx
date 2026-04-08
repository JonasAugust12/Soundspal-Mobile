import React from 'react';
import { View, Text } from 'react-native';
import { Wand2, Ear } from 'lucide-react-native';

export function EffectsBento() {
    return (
        <View className="px-6 flex-row gap-4">
            <View className="flex-1 bg-gray-50 p-4 rounded-2xl flex-row items-center gap-3 border border-gray-100">
                <View className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wand2 size={20} color="#7d3bed" />
                </View>
                <View>
                    <Text className="text-xs font-bold font-body uppercase tracking-wide text-gray-900">
                        Auto-Tune
                    </Text>
                    <Text className="text-[10px] text-gray-500 font-body">Hard Style</Text>
                </View>
            </View>

            <View className="flex-1 bg-gray-50 p-4 rounded-2xl flex-row items-center gap-3 border border-gray-100">
                <View className="w-10 h-10 rounded-full bg-[#f471b7]/10 flex items-center justify-center">
                    <Ear size={20} color="#f471b7" />
                </View>
                <View>
                    <Text className="text-xs font-bold font-body uppercase tracking-wide text-gray-900">
                        Reverb
                    </Text>
                    <Text className="text-[10px] text-gray-500 font-body">Large Hall</Text>
                </View>
            </View>
        </View>
    );
}
