import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Keyboard, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm, LogoHeader } from '@/components/auth';
import { useLogin } from '@/hooks/useAuthApi';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'expo-router';
import type { LoginFormData } from '@/components/auth/LoginForm';

export default function LoginScreen() {
    const { mutateAsync: login, isPending: isLoading } = useLogin();
    const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleSignIn();
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const handleLogin = async (data: LoginFormData) => {
        Keyboard.dismiss();

        try {
            const response = await login(data);

            if (response.data?.access_token) {
                showSuccess('Đăng nhập thành công! 🎉', 'Chào mừng bạn trở lại.');

                // Navigation will be handled automatically by useProtectedRoute
                // But we can also manually navigate to ensure it happens
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Đã xảy ra lỗi. Vui lòng thử lại.';

            showError('Đăng nhập thất bại', errorMessage);
        }
    };



    const handleForgotPassword = () => {
        router.push('/(auth)/forgot-password');
    };

    const handleRegister = () => {
        router.push('/(auth)/register');
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
                            Đăng nhập vào{'\n'}tài khoản của bạn
                        </Text>
                        <Text className="text-sm text-center text-gray-600 dark:text-gray-400">
                            Nhập email hoặc username để đăng nhập.
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
                        onPress={signInWithGoogle}
                        disabled={isGoogleLoading}
                        className={`w-full flex-row items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${isGoogleLoading ? 'opacity-50' : 'opacity-100'
                            }`}
                    >
                        <Image
                            source={require('@/assets/images/google.png')}
                            style={{ width: 20, height: 20 }}
                            resizeMode="contain"
                        />
                        <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                            {isGoogleLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
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
