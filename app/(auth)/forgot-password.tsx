import React from 'react';
import { View, Text, TouchableOpacity, Keyboard, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Mail, KeyRound } from 'lucide-react-native';
import { ForgotPasswordForm } from '@/components/auth';
import { useRequestPasswordReset } from '@/hooks/useAuthApi';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'expo-router';
import type { ForgotPasswordFormData } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordScreen() {
    const { mutateAsync: requestPasswordReset, isPending: isLoading } = useRequestPasswordReset();
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const handleSubmit = async (data: ForgotPasswordFormData) => {
        Keyboard.dismiss();

        try {
            const response = await requestPasswordReset(data);

            if (response.data || response.message) {
                showSuccess('Đã gửi mã! 📧', 'Vui lòng kiểm tra email để nhận mã xác thực.');

                router.push({
                    pathname: '/(auth)/verify-reset-code',
                    params: { email: data.email },
                });
            }
            //eslint-disable-next-line
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Không thể gửi mã. Vui lòng thử lại.';
            showError('Lỗi', errorMessage);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Background Gradient */}
            <LinearGradient
                colors={['#F59E0B', '#F97316', '#FB923C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            >
                {/* Decorative Circles */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />
            </LinearGradient>

            <SafeAreaView className="flex-1">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center gap-1 px-4 pt-2"
                >
                    <ChevronLeft size={24} color="#FFFFFF" />
                    <Text className="text-white font-medium">Quay lại</Text>
                </TouchableOpacity>

                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    bottomOffset={100}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Section */}
                    <View className="items-center pt-6 pb-10">
                        <View style={styles.iconContainer}>
                            <KeyRound size={40} color="#F59E0B" />
                        </View>
                        <Text className="text-white text-xl font-bold mt-4">Quên mật khẩu?</Text>
                        <Text className="text-white/70 text-sm mt-1 text-center px-8">
                            Đừng lo, chúng tôi sẽ gửi mã xác thực qua email
                        </Text>
                    </View>

                    {/* Main Content Card */}
                    <View
                        style={styles.contentCard}
                        className="flex-1 bg-white rounded-t-[32px] px-6 pt-8"
                    >
                        {/* Icon */}
                        <View className="items-center mb-6">
                            <View className="w-16 h-16 rounded-full bg-orange-50 items-center justify-center mb-4">
                                <Mail size={32} color="#F59E0B" />
                            </View>
                            <Text className="text-lg font-bold text-gray-900 text-center">
                                Nhập email của bạn
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1 text-center max-w-[280px]">
                                Chúng tôi sẽ gửi mã 6 số để xác thực tài khoản
                            </Text>
                        </View>

                        {/* Forgot Password Form */}
                        <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />

                        {/* Back to Login */}
                        <View className="flex-row items-center justify-center gap-1 mt-8">
                            <Text className="text-sm text-gray-500">Nhớ mật khẩu rồi?</Text>
                            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                                <Text className="text-sm font-bold text-orange-600">Đăng nhập</Text>
                            </TouchableOpacity>
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
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    circle2: {
        position: 'absolute',
        top: 100,
        left: -20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
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
