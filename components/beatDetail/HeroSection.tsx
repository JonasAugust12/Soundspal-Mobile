import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Play, Headphones, Mic } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function HeroSection() {
    return (
        <View className="relative w-full aspect-square md:aspect-video overflow-hidden">
            <Image
                source={{
                    uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80',
                }}
                className="w-full h-full object-cover"
            />

            {/* Blend into the white canvas */}
            <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.7)', '#ffffff']}
                className="absolute inset-0"
            />

            <View className="absolute inset-0 items-center justify-center -mt-8">
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="w-20 h-20 rounded-full bg-white/90 border border-white items-center justify-center"
                    style={styles.playShadow}
                >
                    <Play size={40} color="#7d3bed" fill="#7d3bed" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            </View>

            <View className="absolute bottom-12 left-6 flex-row gap-3">
                <View className="bg-white/90 px-4 py-2 rounded-full flex-row items-center gap-2 border border-gray-200">
                    <Headphones size={14} color="#7d3bed" />
                    <Text className="text-[10px] font-bold tracking-widest text-gray-900 font-body">
                        12.4K LƯỢT NGHE
                    </Text>
                </View>
                <View className="bg-white/90 px-4 py-2 rounded-full flex-row items-center gap-2 border border-gray-200">
                    <Mic size={14} color="#f471b7" />
                    <Text className="text-[10px] font-bold tracking-widest text-gray-900 font-body">
                        432 LƯỢT THAM GIA
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    playShadow: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
});
