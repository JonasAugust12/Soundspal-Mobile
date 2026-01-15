import React from 'react';
import { View, Text, TouchableOpacity, Keyboard, Image, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginForm } from '@/components/auth';
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
                router.replace('/(tabs)');
            }
            //eslint-disable-next-line
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
        <View className="flex-1 bg-white">
            {/* Background Gradient */}
            <LinearGradient
                colors={['#7C3BED', '#9333EA', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            >
                {/* Decorative Circles */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />
                <View style={styles.circle3} />
            </LinearGradient>

            <SafeAreaView className="flex-1">
                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Section with Logo */}
                    <View className="items-center pt-8 pb-10">
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/TalentLink-Logo.png')}
                                style={{ width: 80, height: 80 }}
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-white text-xl font-bold mt-4">TalentLink</Text>
                        <Text className="text-white/70 text-sm mt-1">Kết nối tài năng âm nhạc</Text>
                    </View>

                    {/* Main Content Card */}
                    <View
                        style={styles.contentCard}
                        className="flex-1 bg-white rounded-t-[32px] px-6 pt-8"
                    >
                        {/* Welcome Text */}
                        <View className="items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900 text-center">
                                Chào mừng trở lại! 👋
                            </Text>
                            <Text className="text-sm text-gray-500 mt-2 text-center">
                                Đăng nhập để tiếp tục khám phá
                            </Text>
                        </View>

                        {/* Login Form */}
                        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

                        {/* Forgot Password */}
                        <TouchableOpacity
                            onPress={handleForgotPassword}
                            className="items-center mt-4"
                        >
                            <Text className="text-sm text-purple-600 font-semibold">
                                Quên mật khẩu?
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-gray-200" />
                            <View className="bg-gray-100 px-4 py-1 rounded-full mx-3">
                                <Text className="text-xs text-gray-400 font-medium">HOẶC</Text>
                            </View>
                            <View className="flex-1 h-px bg-gray-200" />
                        </View>

                        {/* Google Sign In */}
                        <TouchableOpacity
                            onPress={signInWithGoogle}
                            disabled={isGoogleLoading}
                            style={styles.googleButton}
                            className="flex-row items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white border border-gray-200"
                        >
                            <Image
                                source={require('@/assets/images/google.png')}
                                style={{ width: 22, height: 22 }}
                                resizeMode="contain"
                            />
                            <Text className="text-base font-semibold text-gray-700">
                                {isGoogleLoading ? 'Đang xử lý...' : 'Tiếp tục với Google'}
                            </Text>
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View className="flex-row items-center justify-center gap-1 mt-8 mb-6">
                            <Text className="text-sm text-gray-500">Chưa có tài khoản?</Text>
                            <TouchableOpacity onPress={handleRegister}>
                                <Text className="text-sm font-bold text-purple-600">
                                    Đăng ký ngay
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Terms */}
                        <View className="items-center pb-6">
                            <Text className="text-[10px] text-gray-400 text-center max-w-[280px]">
                                Bằng việc đăng nhập, bạn đồng ý với{' '}
                                <Text className="text-purple-600">Điều khoản dịch vụ</Text> và{' '}
                                <Text className="text-purple-600">Chính sách bảo mật</Text> của
                                chúng tôi.
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
        height: 320,
    },
    circle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    circle2: {
        position: 'absolute',
        top: 100,
        left: -30,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    circle3: {
        position: 'absolute',
        bottom: 20,
        right: 40,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 28,
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
    googleButton: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
