import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Music, Compass, Mic, Trophy, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function CustomTabBar() {
    return (
        <View
            style={styles.container}
            className="absolute bottom-0 left-0 right-0 flex-row justify-around items-center px-4 pt-4 pb-8 border-t border-gray-200 rounded-t-[32px]"
        >
            <TouchableOpacity className="items-center justify-center">
                <Music size={24} color="#7d3bed" />
                <Text className="text-primary text-[10px] font-bold font-body uppercase tracking-widest mt-1">
                    Bảng tin
                </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center justify-center opacity-70">
                <Compass size={24} color="#9ca3af" />
                <Text className="text-gray-400 text-[10px] font-bold font-body uppercase tracking-widest mt-1">
                    Khám phá
                </Text>
            </TouchableOpacity>

            {/* Center Mic Button */}
            <View className="relative -top-8">
                <TouchableOpacity activeOpacity={0.8} style={styles.shadowButton}>
                    <LinearGradient
                        colors={['#7d3bed', '#f471b7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-16 h-16 rounded-full items-center justify-center"
                    >
                        <Mic size={28} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

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
    shadowButton: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
});
