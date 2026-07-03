import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { MailWarning, RefreshCcw, LogOut, AlertTriangle } from 'lucide-react-native';
import { AuthButton } from '@/features/auth/presentation/components';
import { useResendVerificationCode } from '@/features/auth/presentation/hooks/useAuthApi';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import {
    AUTH_COMMON,
    AUTH_EMAIL_REQUIRED_UI,
    AuthLoadingLabel,
    AuthSuccessToast,
    AuthToastTitle,
} from '@/features/auth/domain/constants/authMessages';
import { AuthErrorContext } from '@/features/auth/domain/constants/authApiErrorCode';
import { resolveAuthErrorMessage } from '@/features/auth/domain/utils/resolveAuthErrorMessage';

export default function EmailVerificationRequiredScreen() {
    const { mutateAsync: resendCode, isPending: isResending } = useResendVerificationCode();
    const { showSuccess, showError } = useToast();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleResend = async () => {
        try {
            await resendCode({ email: user?.email || '' });
            showSuccess(AuthSuccessToast.ResendCodeTitle, AuthSuccessToast.ResendCodeBody);

            router.push({
                pathname: '/(auth)/verify-email',
                params: { email: user?.email || '', fromLogin: 'true' },
            });
        } catch (error: unknown) {
            showError(
                AuthToastTitle.Error,
                resolveAuthErrorMessage(error, AuthErrorContext.ResendVerification),
            );
        }
    };

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/login');
    };

    return (
        <View className="flex-1 bg-white">
            {/* Background Gradient - Amber/Orange */}
            <LinearGradient
                colors={['#F59E0B', '#D97706', '#FB923C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            >
                <View style={styles.circle1} />
                <View style={styles.circle2} />
            </LinearGradient>

            <SafeAreaView className="flex-1" edges={SCREEN_SAFE_AREA_EDGES}>
                {/* Top Section */}
                <View className="items-center pt-12 pb-10">
                    <View style={styles.iconContainer}>
                        <AlertTriangle size={44} color="#F59E0B" />
                    </View>
                    <Text className="text-white text-xl font-bold mt-4">
                        {AUTH_EMAIL_REQUIRED_UI.header}
                    </Text>
                    <Text className="text-white/70 text-sm mt-1">
                        {AUTH_EMAIL_REQUIRED_UI.subtitle}
                    </Text>
                </View>

                {/* Main Content Card */}
                <View
                    style={styles.contentCard}
                    className="flex-1 bg-white rounded-t-[32px] px-6 pt-8"
                >
                    {/* Warning Icon */}
                    <View className="items-center mb-6">
                        <View className="w-20 h-20 rounded-full bg-amber-50 items-center justify-center mb-4">
                            <MailWarning size={40} color="#F59E0B" />
                        </View>
                        <Text className="text-xl font-black text-gray-900 text-center">
                            {AUTH_EMAIL_REQUIRED_UI.title}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-2 text-center max-w-[300px]">
                            {AUTH_EMAIL_REQUIRED_UI.body}
                        </Text>
                    </View>

                    {/* Email Display */}
                    <View className="bg-amber-50 rounded-2xl p-4 mb-6">
                        <Text className="text-xs text-amber-600 font-medium mb-1">
                            {AUTH_EMAIL_REQUIRED_UI.registeredEmail}
                        </Text>
                        <Text className="text-base font-bold text-gray-900">{user?.email}</Text>
                    </View>

                    {/* Actions */}
                    <View className="gap-3">
                        <AuthButton
                            onPress={handleResend}
                            isLoading={isResending}
                            leftIcon={RefreshCcw}
                        >
                            {isResending
                                ? AuthLoadingLabel.Sending
                                : AUTH_EMAIL_REQUIRED_UI.sendCode}
                        </AuthButton>

                        <TouchableOpacity
                            onPress={handleLogout}
                            className="flex-row items-center justify-center gap-2 py-4"
                        >
                            <LogOut size={18} color="#6B7280" />
                            <Text className="text-gray-500 font-semibold">
                                {AUTH_COMMON.logout}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info Box */}
                    <View className="mt-8 bg-gray-50 rounded-2xl p-4">
                        <Text className="text-xs font-bold text-gray-700 mb-2">
                            {AUTH_EMAIL_REQUIRED_UI.whyTitle}
                        </Text>
                        <View className="gap-1">
                            <Text className="text-xs text-gray-500">
                                {AUTH_EMAIL_REQUIRED_UI.whySecure}
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {AUTH_EMAIL_REQUIRED_UI.whyNotify}
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {AUTH_EMAIL_REQUIRED_UI.whyRecover}
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View className="items-center mt-auto pb-6">
                        <Text className="text-[10px] text-gray-400 text-center">
                            {AUTH_EMAIL_REQUIRED_UI.footer}
                        </Text>
                    </View>
                </View>
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
        height: 280,
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
