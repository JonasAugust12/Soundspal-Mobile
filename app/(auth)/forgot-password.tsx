import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { ForgotPasswordForm, LogoHeader } from '@/components/auth';
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

                // Navigate to verify reset code page
                router.push({
                    pathname: '/(auth)/verify-reset-code',
                    params: { email: data.email },
                });
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Không thể gửi mã. Vui lòng thử lại.';
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
                {/* Back Button */}
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
                            Quên mật khẩu?
                        </Text>
                        <Text className="text-sm text-center text-gray-600 dark:text-gray-400 w-4/5">
                            Nhập email của bạn để nhận mã đặt lại mật khẩu.
                        </Text>
                    </View>

                    <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
