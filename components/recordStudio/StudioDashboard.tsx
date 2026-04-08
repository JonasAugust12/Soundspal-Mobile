import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { RotateCcw, Check, BarChart2, Clock, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function StudioDashboard() {
    return (
        <View className="px-6 mb-8">
            <View
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                style={styles.cardShadow}
            >
                {/* Sliders Mockup */}
                <View className="flex-row gap-6 mb-8">
                    <View className="flex-1 space-y-2">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-[10px] font-body uppercase tracking-widest text-gray-500 font-bold">
                                Âm lượng Beat
                            </Text>
                            <Text className="text-xs font-mono text-primary font-bold">85%</Text>
                        </View>
                        <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <LinearGradient
                                colors={['#7d3bed', '#f471b7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="h-full w-[85%]"
                            />
                        </View>
                    </View>

                    <View className="flex-1 space-y-2">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-[10px] font-body uppercase tracking-widest text-gray-500 font-bold">
                                Giọng hát
                            </Text>
                            <Text className="text-xs font-mono text-primary-02 font-bold">BẬT</Text>
                        </View>
                        <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <View className="h-full w-[60%] bg-[#f471b7]" />
                        </View>
                    </View>
                </View>

                {/* Main Action Hub */}
                <View className="flex-row items-center justify-between gap-4 mb-8">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100"
                    >
                        <RotateCcw size={24} color="#6b7280" />
                    </TouchableOpacity>

                    <View className="relative flex items-center justify-center">
                        <View className="absolute w-24 h-24 bg-primary/20 rounded-full" />
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={[styles.recordShadow, { borderRadius: 9999 }]}
                        >
                            <LinearGradient
                                colors={['#7d3bed', '#f471b7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ borderRadius: 9999 }}
                                className="w-20 h-20 rounded-full flex items-center justify-center z-10"
                            >
                                {/* Square Stop Icon representation */}
                                <View className="w-8 h-8 bg-white rounded-[4px]" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100"
                    >
                        <Check size={28} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Secondary Controls */}
                <View className="flex-row justify-center gap-10 items-center">
                    <TouchableOpacity className="flex items-center gap-1.5" activeOpacity={0.7}>
                        <BarChart2 size={22} color="#6b7280" />
                        <Text className="text-[10px] uppercase font-bold tracking-widest font-body text-gray-500">
                            Hiệu ứng
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex items-center gap-1.5" activeOpacity={0.7}>
                        <Clock size={22} color="#6b7280" />
                        <Text className="text-[10px] uppercase font-bold tracking-widest font-body text-gray-500">
                            Nhịp độ
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex items-center gap-1.5" activeOpacity={0.7}>
                        <FileText size={22} color="#6b7280" />
                        <Text className="text-[10px] uppercase font-bold tracking-widest font-body text-gray-500">
                            Lời bài hát
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
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    recordShadow: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
});
