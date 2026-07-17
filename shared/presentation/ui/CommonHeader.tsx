import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';

interface CommonHeaderProps {
    showAvatar?: boolean;
    showCreate?: boolean;
}

export function CommonHeader({ showAvatar = true, showCreate = false }: CommonHeaderProps) {
    const router = useRouter();
    const { user } = useAuthStore();

    const avatarUrl = user?.avatar_url;
    const initials = (user?.display_name || user?.username || '?')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

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
                            onPress={() => router.push('/(challenge)/myContent')}
                            style={styles.avatarButton}
                        >
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    {initials ? (
                                        <Text style={styles.avatarInitials}>{initials}</Text>
                                    ) : (
                                        <User size={16} color="#7C3AED" />
                                    )}
                                </View>
                            )}
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
    avatarButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: 12,
        fontWeight: '700',
        color: '#7C3AED',
        letterSpacing: 0.5,
    },
});
