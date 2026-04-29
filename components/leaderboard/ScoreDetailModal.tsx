import React from 'react';
import {
    View,
    Text,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { X, Mic2, Music, Waves, Zap, Activity, Quote } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { type BeatEntry } from '@/types/challenge.type';

interface ScoreDetailModalProps {
    visible: boolean;
    entry: BeatEntry | null;
    onClose: () => void;
}

export function ScoreDetailModal({ visible, entry, onClose }: ScoreDetailModalProps) {
    if (!entry) return null;

    const scores = [
        { label: 'Cao độ', value: entry.pitch_score, icon: Mic2, color: '#7d3bed' },
        { label: 'Nhịp điệu', value: entry.rhythm_score, icon: Music, color: '#f471b7' },
        { label: 'Âm sắc', value: entry.tone_score, icon: Waves, color: '#3b82f6' },
        { label: 'Biểu cảm', value: entry.expression_score, icon: Zap, color: '#f59e0b' },
        { label: 'Độ ổn định', value: entry.stability_score, icon: Activity, color: '#10b981' },
    ];

    const getAvatar = (item: BeatEntry) =>
        item.avatar_url || `https://api.dicebear.com/7.x/avataaars/png?seed=${item.username}`;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 justify-end">
                <View
                    style={styles.modalContainer}
                    className="bg-white rounded-t-[40px] overflow-hidden max-h-[90%]"
                >
                    {/* Header Gradient */}
                    <LinearGradient
                        colors={['#7d3bed', '#f471b7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="pt-10 pb-20 items-center px-6"
                    >
                        <TouchableOpacity
                            onPress={onClose}
                            className="absolute top-12 right-6 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        >
                            <X size={20} color="white" />
                        </TouchableOpacity>

                        <View className="w-24 h-24 rounded-full border-4 border-white/30 p-1 mb-4">
                            <Image
                                source={{ uri: getAvatar(entry) }}
                                className="w-full h-full rounded-full bg-white/10"
                            />
                        </View>

                        <Text className="text-white font-heading text-2xl font-black mb-1 text-center">
                            {entry.display_name || entry.username}
                        </Text>
                        <Text className="text-white/70 font-body text-xs uppercase tracking-widest font-bold">
                            Kết quả đánh giá AI
                        </Text>
                    </LinearGradient>

                    {/* Score Card */}
                    <View className="px-6 -mt-12">
                        <View
                            style={styles.scoreCard}
                            className="bg-white rounded-3xl p-6 items-center border border-gray-100"
                        >
                            <Text className="text-gray-400 font-body text-[10px] uppercase font-black tracking-widest mb-1">
                                Tổng điểm
                            </Text>
                            <Text className="text-6xl font-heading font-black text-primary">
                                {Number(entry.total_score).toFixed(1)}
                            </Text>
                            <View className="h-1 w-12 bg-primary/20 rounded-full mt-2" />
                        </View>
                    </View>

                    <ScrollView
                        className="px-6 pt-6"
                        contentContainerStyle={{ paddingBottom: 60 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Metrics Breakdown */}
                        <Text className="font-heading text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                            Chi tiết kỹ thuật
                        </Text>

                        <View className="gap-5 mb-8">
                            {scores.map((score, index) => (
                                <View key={index}>
                                    <View className="flex-row justify-between items-end mb-2 px-1">
                                        <View className="flex-row items-center gap-2">
                                            <score.icon size={14} color={score.color} />
                                            <Text className="font-body font-bold text-gray-700 text-xs">
                                                {score.label}
                                            </Text>
                                        </View>
                                        <Text
                                            style={{ color: score.color }}
                                            className="font-heading font-black text-sm"
                                        >
                                            {Number(score.value).toFixed(1)}%
                                        </Text>
                                    </View>
                                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <View
                                            style={{
                                                width: `${score.value}%`,
                                                backgroundColor: score.color,
                                            }}
                                            className="h-full rounded-full"
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* AI Explanation */}
                        {entry.explanation && (
                            <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <Quote size={18} color="#7d3bed" fill="#7d3bed" opacity={0.2} />
                                    <Text className="font-heading text-sm font-black text-gray-900">
                                        Phân tích từ AI
                                    </Text>
                                </View>
                                <Text className="text-gray-600 font-body text-sm leading-6 italic">
                                    "{entry.explanation}"
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    scoreCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#7d3bed',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
        }),
    },
});
