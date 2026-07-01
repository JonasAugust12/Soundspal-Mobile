import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, RotateCcw, Share2, Award } from 'lucide-react-native';
import { CommonHeader } from '@/components/common';
import type { BeatEntry } from '@/types/challenge.type';

export default function ResultScreen() {
    const { data, beatId } = useLocalSearchParams<{ data: string; beatId: string }>();
    const router = useRouter();
    const [entry, setEntry] = useState<BeatEntry | null>(null);

    useEffect(() => {
        try {
            if (data) {
                setEntry(JSON.parse(data));
            }
        } catch (e) {
            console.error('Failed to parse entry data', e);
        }
    }, [data]);

    if (!data) {
        return (
            <View className="flex-1 bg-gray-50">
                <CommonHeader />
                <View
                    className="flex-1 items-center justify-center p-6"
                    style={{ paddingTop: 100 }}
                >
                    <Text className="text-gray-500 font-body text-center mb-4 leading-relaxed">
                        Không tìm thấy dữ liệu kết quả chấm điểm. Vui lòng thử lại.
                    </Text>
                    <TouchableOpacity
                        className="bg-primary px-6 py-3 rounded-full"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-bold font-heading">
                            Quay lại phòng thu
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!entry) return null;

    if (entry.scoring_status === 'pending') {
        return (
            <View className="flex-1 bg-gray-50">
                <CommonHeader />
                <View className="flex-1 p-6" style={{ paddingTop: 100 }}>
                    <View
                        className="bg-white rounded-[32px] p-8 items-center"
                        style={styles.cardShadow}
                    >
                        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                            <ActivityIndicator size={'large'} color="#7d3bed" />
                        </View>
                        <Text className="font-heading text-2xl font-black text-gray-900 mb-3 text-center">
                            Hệ Thống Đang Chấm Điểm
                        </Text>
                        <Text className="text-gray-500 font-body text-center leading-relaxed px-2 mb-8 text-sm">
                            AI đang phân tích cao độ, nhịp độ và cảm xúc trong bản thu của bạn. Quá
                            trình này sẽ mất một lúc.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.btnShadow, { borderRadius: 9999, overflow: 'hidden' }]}
                            className="w-full mb-4"
                            onPress={() =>
                                router.push({
                                    pathname: '/(challenge)/leaderboard',
                                    params: { id: beatId },
                                })
                            }
                        >
                            <LinearGradient
                                colors={['#7d3bed', '#f471b7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    height: 56,
                                    borderRadius: 9999,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                }}
                            >
                                <Trophy size={20} color="white" />
                                <Text className="text-white font-heading font-bold text-base">
                                    Kiểm tra Bảng Xếp Hạng sau
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.back()} className="py-3">
                            <Text className="text-gray-400 font-bold font-body text-sm">
                                Trở về phòng thu
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    const scores = [
        { label: 'Cao Độ', value: entry.pitch_score || 0, color: '#ec4899' },
        { label: 'Nhịp Độ', value: entry.rhythm_score || 0, color: '#8b5cf6' },
        { label: 'Cảm Xúc', value: entry.expression_score || 0, color: '#3b82f6' },
        { label: 'Âm Sắc', value: entry.tone_score || 0, color: '#10b981' },
    ];

    const getGrade = (score: number) => {
        if (score >= 95) return 'S+';
        if (score >= 90) return 'S';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        return 'D';
    };

    return (
        <View className="flex-1 bg-gray-50">
            <CommonHeader />
            <ScrollView
                contentContainerStyle={{ padding: 24, paddingTop: 104, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Score Card */}
                <View
                    style={styles.cardShadow}
                    className="bg-white rounded-[32px] p-8 items-center mb-6"
                >
                    <View className="w-20 h-20 rounded-full bg-[#fdd8e6] items-center justify-center mb-4">
                        <Award size={40} color="#f471b7" />
                    </View>

                    <Text className="font-body text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Xếp Loại
                    </Text>
                    <Text className="font-heading text-6xl font-black text-gray-900 mb-6">
                        {getGrade(entry.total_score)}
                    </Text>

                    <LinearGradient
                        colors={['#7d3bed', '#f471b7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            borderRadius: 16,
                            width: '100%',
                            padding: 24,
                            alignItems: 'center',
                        }}
                    >
                        <Text className="font-body text-white/80 font-bold uppercase tracking-widest text-xs mb-1">
                            Tổng Điểm
                        </Text>
                        <View className="flex-row items-end gap-1">
                            <Text className="font-heading text-5xl font-black text-white">
                                {Math.round(entry.total_score)}
                            </Text>
                            <Text className="font-heading text-xl font-bold text-white/70 mb-2">
                                /100
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Score Breakdown */}
                <View className="mb-8">
                    <Text className="font-heading text-lg font-bold text-gray-900 mb-4 px-2">
                        Chi Tiết Đánh Giá
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        {scores.map((s, idx) => (
                            <View
                                key={idx}
                                className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100"
                                style={styles.smShadow}
                            >
                                <Text className="font-body text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                                    {s.label}
                                </Text>
                                <View className="flex-row items-end gap-1">
                                    <Text
                                        className="font-heading text-2xl font-black text-gray-900"
                                        style={{ color: s.color }}
                                    >
                                        {Math.round(s.value)}
                                    </Text>
                                    <Text className="font-body text-xs font-medium text-gray-400 pb-1">
                                        pt
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Actions */}
                <View className="gap-4 mt-2">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.btnShadow, { borderRadius: 9999, overflow: 'hidden' }]}
                        onPress={() =>
                            router.push({
                                pathname: '/(challenge)/leaderboard',
                                params: { id: beatId },
                            })
                        }
                    >
                        <LinearGradient
                            colors={['#7d3bed', '#f471b7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                height: 64,
                                borderRadius: 9999,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 12,
                            }}
                        >
                            <Trophy size={22} color="white" />
                            <Text className="text-white font-heading font-black text-lg">
                                Xem Bảng Xếp Hạng
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex-1 bg-white h-14 rounded-full flex-row items-center justify-center gap-2 border border-gray-200"
                            style={styles.smShadow}
                            onPress={() => router.back()}
                        >
                            <RotateCcw size={20} color="#4b5563" />
                            <Text className="text-gray-700 font-bold font-body">Thu lại</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex-1 bg-white h-14 rounded-full flex-row items-center justify-center gap-2 border border-gray-200"
                            style={styles.smShadow}
                        >
                            <Share2 size={20} color="#4b5563" />
                            <Text className="text-gray-700 font-bold font-body">Chia sẻ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.05,
                shadowRadius: 24,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    smShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    btnShadow: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        borderRadius: 9999,
    },
});
