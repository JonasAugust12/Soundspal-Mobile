import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ThumbsUp } from 'lucide-react-native';
import { type BeatEntry } from '@/types/challenge.type';

interface RankListProps {
    remainingEntries: BeatEntry[];
}

export function RankList({ remainingEntries }: RankListProps) {
    if (!remainingEntries || remainingEntries.length === 0) return null;

    return (
        <View className="gap-3">
            {remainingEntries.map((item, index) => {
                const rank = index + 4;
                const getAvatar = () =>
                    item.id
                        ? `https://api.dicebear.com/7.x/avataaars/png?seed=${item.username}`
                        : 'https://i.pravatar.cc/150';

                return (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        style={styles.card}
                        className="flex-row items-center justify-between p-4 rounded-2xl border-l-[3px] border-l-primary/40 bg-white"
                    >
                        <View className="flex-row items-center gap-4">
                            <Text className="w-8 font-heading font-black text-gray-400 text-xl text-center">
                                {rank}
                            </Text>

                            <View className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100">
                                <Image source={{ uri: getAvatar() }} className="w-full h-full" />
                            </View>

                            <View>
                                <Text className="font-bold text-gray-900 font-heading text-base">
                                    {item.display_name || item.username}
                                </Text>
                                <Text className="text-[10px] text-gray-500 font-body uppercase tracking-widest">
                                    KHỚP {Number(item.rhythm_score).toFixed(0)}%
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-6">
                            <View className="items-end">
                                <Text className="font-heading font-black text-2xl text-primary">
                                    {Number(item.total_score).toFixed(1)}
                                </Text>
                                <Text className="text-[9px] text-[#f471b7] font-bold uppercase tracking-tighter">
                                    Điểm AI
                                </Text>
                            </View>

                            <TouchableOpacity
                                className="items-center justify-center pt-1"
                                activeOpacity={0.6}
                            >
                                <ThumbsUp size={20} color="#9ca3af" />
                                <Text className="text-[10px] font-black text-gray-500 mt-1">
                                    {item.vote_count}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity
                activeOpacity={0.7}
                className="mt-6 mb-10 items-center justify-center p-4 border border-gray-200 rounded-full bg-gray-50"
            >
                <Text className="text-gray-600 font-bold text-xs uppercase tracking-widest font-heading">
                    Tải thêm xếp hạng
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: '#f3f4f6',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
