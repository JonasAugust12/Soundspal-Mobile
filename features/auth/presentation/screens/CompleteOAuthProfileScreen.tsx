import React from 'react';
import { View, Text, Keyboard, Platform, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { CompleteOAuthForm } from '@/features/auth/presentation/components';
import { useCompleteOAuth } from '@/features/auth/presentation/hooks/useAuthApi';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { getUserFromToken } from '@/shared/utils/jwt';
import type { UserRole } from '@/features/auth/domain/entities/auth.type';
import {
    AUTH_OAUTH_UI,
    AuthSuccessToast,
    AuthToastTitle,
} from '@/features/auth/domain/constants/authMessages';
import { AuthErrorContext } from '@/features/auth/domain/constants/authApiErrorCode';
import { resolveAuthErrorMessage } from '@/features/auth/domain/utils/resolveAuthErrorMessage';

export default function CompleteOAuthProfileScreen() {
    const { registration_token } = useLocalSearchParams<{ registration_token: string }>();
    const { mutateAsync: completeOAuth, isPending: isLoading } = useCompleteOAuth();
    const { showSuccess, showError } = useToast();
    const router = useRouter();
    const { setCredentials } = useAuthStore();

    const handleCompleteProfile = async (data: { username: string; role: UserRole }) => {
        Keyboard.dismiss();

        try {
            const response = await completeOAuth({
                registration_token: registration_token!,
                username: data.username.trim(),
                role: data.role,
            });

            if (response.data?.access_token) {
                const userInfo = getUserFromToken(response.data.access_token);

                if (userInfo) {
                    setCredentials({
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        user: {
                            id: userInfo.id,
                            email: userInfo.email,
                            role: userInfo.role,
                            is_verified: userInfo.is_verified,
                            username: userInfo.username,
                            avatar_url: userInfo.avatar_url,
                            display_name: userInfo.display_name,
                        },
                    });

                    showSuccess(AuthSuccessToast.RegisterTitle, AuthSuccessToast.OAuthCompleteBody);
                    router.replace('/(tabs)');
                }
            }
        } catch (error: unknown) {
            showError(
                AuthToastTitle.Error,
                resolveAuthErrorMessage(error, AuthErrorContext.CompleteOAuth),
            );
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Background Gradient - Pink/Purple */}
            <LinearGradient
                colors={['#EC4899', '#A855F7', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            >
                <View style={styles.circle1} />
                <View style={styles.circle2} />
                <View style={styles.circle3} />
            </LinearGradient>

            <SafeAreaView className="flex-1" edges={SCREEN_SAFE_AREA_EDGES}>
                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    bottomOffset={20}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Section */}
                    <View className="items-center pt-8 pb-10">
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/Soundspal-Logo.png')}
                                style={{ width: 60, height: 60 }}
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-white text-xl font-bold mt-4">
                            {AUTH_OAUTH_UI.header}
                        </Text>
                        <Text className="text-white/70 text-sm mt-1">{AUTH_OAUTH_UI.subtitle}</Text>
                    </View>

                    {/* Main Content Card */}
                    <View
                        style={styles.contentCard}
                        className="flex-1 bg-white rounded-t-[32px] px-6 pt-8"
                    >
                        {/* Header */}
                        <View className="items-center mb-6">
                            <View className="flex-row items-center gap-2 bg-pink-50 px-4 py-2 rounded-full mb-4">
                                <Sparkles size={16} color="#EC4899" />
                                <Text className="text-pink-600 font-semibold text-sm">
                                    {AUTH_OAUTH_UI.providerBadge}
                                </Text>
                            </View>
                            <Text className="text-xl font-black text-gray-900 text-center">
                                {AUTH_OAUTH_UI.title}
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1 text-center max-w-[280px]">
                                {AUTH_OAUTH_UI.formSubtitle}
                            </Text>
                        </View>

                        {/* Form */}
                        <CompleteOAuthForm onSubmit={handleCompleteProfile} isLoading={isLoading} />

                        {/* Info Box */}
                        <View className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4">
                            <Text className="text-xs font-bold text-gray-700 mb-2">
                                {AUTH_OAUTH_UI.rolesTitle}
                            </Text>
                            <View className="gap-1.5">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                    <Text className="text-xs text-gray-600">
                                        <Text className="font-semibold">Nhà sản xuất:</Text>{' '}
                                        {AUTH_OAUTH_UI.producerDesc}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <View className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    <Text className="text-xs text-gray-600">
                                        <Text className="font-semibold">Ca sĩ:</Text>{' '}
                                        {AUTH_OAUTH_UI.singerDesc}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <View className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                    <Text className="text-xs text-gray-600">
                                        <Text className="font-semibold">Nhà tuyển dụng:</Text>{' '}
                                        {AUTH_OAUTH_UI.venueDesc}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Footer */}
                        <View className="items-center mt-auto pb-6">
                            <Text className="text-[10px] text-gray-400 text-center max-w-[260px]">
                                {AUTH_OAUTH_UI.footer}
                            </Text>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    circle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    circle2: {
        position: 'absolute',
        top: 80,
        left: -20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    circle3: {
        position: 'absolute',
        bottom: 20,
        right: 40,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    contentCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
});
