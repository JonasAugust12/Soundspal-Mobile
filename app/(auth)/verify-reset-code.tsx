import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Keyboard,
    Platform,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { AuthButton } from '@/components/auth';
import { OTPInput } from '@/components/auth/OTPInput';
import { useConfirmResetPasswordRequest, useResendResetPasswordCode } from '@/hooks/useAuthApi';
import { useToast } from '@/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function VerifyResetCodeScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');

    const { mutateAsync: confirmCode, isPending: isVerifying } = useConfirmResetPasswordRequest();
    const { mutateAsync: resendCode, isPending: isResending } = useResendResetPasswordCode();
    const { showSuccess, showError } = useToast();
    const router = useRouter();

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
        <View className="flex-1 bg-white">
            {/* Background Gradient - Orange */}
            <LinearGradient
                colors={['#F59E0B', '#F97316', '#FB923C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            >
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
                            <KeyRound size={40} color="#F59E0B" />
                        </View>
                        <Text className="text-white text-xl font-bold mt-4">Xác thực mã</Text>
                        <Text className="text-white/70 text-sm mt-1 text-center px-8">
                            Nhập mã để đặt lại mật khẩu
                        </Text>
                    </View>

                    {/* Main Content Card */}
                    <View
                        style={styles.contentCard}
                        className="flex-1 bg-white rounded-t-[32px] px-6 pt-8"
                    >
                        {/* Email Display */}
                        <View className="items-center mb-6">
                            <View className="bg-orange-50 px-4 py-2 rounded-full mb-4">
                                <Text className="text-orange-700 font-semibold text-sm">
                                    {email}
                                </Text>
                            </View>
                            <Text className="text-lg font-bold text-gray-900 text-center">
                                Nhập mã 6 số
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1 text-center max-w-[280px]">
                                Mã đã được gửi đến email của bạn
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
                                activeColor="#F59E0B"
                            />
                            {error && (
                                <Text className="text-red-500 text-xs mt-4 text-center">
                                    {error}
                                </Text>
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
                                className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${countdown > 0 ? 'bg-gray-100' : 'bg-orange-50'}`}
                            >
                                <RefreshCw
                                    size={16}
                                    color={countdown > 0 ? '#9CA3AF' : '#F59E0B'}
                                />
                                <Text
                                    className={`font-semibold ${countdown > 0 ? 'text-gray-400' : 'text-orange-600'}`}
                                >
                                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Security Note */}
                        <View className="mt-8 bg-gray-50 rounded-2xl p-4">
                            <Text className="text-xs text-gray-500 text-center">
                                💡 Mã xác thực sẽ hết hạn sau 15 phút. Nếu không nhận được email,
                                hãy kiểm tra thư mục spam.
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
