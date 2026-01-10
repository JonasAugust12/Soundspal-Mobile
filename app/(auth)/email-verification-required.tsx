import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MailWarning, RefreshCcw, LogOut } from 'lucide-react-native';
import { LogoHeader, AuthButton } from '@/components/auth';
import { useResendVerificationCode } from '@/hooks/useAuthApi';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function EmailVerificationRequiredScreen() {
    const { mutateAsync: resendCode, isPending: isResending } = useResendVerificationCode();
    const { showSuccess, showError } = useToast();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleResend = async () => {
        try {
            await resendCode({ email: user?.email || '' });
            showSuccess('Đã gửi lại mã', 'Vui lòng kiểm tra email của bạn.');

            router.push({
                pathname: '/(auth)/verify-email',
                params: { email: user?.email || '', fromLogin: 'true' },
            });
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Không thể gửi mã. Vui lòng thử lại.';
            showError('Lỗi', errorMessage);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <View className="flex-1 items-center justify-center p-6">
                <LogoHeader />

                <View className="items-center gap-4 mt-8 mb-8">
                    <View className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
                        <View className="text-orange-600">
                            <MailWarning size={48} />
                        </View>
                    </View>

                    <Text className="text-2xl font-extrabold text-center text-gray-900 dark:text-white">
                        Xác thực email cần thiết
                    </Text>

                    <Text className="text-sm text-center text-gray-600 dark:text-gray-400 w-4/5">
                        Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email{' '}
                        <Text className="font-semibold text-purple-600">{user?.email}</Text>{' '}
                        để nhận mã xác thực.
                    </Text>
                </View>

                <View className="w-full gap-3">
                    <AuthButton
                        onPress={handleResend}
                        isLoading={isResending}
                        leftIcon={RefreshCcw}
                    >
                        {isResending ? 'Đang gửi...' : 'Gửi lại mã xác thực'}
                    </AuthButton>

                    <AuthButton
                        variant="outlined"
                        onPress={handleLogout}
                        leftIcon={LogOut}
                    >
                        Đăng xuất
                    </AuthButton>
                </View>
            </View>
        </SafeAreaView>
    );
}
