import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Music, Compass, Mic, Trophy, User } from 'lucide-react-native';

export function CustomTabBar() {
    return (
        <View
            style={styles.container}
            className="absolute bottom-0 left-0 right-0 flex-row justify-around items-center px-4 pt-4 pb-8 border-t border-gray-200 rounded-t-[32px]"
        >
            <TouchableOpacity className="items-center justify-center opacity-70">
                <Music size={24} color="#9ca3af" />
                <Text className="text-gray-400 text-[10px] font-bold font-body uppercase tracking-widest mt-1">
                    Bảng tin
                </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center justify-center opacity-70">
                <Compass size={24} color="#9ca3af" />
                <Text className="text-gray-400 text-[10px] font-bold font-body uppercase tracking-widest mt-1">
                    Khám phá
                </Text>
            </TouchableOpacity>

            {/* Active Record Tab - Bigger and glowing */}
            <TouchableOpacity className="items-center justify-center" activeOpacity={0.8}>
                <View className="mb-1" style={styles.activeIconGlow}>
                    <Mic size={32} color="#f471b7" fill="#f471b7" />
                </View>
                <Text className="text-[#f471b7] text-[10px] font-black font-body uppercase tracking-widest mt-1">
                    Thu âm
                </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center justify-center opacity-70">
                <Trophy size={24} color="#9ca3af" />
                <Text className="text-gray-400 text-[10px] font-bold font-body uppercase tracking-widest mt-1">
                    Xếp hạng
                </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center justify-center opacity-70">
                <User size={24} color="#9ca3af" />
                <Text className="text-gray-400 text-[10px] font-bold font-body uppercase tracking-widest mt-1">
                    Hồ sơ
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 50,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.05,
                shadowRadius: 16,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    activeIconGlow: {
        ...Platform.select({
            ios: {
                shadowColor: '#f471b7',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            },
        }),
    },
});
