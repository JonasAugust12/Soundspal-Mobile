import React from 'react';
import { View, Text, TouchableOpacity, Keyboard, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShieldCheck, Lock } from 'lucide-react-native';
import { ResetPasswordForm } from '@/components/auth';
import { useResetPassword } from '@/hooks/useAuthApi';
import { useToast } from '@/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { ResetPasswordFormData } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordScreen() {
    const { email, reset_token } = useLocalSearchParams<{ email: string; reset_token: string }>();
    const { mutateAsync: resetPassword, isPending: isLoading } = useResetPassword();
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const handleSubmit = async (data: ResetPasswordFormData) => {
        Keyboard.dismiss();

        try {
            const response = await resetPassword({
                email: email || '',
                new_password: data.newPassword,
                reset_token: reset_token || '',
            });

            if (response.data || response.message) {
                showSuccess(
                    'Đặt lại mật khẩu thành công! 🎉',
                    'Bạn có thể đăng nhập bằng mật khẩu mới.'
                );
                router.replace('/(auth)/login');
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
            showError('Lỗi', errorMessage);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Background Gradient */}
            <LinearGradient
                colors={['#10B981', '#059669', '#34D399']}
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
                    bottomOffset={20}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Section */}
                    <View className="items-center pt-6 pb-10">
                        <View style={styles.iconContainer}>
                            <ShieldCheck size={40} color="#10B981" />
                        </View>
                        <Text className="text-white text-xl font-bold mt-4">Đặt mật khẩu mới</Text>
                        <Text className="text-white/70 text-sm mt-1 text-center px-8">
                            Tạo mật khẩu mạnh để bảo vệ tài khoản
                        </Text>
                    </View>

                    {/* Main Content Card */}
                    <View style={styles.contentCard} className="flex-1 bg-white rounded-t-[32px] px-6 pt-8">
                        {/* Icon */}
                        <View className="items-center mb-6">
                            <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
                                <Lock size={32} color="#10B981" />
                            </View>
                            <Text className="text-lg font-bold text-gray-900 text-center">
                                Nhập mật khẩu mới
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1 text-center max-w-[280px]">
                                Mật khẩu cần có ít nhất 8 ký tự
                            </Text>
                        </View>

                        {/* Reset Password Form */}
                        <ResetPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />

                        {/* Security Tips */}
                        <View className="mt-8 bg-gray-50 rounded-2xl p-4">
                            <Text className="text-xs font-bold text-gray-700 mb-2">
                                💡 Mẹo tạo mật khẩu mạnh:
                            </Text>
                            <View className="gap-1">
                                <Text className="text-xs text-gray-500">• Kết hợp chữ hoa, chữ thường và số</Text>
                                <Text className="text-xs text-gray-500">• Sử dụng ký tự đặc biệt (@, #, $...)</Text>
                                <Text className="text-xs text-gray-500">• Tránh dùng thông tin cá nhân</Text>
                            </View>
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
