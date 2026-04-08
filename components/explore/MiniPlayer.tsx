import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { PauseCircle } from 'lucide-react-native';

export function MiniPlayer() {
    return (
        <View
            style={styles.container}
            className="absolute bottom-[100px] right-6 p-3 rounded-2xl flex-row items-center gap-4 border border-gray-200"
        >
            <View className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                    source={{
                        uri: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&q=80',
                    }}
                    className="w-full h-full object-cover"
                />
            </View>

            <View className="flex-col">
                <Text
                    className="text-gray-900 text-xs font-bold font-heading w-24"
                    numberOfLines={1}
                >
                    Neon Nightmare
                </Text>

                {/* Audio Visualizer Mock */}
                <View className="flex-row items-end gap-[3px] h-3 mt-1">
                    <View className="w-[3px] bg-primary rounded-full h-full" />
                    <View className="w-[3px] bg-primary rounded-full h-[60%]" />
                    <View className="w-[3px] bg-primary rounded-full h-[80%]" />
                    <View className="w-[3px] bg-primary rounded-full h-[40%]" />
                    <View className="w-[3px] bg-primary rounded-full h-[90%]" />
                    <View className="w-[3px] bg-primary rounded-full h-[50%]" />
                </View>
            </View>

            <TouchableOpacity activeOpacity={0.7} className="ml-2">
                <PauseCircle
                    size={32}
                    color="#7d3bed"
                    fill="#ffffff"
                    strokeWidth={1}
                    opacity={0.9}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        ...Platform.select({
            ios: {
                shadowColor: '#7d3bed',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
        }),
        zIndex: 40,
    },
});
