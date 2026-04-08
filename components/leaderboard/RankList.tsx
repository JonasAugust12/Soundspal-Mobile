import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ThumbsUp } from 'lucide-react-native';

const REMAINING_RANKS = [
    {
        rank: 4,
        name: 'SynthWave_X',
        entryNum: 849,
        score: 94.1,
        likes: 728,
        avatar: 'https://i.pravatar.cc/150?img=60',
    },
    {
        rank: 5,
        name: 'GlitchPixel',
        entryNum: 1023,
        score: 92.8,
        likes: 651,
        avatar: 'https://i.pravatar.cc/150?img=52',
        highlightLike: true,
    },
    {
        rank: 6,
        name: 'TempoTracer',
        entryNum: 211,
        score: 91.5,
        likes: 502,
        avatar: 'https://i.pravatar.cc/150?img=18',
    },
    {
        rank: 7,
        name: 'Echo_Maniac',
        entryNum: 44,
        score: 89.9,
        likes: 489,
        avatar: 'https://i.pravatar.cc/150?img=47',
    },
];

export function RankList() {
    return (
        <View className="gap-3">
            {REMAINING_RANKS.map((item) => (
                <TouchableOpacity
                    key={item.rank}
                    activeOpacity={0.7}
                    style={styles.card}
                    className="flex-row items-center justify-between p-4 rounded-2xl border-l-[3px] border-l-primary/40 bg-white"
                >
                    <View className="flex-row items-center gap-4">
                        <Text className="w-8 font-heading font-black text-gray-400 text-xl text-center">
                            {item.rank}
                        </Text>

                        <View className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100">
                            <Image source={{ uri: item.avatar }} className="w-full h-full" />
                        </View>

                        <View>
                            <Text className="font-bold text-gray-900 font-heading text-base">
                                {item.name}
                            </Text>
                            <Text className="text-[10px] text-gray-500 font-body uppercase tracking-widest">
                                Bài thi #{item.entryNum}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-6">
                        <View className="items-end">
                            <Text className="font-heading font-black text-2xl text-primary">
                                {item.score}
                            </Text>
                            <Text className="text-[9px] text-[#f471b7] font-bold uppercase tracking-tighter">
                                Điểm AI
                            </Text>
                        </View>

                        <TouchableOpacity
                            className="items-center justify-center pt-1"
                            activeOpacity={0.6}
                        >
                            {item.highlightLike ? (
                                <>
                                    <ThumbsUp size={20} color="#f471b7" fill="#f471b7" />
                                    <Text className="text-[10px] font-black text-[#f471b7] mt-1">
                                        {item.likes}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <ThumbsUp size={20} color="#9ca3af" />
                                    <Text className="text-[10px] font-black text-gray-500 mt-1">
                                        {item.likes}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            ))}

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
