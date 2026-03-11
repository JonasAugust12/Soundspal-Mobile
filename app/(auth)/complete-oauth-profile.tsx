import React from 'react';
import { View, Text, Keyboard, Platform, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { CompleteOAuthForm } from '@/components/auth';
import { useCompleteOAuth } from '@/hooks/useAuthApi';
import { useToast } from '@/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { getUserFromToken } from '@/utils/jwt';
import type { UserRole } from '@/types/auth.type';

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

                    showSuccess('Đăng ký thành công! 🎉', 'Chào mừng bạn đến với Soundspal.');
                    router.replace('/(tabs)');
                }
            }
            //eslint-disable-next-line
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Đã xảy ra lỗi. Vui lòng thử lại.';
            showError('Lỗi', errorMessage);
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

            <SafeAreaView className="flex-1">
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
                            Một bước nữa thôi!
                        </Text>
                        <Text className="text-white/70 text-sm mt-1">
                            Hoàn tất thông tin để bắt đầu
                        </Text>
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
                                    Google Sign-In
                                </Text>
                            </View>
                            <Text className="text-xl font-black text-gray-900 text-center">
                                Hoàn tất đăng ký ✨
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1 text-center max-w-[280px]">
                                Chọn username và vai trò của bạn trên Soundspal
                            </Text>
                        </View>

                        {/* Form */}
                        <CompleteOAuthForm onSubmit={handleCompleteProfile} isLoading={isLoading} />

                        {/* Info Box */}
                        <View className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4">
                            <Text className="text-xs font-bold text-gray-700 mb-2">
                                🎵 Về vai trò của bạn
                            </Text>
                            <View className="gap-1.5">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                    <Text className="text-xs text-gray-600">
                                        <Text className="font-semibold">Producer:</Text> Sáng tác,
                                        hòa âm, phối khí
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <View className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    <Text className="text-xs text-gray-600">
                                        <Text className="font-semibold">Singer:</Text> Ca sĩ, nghệ
                                        sĩ biểu diễn
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <View className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                    <Text className="text-xs text-gray-600">
                                        <Text className="font-semibold">Venue:</Text> Địa điểm tổ
                                        chức sự kiện
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Footer */}
                        <View className="items-center mt-auto pb-6">
                            <Text className="text-[10px] text-gray-400 text-center max-w-[260px]">
                                Bạn có thể thay đổi thông tin này sau trong phần cài đặt
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
