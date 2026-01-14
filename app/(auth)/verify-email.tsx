import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Keyboard, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Mail, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { AuthButton } from '@/components/auth';
import { OTPInput } from '@/components/auth/OTPInput';
import { useVerifyEmail, useResendVerificationCode } from '@/hooks/useAuthApi';
import { useToast } from '@/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function VerifyEmailScreen() {
    const { email, fromLogin } = useLocalSearchParams<{ email: string; fromLogin?: string }>();
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');

    const { mutateAsync: verifyEmail, isPending: isVerifying } = useVerifyEmail();
    const { mutateAsync: resendCode, isPending: isResending } = useResendVerificationCode();
    const { showSuccess, showError } = useToast();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const isFromLogin = fromLogin === 'true';

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVerify = async () => {
        Keyboard.dismiss();
        setError('');

        if (!code || code.trim() === '') {
            setError('Mã xác thực là bắt buộc');
            return;
        }

        if (code.length !== 6) {
            setError('Mã xác thực phải có 6 ký tự');
            return;
        }

        try {
            const response = await verifyEmail({ code, email: email || '' });

            if (response.data || response.message) {
                showSuccess('Xác thực thành công! ✅', 'Tài khoản của bạn đã được xác thực.');

                if (isFromLogin && user) {
                    useAuthStore.setState((state) => ({
                        user: state.user ? { ...state.user, is_verified: true } : state.user
                    }));
                    router.replace('/(tabs)');
                } else {
                    router.replace('/(auth)/login');
                }
            }
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Mã xác thực không đúng. Vui lòng thử lại.';
            setError(errorMessage);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        try {
            await resendCode({ email: email || '' });
            showSuccess('Đã gửi lại mã', 'Vui lòng kiểm tra email của bạn.');
            setCountdown(30);
            setCode('');
            setError('');
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Không thể gửi lại mã. Vui lòng thử lại.';
            showError('Lỗi', errorMessage);
        }
    };

    const handleSkip = () => {
        if (isFromLogin) {
            logout();
        }
        router.replace('/(auth)/login');
    };

    return (
        <View className="flex-1 bg-white">
            {/* Background Gradient - Teal/Cyan */}
            <LinearGradient
                colors={['#0891B2', '#06B6D4', '#22D3EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            >
                <View style={styles.circle1} />
                <View style={styles.circle2} />
            </LinearGradient>

            <SafeAreaView className="flex-1">
                {/* Back Button */}
                {!isFromLogin && (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center gap-1 px-4 pt-2"
                    >
                        <ChevronLeft size={24} color="#FFFFFF" />
                        <Text className="text-white font-medium">Quay lại</Text>
                    </TouchableOpacity>
                )}

                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    bottomOffset={20}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Section */}
                    <View className="items-center pt-6 pb-10">
                        <View style={styles.iconContainer}>
                            <Mail size={40} color="#0891B2" />
                        </View>
                        <Text className="text-white text-xl font-bold mt-4">Xác thực email</Text>
                        <Text className="text-white/70 text-sm mt-1 text-center px-8">
                            Kiểm tra hộp thư đến của bạn
                        </Text>
                    </View>

                    {/* Main Content Card */}
                    <View style={styles.contentCard} className="flex-1 bg-white rounded-t-[32px] px-6 pt-8">
                        {/* Email Display */}
                        <View className="items-center mb-6">
                            <View className="bg-cyan-50 px-4 py-2 rounded-full mb-4">
                                <Text className="text-cyan-700 font-semibold text-sm">{email}</Text>
                            </View>
                            <Text className="text-lg font-bold text-gray-900 text-center">
                                Nhập mã 6 số
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1 text-center max-w-[280px]">
                                Chúng tôi đã gửi mã xác thực đến email của bạn
                            </Text>
                        </View>

                        {/* Code Input */}
                        <View className="mb-4">
                            <OTPInput
                                value={code}
                                onChange={(text) => {
                                    setCode(text);
                                    setError('');
                                }}
                                hasError={!!error}
                                activeColor="#0891B2"
                            />
                            {error && (
                                <Text className="text-red-500 text-xs mt-4 text-center">{error}</Text>
                            )}
                        </View>

                        {/* Verify Button */}
                        <AuthButton
                            onPress={handleVerify}
                            isLoading={isVerifying}
                            disabled={code.length !== 6}
                            leftIcon={CheckCircle2}
                        >
                            {isVerifying ? 'Đang xác thực...' : 'Xác thực'}
                        </AuthButton>

                        {/* Resend Section */}
                        <View className="items-center mt-6">
                            <Text className="text-sm text-gray-500 mb-2">Không nhận được mã?</Text>
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={countdown > 0 || isResending}
                                className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${countdown > 0 ? 'bg-gray-100' : 'bg-cyan-50'}`}
                            >
                                <RefreshCw size={16} color={countdown > 0 ? '#9CA3AF' : '#0891B2'} />
                                <Text className={`font-semibold ${countdown > 0 ? 'text-gray-400' : 'text-cyan-600'}`}>
                                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Skip/Logout */}
                        <TouchableOpacity onPress={handleSkip} className="mt-6">
                            <Text className="text-sm font-medium text-center text-gray-400 underline">
                                {isFromLogin ? 'Đăng xuất' : 'Bỏ qua, tôi sẽ xác thực sau'}
                            </Text>
                        </TouchableOpacity>
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
