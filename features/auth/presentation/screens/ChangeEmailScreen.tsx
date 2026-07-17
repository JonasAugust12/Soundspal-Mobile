import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Keyboard, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Mail, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { AuthButton, FormInput } from '@/features/auth/presentation/components';
import { OTPInput } from '@/features/auth/presentation/components/OTPInput';
import {
    useRequestEmailChange,
    useVerifyEmailChange,
} from '@/features/auth/presentation/hooks/useAuthApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { queryClient } from '@/shared/infrastructure/api/queryClient';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { useRouter } from 'expo-router';
import {
    AUTH_CHANGE_EMAIL_UI,
    AUTH_COMMON,
    AuthLoadingLabel,
    AuthSuccessToast,
    AuthToastTitle,
} from '@/features/auth/domain/constants/authMessages';
import { AuthErrorContext } from '@/features/auth/domain/constants/authApiErrorCode';
import { AuthValidationMessage } from '@/features/auth/domain/constants/authValidation';
import { resolveAuthErrorMessage } from '@/features/auth/domain/utils/resolveAuthErrorMessage';

type Step = 'email' | 'otp';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChangeEmailScreen() {
    const [step, setStep] = useState<Step>('email');
    const [newEmail, setNewEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [code, setCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(0);

    const { mutateAsync: requestEmailChange, isPending: isRequesting } = useRequestEmailChange();
    const { mutateAsync: verifyEmailChange, isPending: isVerifying } = useVerifyEmailChange();
    const currentEmail = useAuthStore((state) => state.user?.email);
    const clearAuthState = useAuthStore((state) => state.logout);
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleRequestChange = async () => {
        Keyboard.dismiss();
        setEmailError('');

        const trimmed = newEmail.trim();
        if (!EMAIL_PATTERN.test(trimmed)) {
            setEmailError(AuthValidationMessage.EmailInvalid);
            return;
        }

        try {
            await requestEmailChange({ new_email: trimmed });
            setNewEmail(trimmed);
            setStep('otp');
            setCode('');
            setOtpError('');
            setCountdown(30);
            showSuccess(
                AuthSuccessToast.ChangeEmailCodeSentTitle,
                AuthSuccessToast.ChangeEmailCodeSentBody,
            );
        } catch (error: unknown) {
            showError(
                AuthToastTitle.ChangeEmailFailed,
                resolveAuthErrorMessage(error, AuthErrorContext.ChangeEmail),
            );
        }
    };

    const handleVerify = async () => {
        Keyboard.dismiss();
        setOtpError('');

        if (code.length !== 6) {
            setOtpError(AuthValidationMessage.OtpLength);
            return;
        }

        try {
            await verifyEmailChange({ new_email: newEmail, code });

            // Email là danh tính đăng nhập — token hiện tại đã cũ. Xóa phiên và bắt đăng nhập lại.
            showSuccess(
                AuthSuccessToast.ChangeEmailSuccessTitle,
                AuthSuccessToast.ChangeEmailSuccessBody,
            );
            clearAuthState();
            queryClient.clear();
            router.replace('/(auth)/login');
        } catch (error: unknown) {
            setOtpError(resolveAuthErrorMessage(error, AuthErrorContext.ChangeEmail));
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        try {
            await requestEmailChange({ new_email: newEmail });
            showSuccess(AuthSuccessToast.ResendCodeTitle, AuthSuccessToast.ResendCodeBody);
            setCountdown(30);
            setCode('');
            setOtpError('');
        } catch (error: unknown) {
            showError(
                AuthToastTitle.Error,
                resolveAuthErrorMessage(error, AuthErrorContext.ChangeEmail),
            );
        }
    };

    const handleBackToEmail = () => {
        setStep('email');
        setCode('');
        setOtpError('');
    };

    return (
        <View className="flex-1 bg-white">
            {/* Background Gradient - Purple (khớp theme auth) */}
            <LinearGradient
                colors={['#7C3BED', '#9333EA', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            >
                <View style={styles.circle1} />
                <View style={styles.circle2} />
            </LinearGradient>

            <SafeAreaView className="flex-1" edges={SCREEN_SAFE_AREA_EDGES}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center gap-1 px-4 pt-2"
                >
                    <ChevronLeft size={24} color="#FFFFFF" />
                    <Text className="text-white font-medium">{AUTH_COMMON.back}</Text>
                </TouchableOpacity>

                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    bottomOffset={20}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Section */}
                    <View className="items-center pt-6 pb-10">
                        <View style={styles.iconContainer}>
                            <Mail size={40} color="#7C3BED" />
                        </View>
                        <Text className="text-white text-xl font-bold mt-4">
                            {AUTH_CHANGE_EMAIL_UI.title}
                        </Text>
                        <Text className="text-white/70 text-sm mt-1 text-center px-8">
                            {AUTH_CHANGE_EMAIL_UI.subtitle}
                        </Text>
                    </View>

                    {/* Main Content Card */}
                    <View
                        style={styles.contentCard}
                        className="flex-1 bg-white rounded-t-[32px] px-6 pt-8"
                    >
                        {/* Current email chip */}
                        {!!currentEmail && (
                            <View className="items-center mb-6">
                                <Text className="text-xs text-gray-400 mb-1">
                                    {AUTH_CHANGE_EMAIL_UI.currentEmailLabel}
                                </Text>
                                <View className="bg-purple-50 px-4 py-2 rounded-full">
                                    <Text className="text-purple-700 font-semibold text-sm">
                                        {currentEmail}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {step === 'email' ? (
                            <>
                                <View className="items-center mb-6">
                                    <Text className="text-lg font-bold text-gray-900 text-center">
                                        {AUTH_CHANGE_EMAIL_UI.stepEmailPrompt}
                                    </Text>
                                    <Text className="text-sm text-gray-500 mt-1 text-center max-w-[280px]">
                                        {AUTH_CHANGE_EMAIL_UI.stepEmailHint}
                                    </Text>
                                </View>

                                <FormInput
                                    label={AUTH_CHANGE_EMAIL_UI.newEmailLabel}
                                    icon={Mail}
                                    value={newEmail}
                                    onChangeText={(text) => {
                                        setNewEmail(text);
                                        setEmailError('');
                                    }}
                                    error={emailError}
                                    placeholder={AUTH_CHANGE_EMAIL_UI.newEmailPlaceholder}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />

                                <AuthButton
                                    onPress={handleRequestChange}
                                    isLoading={isRequesting}
                                    disabled={!newEmail.trim()}
                                    leftIcon={Mail}
                                >
                                    {isRequesting
                                        ? AuthLoadingLabel.Sending
                                        : AUTH_CHANGE_EMAIL_UI.sendCode}
                                </AuthButton>
                            </>
                        ) : (
                            <>
                                <View className="items-center mb-6">
                                    <Text className="text-lg font-bold text-gray-900 text-center">
                                        {AUTH_CHANGE_EMAIL_UI.stepOtpTitle}
                                    </Text>
                                    <Text className="text-sm text-gray-500 mt-1 text-center">
                                        {AUTH_CHANGE_EMAIL_UI.stepOtpHint}
                                    </Text>
                                    <View className="bg-purple-50 px-4 py-2 rounded-full mt-2">
                                        <Text className="text-purple-700 font-semibold text-sm">
                                            {newEmail}
                                        </Text>
                                    </View>
                                </View>

                                <View className="mb-4">
                                    <OTPInput
                                        value={code}
                                        onChange={(text) => {
                                            setCode(text);
                                            setOtpError('');
                                        }}
                                        hasError={!!otpError}
                                        activeColor="#7C3BED"
                                    />
                                    {!!otpError && (
                                        <Text className="text-red-500 text-xs mt-4 text-center">
                                            {otpError}
                                        </Text>
                                    )}
                                </View>

                                <AuthButton
                                    onPress={handleVerify}
                                    isLoading={isVerifying}
                                    disabled={code.length !== 6}
                                    leftIcon={CheckCircle2}
                                >
                                    {isVerifying
                                        ? AuthLoadingLabel.Verifying
                                        : AUTH_CHANGE_EMAIL_UI.confirmChange}
                                </AuthButton>

                                {/* Resend Section */}
                                <View className="items-center mt-6">
                                    <Text className="text-sm text-gray-500 mb-2">
                                        {AUTH_COMMON.noCodeReceived}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleResend}
                                        disabled={countdown > 0 || isRequesting}
                                        className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${countdown > 0 ? 'bg-gray-100' : 'bg-purple-50'}`}
                                    >
                                        <RefreshCw
                                            size={16}
                                            color={countdown > 0 ? '#9CA3AF' : '#7C3BED'}
                                        />
                                        <Text
                                            className={`font-semibold ${countdown > 0 ? 'text-gray-400' : 'text-purple-600'}`}
                                        >
                                            {countdown > 0
                                                ? AUTH_COMMON.resendAfter(countdown)
                                                : AUTH_COMMON.resendCode}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Change another email */}
                                <TouchableOpacity
                                    onPress={handleBackToEmail}
                                    className="items-center mt-4"
                                >
                                    <Text className="text-sm text-gray-500 font-semibold">
                                        {AUTH_CHANGE_EMAIL_UI.changeAnotherEmail}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Security Note */}
                        <View className="mt-8 bg-gray-50 rounded-2xl p-4">
                            <Text className="text-xs text-gray-500 text-center">
                                {AUTH_CHANGE_EMAIL_UI.securityNote}
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
