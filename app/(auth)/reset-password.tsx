import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { ResetPasswordForm, LogoHeader } from '@/components/auth';
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
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView
                contentContainerClassName="flex-grow p-6"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mb-6"
                >
                    <View className="text-gray-600 dark:text-gray-400">
                        <ArrowLeft size={24} />
                    </View>
                    <Text className="ml-2 text-base text-gray-600 dark:text-gray-400">
                        Quay lại
                    </Text>
                </TouchableOpacity>

                <View className="items-center gap-6 mt-8">
                    <LogoHeader />

                    <View className="items-center gap-2 w-full">
                        <Text className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
                            Đặt lại mật khẩu
                        </Text>
                        <Text className="text-sm text-center text-gray-600 dark:text-gray-400 w-4/5">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </Text>
                    </View>

                    <ResetPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
