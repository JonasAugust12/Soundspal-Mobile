import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Mic, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Beat } from '@/features/challenge/domain/entities/challenge.type';

interface InfoCardProps {
    beat?: Beat;
    isLoading?: boolean;
}

export function InfoCard({ beat, isLoading }: InfoCardProps) {
    const router = useRouter();

    if (isLoading || !beat) {
        return (
            <View style={styles.cardShadow} className="px-5 -mt-6 relative z-10 w-full mb-10">
                <View className="bg-white rounded-[32px] p-6 border border-gray-100">
                    {/* Header Info Skeleton */}
                    <View className="mb-6">
                        <View className="w-1/3 h-3 bg-gray-200 rounded-full mb-3 animate-pulse" />
                        <View className="w-3/4 h-8 bg-gray-200 rounded-xl mb-4 animate-pulse" />
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                            <View className="w-1/2 h-4 bg-gray-200 rounded-full animate-pulse" />
                        </View>
                    </View>

                    {/* Detail Grid Skeleton */}
                    <View className="flex-row gap-3 mb-8">
                        <View className="flex-1 bg-gray-50 p-4 rounded-2xl border-l-[4px] border-l-gray-200 justify-center min-h-[80px]">
                            <View className="w-16 h-3 bg-gray-200 rounded-full mb-2 animate-pulse" />
                            <View className="w-20 h-8 bg-gray-200 rounded-xl animate-pulse" />
                        </View>
                        <View className="flex-1 bg-gray-50 p-4 rounded-2xl border-l-[4px] border-l-gray-200 justify-center min-h-[80px]">
                            <View className="w-16 h-3 bg-gray-200 rounded-full mb-2 animate-pulse" />
                            <View className="w-20 h-8 bg-gray-200 rounded-xl animate-pulse" />
                        </View>
                    </View>

                    {/* Description Skeleton */}
                    <View className="space-y-4 mb-8">
                        <View className="w-24 h-5 bg-gray-200 rounded-full mb-3 animate-pulse" />
                        <View className="w-full h-4 bg-gray-200 rounded-full mb-2 animate-pulse" />
                        <View className="w-5/6 h-4 bg-gray-200 rounded-full mb-4 animate-pulse" />
                        <View className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
                    </View>

                    {/* Waveform Mock Skeleton */}
                    <View className="bg-gray-50 rounded-2xl p-4 mb-8 h-20 flex-row items-center justify-between gap-1 overflow-hidden">
                        {[
                            'h-4',
                            'h-8',
                            'h-12',
                            'h-6',
                            'h-10',
                            'h-14',
                            'h-10',
                            'h-6',
                            'h-12',
                            'h-8',
                            'h-14',
                            'h-10',
                            'h-4',
                            'h-8',
                            'h-12',
                            'h-6',
                            'h-10',
                            'h-14',
                            'h-10',
                            'h-6',
                            'h-12',
                        ].map((h, i) => (
                            <View
                                key={i}
                                className={`${h} w-1.5 bg-gray-200 rounded-full animate-pulse`}
                            />
                        ))}
                    </View>

                    {/* Actions Skeleton */}
                    <View className="gap-4">
                        <View className="h-16 bg-gray-200 rounded-full w-full animate-pulse" />
                        <View className="h-14 bg-gray-100 rounded-full w-full border border-gray-200 animate-pulse" />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.cardShadow} className="px-5 -mt-6 relative z-10 w-full mb-10">
            <View className="bg-white rounded-[32px] p-6 border border-gray-100">
                {/* Header Info */}
                <View className="mb-6">
                    <Text className="font-body text-primary text-[10px] uppercase tracking-[0.2em] font-bold mb-1">
                        Sản phẩm nổi bật
                    </Text>
                    <Text
                        className="font-heading text-4xl font-black tracking-tight leading-tight mb-3 text-gray-900"
                        numberOfLines={2}
                        adjustsFontSizeToFit
                    >
                        {beat?.title || 'NEON ECLIPSE'}
                    </Text>
                    <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                            <Image
                                source={{
                                    uri:
                                        beat?.creator_avatar_url ||
                                        'https://api.dicebear.com/7.x/avataaars/png?seed=' +
                                            (beat?.creator_username || 'creator'),
                                }}
                                className="w-full h-full"
                            />
                        </View>
                        <Text
                            className="font-body text-gray-500 text-sm font-medium flex-1"
                            numberOfLines={1}
                        >
                            Sản xuất bởi{' '}
                            <Text className="text-gray-900 font-bold">
                                {beat?.creator_username || 'VNDR_WAVE'}
                            </Text>
                        </Text>
                    </View>
                </View>

                {/* Detail Grid */}
                <View className="flex-row gap-3 mb-8">
                    <View className="flex-1 bg-gray-50 p-4 rounded-2xl border-l-[4px] border-l-primary justify-center min-h-[80px]">
                        <Text className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1 font-body">
                            Nhịp độ
                        </Text>
                        <View className="flex-row items-end gap-1 flex-wrap">
                            <Text
                                className="text-2xl font-heading font-black text-gray-900"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {beat?.bpm || 142}
                            </Text>
                            <Text className="text-[10px] font-bold text-gray-500 pb-1 font-body">
                                BPM
                            </Text>
                        </View>
                    </View>
                    <View className="flex-1 bg-gray-50 p-4 rounded-2xl border-l-[4px] border-l-[#f471b7] justify-center min-h-[80px]">
                        <Text className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1 font-body">
                            Khóa
                        </Text>
                        <View className="flex-row items-end gap-1">
                            <Text
                                className="text-2xl font-heading font-black text-gray-900"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {beat?.key_signature || 'Cm'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View className="space-y-4 mb-8">
                    <Text className="font-heading text-lg font-bold text-gray-900 mb-2">
                        Về Beat này
                    </Text>
                    <Text className="text-gray-600 leading-relaxed text-sm font-body mb-3">
                        {beat?.description ||
                            'Một bản trap mang đậm chất điện ảnh với dải synth mượt mà và tiếng 808 mạnh mẽ...'}
                    </Text>
                    <View className="flex-row gap-2">
                        <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                            <Text className="text-[10px] font-bold text-gray-700 uppercase tracking-wider font-body">
                                #{beat?.genre?.toUpperCase() || 'DARK_TRAP'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Waveform Mock (Simplified for native) */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-8 h-20 flex-row items-center justify-between gap-1 overflow-hidden">
                    <View className="h-4 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-8 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-12 w-1.5 bg-primary rounded-full" />
                    <View className="h-6 w-1.5 bg-primary rounded-full" />
                    <View className="h-10 w-1.5 bg-primary rounded-full" />
                    <View className="h-14 w-1.5 bg-primary rounded-full" />
                    <View className="h-10 w-1.5 bg-primary rounded-full" />
                    <View className="h-6 w-1.5 bg-primary rounded-full" />
                    <View className="h-12 w-1.5 bg-primary rounded-full" />
                    <View className="h-8 w-1.5 bg-[#f471b7] rounded-full" />
                    <View className="h-14 w-1.5 bg-[#f471b7] rounded-full" />
                    <View className="h-10 w-1.5 bg-[#f471b7] rounded-full" />
                    <View className="h-4 w-1.5 bg-[#f471b7] rounded-full" />
                    <View className="h-8 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-12 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-6 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-10 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-14 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-10 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-6 w-1.5 bg-gray-300 rounded-full" />
                    <View className="h-12 w-1.5 bg-gray-300 rounded-full" />
                </View>

                {/* Actions */}
                <View className="gap-4">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.actionShadow, { borderRadius: 9999 }]}
                        onPress={() =>
                            router.push({
                                pathname: '/(challenge)/record',
                                params: { id: beat?.id },
                            })
                        }
                    >
                        <LinearGradient
                            colors={['#7d3bed', '#f471b7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 9999 }}
                            className="h-16 rounded-full flex-row items-center justify-center gap-3"
                        >
                            <Mic size={24} color="white" fill="white" />
                            <Text className="text-white font-heading font-black text-lg">
                                Thu âm ngay
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="bg-primary/5 h-14 rounded-full flex-row items-center justify-center gap-3 border border-primary/20"
                        onPress={() =>
                            router.push({
                                pathname: '/(challenge)/leaderboard',
                                params: { id: beat?.id },
                            })
                        }
                    >
                        <Trophy size={20} color="#7d3bed" />
                        <Text className="text-primary font-heading font-bold text-base">
                            Bảng xếp hạng
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 30,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    actionShadow: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
});
