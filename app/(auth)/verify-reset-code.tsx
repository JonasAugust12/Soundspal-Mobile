import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { LogoHeader, AuthButton } from '@/components/auth';
import { useConfirmResetPasswordRequest, useResendResetPasswordCode } from '@/hooks/useAuthApi';
import { useToast } from '@/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

export default function VerifyResetCodeScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');

    const { mutateAsync: confirmCode, isPending: isVerifying } = useConfirmResetPasswordRequest();
    const { mutateAsync: resendCode, isPending: isResending } = useResendResetPasswordCode();
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    // Countdown timer
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
            const response = await confirmCode({
                email: email || '',
                reset_code: code,
            });

            if (response.data?.reset_token) {
                showSuccess('Xác thực thành công! ✅', 'Bạn có thể đặt lại mật khẩu mới.');

                router.push({
                    pathname: '/(auth)/reset-password',
                    params: {
                        email: email || '',
                        reset_token: response.data.reset_token,
                    },
                });
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
                            Xác thực mã
                        </Text>
                        <Text className="text-sm text-center text-gray-600 dark:text-gray-400 w-4/5">
                            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến
                        </Text>
                        <Text className="text-sm font-semibold text-center text-purple-600">
                            {email}
                        </Text>
                    </View>

                    <View className="w-full gap-4 mt-4">
                        <View>
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nhập mã xác thực
                            </Text>
                            <TextInput
                                value={code}
                                onChangeText={(text) => {
                                    setCode(text);
                                    setError('');
                                }}
                                placeholder="000000"
                                keyboardType="number-pad"
                                maxLength={6}
                                className={`
                                    w-full px-4 py-4 rounded-xl border-2 text-center text-2xl font-bold tracking-widest
                                    ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                    bg-white dark:bg-gray-800
                                    text-gray-900 dark:text-white
                                `}
                                placeholderTextColor="#9ca3af"
                            />
                            {error && (
                                <Text className="text-red-500 text-xs mt-1">{error}</Text>
                            )}
                        </View>

                        <AuthButton
                            onPress={handleVerify}
                            isLoading={isVerifying}
                            disabled={code.length !== 6}
                            leftIcon={CheckCircle2}
                        >
                            {isVerifying ? 'Đang xác thực...' : 'Xác thực'}
                        </AuthButton>

                        <View className="flex-row items-center justify-center gap-2 mt-4">
                            <Text className="text-sm text-gray-600 dark:text-gray-400">
                                Không nhận được mã?
                            </Text>
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={countdown > 0 || isResending}
                            >
                                <Text className={`text-sm font-semibold ${countdown > 0 || isResending ? 'text-gray-400' : 'text-purple-600'} underline`}>
                                    {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
