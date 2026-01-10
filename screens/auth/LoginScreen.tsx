import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm, LogoHeader } from '@/components/auth';
import { useLogin } from '@/hooks/useAuthApi';
import type { LoginFormData } from '@/components/auth/LoginForm';

export default function LoginScreen() {
    const { mutateAsync: login, isPending: isLoading } = useLogin();

    const handleLogin = async (data: LoginFormData) => {
        Keyboard.dismiss();

        try {
            const response = await login(data);

            if (response.data?.access_token) {
                // Navigation will be handled by auth state change
                console.log('Login successful');
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Đã xảy ra lỗi. Vui lòng thử lại.';

            console.error('Login failed:', errorMessage);
            // TODO: Show toast/alert
        }
    };

    const handleGoogleLogin = async () => {
        // TODO: Implement Google OAuth
        console.log('Google login not implemented yet');
    };

    const handleForgotPassword = () => {
        // TODO: Navigate to forgot password screen
        console.log('Navigate to forgot password');
    };

    const handleRegister = () => {
        // TODO: Navigate to register screen
        console.log('Navigate to register');
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView
                contentContainerClassName="flex-grow justify-center p-6"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center gap-6">
                    <LogoHeader />

                    <View className="items-center gap-1 w-full">
                        <Text className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
                            Chào mừng trở lại
                        </Text>
                        <Text className="text-sm text-center text-gray-600 dark:text-gray-400">
                            Đăng nhập để tiếp tục
                        </Text>
                    </View>

                    <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

                    <TouchableOpacity onPress={handleForgotPassword}>
                        <Text className="text-sm text-purple-600 font-medium">
                            Quên mật khẩu?
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center w-full gap-4 my-4">
                        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                        <Text className="text-sm text-gray-500 dark:text-gray-400">HOẶC</Text>
                        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                    </View>

                    <TouchableOpacity
                        onPress={handleGoogleLogin}
                        className="w-full flex-row items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                        <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                            Đăng nhập với Google
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-2 mt-4">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                            Chưa có tài khoản?
                        </Text>
                        <TouchableOpacity onPress={handleRegister}>
                            <Text className="text-sm font-semibold text-purple-600">
                                Đăng ký ngay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
