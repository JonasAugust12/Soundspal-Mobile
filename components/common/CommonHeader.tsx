import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface CommonHeaderProps {
    showSearch?: boolean;
    showAvatar?: boolean;
    showCreate?: boolean;
}

export function CommonHeader({
    showSearch = true,
    showAvatar = true,
    showCreate = false,
}: CommonHeaderProps) {
    const router = useRouter();

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <View className="flex-row justify-between items-center px-6 h-16 w-full">
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
                        <ChevronLeft size={28} color="#374151" />
                    </TouchableOpacity>
                    <Image
                        source={require('@/assets/images/Soundspal-TextLogo.png')}
                        style={{ width: 120, height: 24 }}
                        resizeMode="contain"
                    />
                </View>
                <View className="flex-row items-center gap-4">
                    {showSearch && (
                        <TouchableOpacity activeOpacity={0.7}>
                            <Search size={24} color="#374151" />
                        </TouchableOpacity>
                    )}
                    {showCreate && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push('/(challenge)/create')}
                            className="bg-primary/10 w-8 h-8 rounded-full items-center justify-center mr-1"
                        >
                            <Plus size={20} color="#7d3bed" />
                        </TouchableOpacity>
                    )}
                    {showAvatar && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shadow-sm"
                        >
                            <Image
                                source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
                                className="w-full h-full"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});
