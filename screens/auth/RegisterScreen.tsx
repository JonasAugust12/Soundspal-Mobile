import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegisterForm, LogoHeader } from '@/components/auth';
import { useSignup } from '@/hooks/useAuthApi';
import type { RegisterFormData } from '@/components/auth/RegisterForm';

export default function RegisterScreen() {
    const { mutateAsync: signup, isPending: isLoading } = useSignup();

    const handleRegister = async (data: RegisterFormData) => {
        Keyboard.dismiss();

        try {
            const response = await signup({
                display_name: data.display_name,
                username: data.username,
                email: data.email,
                password: data.password,
                role: data.role,
            });

            if (response.data) {
                // TODO: Navigate to email verification screen
                console.log('Registration successful, verify email');
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Đã xảy ra lỗi. Vui lòng thử lại.';

            console.error('Registration failed:', errorMessage);
            // TODO: Show toast/alert
        }
    };

    const handleGoogleSignup = async () => {
        // TODO: Implement Google OAuth
        console.log('Google signup not implemented yet');
    };

    const handleLogin = () => {
        // TODO: Navigate to login screen
        console.log('Navigate to login');
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView
                contentContainerClassName="flex-grow justify-center p-6"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center gap-6 py-8">
                    <LogoHeader />

                    <View className="items-center gap-1 w-full">
                        <Text className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
                            Tạo tài khoản mới
                        </Text>
                        <Text className="text-sm text-center text-gray-600 dark:text-gray-400">
                            Đăng ký để bắt đầu
                        </Text>
                    </View>

                    <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

                    <View className="flex-row items-center w-full gap-4 my-4">
                        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                        <Text className="text-sm text-gray-500 dark:text-gray-400">HOẶC</Text>
                        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                    </View>

                    <TouchableOpacity
                        onPress={handleGoogleSignup}
                        className="w-full flex-row items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                        <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                            Đăng ký với Google
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-2 mt-4">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                            Đã có tài khoản?
                        </Text>
                        <TouchableOpacity onPress={handleLogin}>
                            <Text className="text-sm font-semibold text-purple-600">
                                Đăng nhập ngay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
