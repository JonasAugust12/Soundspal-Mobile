import React from 'react';
import { View, Text, TouchableOpacity, Keyboard, Image, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { RegisterForm } from '@/features/auth/presentation/components';
import { useSignup } from '@/features/auth/presentation/hooks/useAuthApi';
import { useGoogleSignIn } from '@/features/auth/presentation/hooks/useGoogleSignIn';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { useRouter } from 'expo-router';
import type { RegisterFormData } from '@/features/auth/presentation/components/RegisterForm';
import {
    AUTH_COMMON,
    AUTH_REGISTER_UI,
    AuthLoadingLabel,
    AuthSuccessToast,
    AuthToastTitle,
} from '@/features/auth/domain/constants/authMessages';
import { AuthErrorContext } from '@/features/auth/domain/constants/authApiErrorCode';
import { resolveAuthErrorMessage } from '@/features/auth/domain/utils/resolveAuthErrorMessage';

export default function RegisterScreen() {
    const { mutateAsync: signup, isPending: isLoading } = useSignup();
    const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleSignIn();
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const handleSignup = async (formData: RegisterFormData) => {
        Keyboard.dismiss();

        try {
            await signup(formData);

            showSuccess(AuthSuccessToast.RegisterTitle, AuthSuccessToast.RegisterBody);

            router.push({
                pathname: '/(auth)/verify-email',
                params: { email: formData.email },
            });
        } catch (error: unknown) {
            showError(
                AuthToastTitle.RegisterFailed,
                resolveAuthErrorMessage(error, AuthErrorContext.Register),
            );
        }
    };

    const handleLogin = () => {
        router.back();
    };

    return (
        <View className="flex-1 bg-white">
            {/* Background Gradient */}
            <LinearGradient
                colors={['#2563EB', '#3B82F6', '#60A5FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            >
                {/* Decorative Circles */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />
                <View style={styles.circle3} />
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
                    {/* Top Section with Logo */}
                    <View className="items-center pt-6 pb-8">
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/Soundspal-Logo.png')}
                                style={{ width: 70, height: 70 }}
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-white text-lg font-bold mt-3">
                            {AUTH_REGISTER_UI.header}
                        </Text>
                        <Text className="text-white/70 text-sm mt-1">
                            {AUTH_REGISTER_UI.subtitle}
                        </Text>
                    </View>

                    {/* Main Content Card */}
                    <View
                        style={styles.contentCard}
                        className="flex-1 bg-white rounded-t-[32px] px-6 pt-6"
                    >
                        {/* Welcome Text */}
                        <View className="items-center mb-4">
                            <Text className="text-xl font-black text-gray-900 text-center">
                                {AUTH_REGISTER_UI.title}
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1 text-center">
                                {AUTH_REGISTER_UI.formSubtitle}
                            </Text>
                        </View>

                        {/* Register Form */}
                        <RegisterForm onSubmit={handleSignup} isLoading={isLoading} />

                        {/* Divider */}
                        <View className="flex-row items-center my-5">
                            <View className="flex-1 h-px bg-gray-200" />
                            <View className="bg-gray-100 px-4 py-1 rounded-full mx-3">
                                <Text className="text-xs text-gray-400 font-medium">
                                    {AUTH_COMMON.or}
                                </Text>
                            </View>
                            <View className="flex-1 h-px bg-gray-200" />
                        </View>

                        {/* Google Sign Up */}
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
                                {isGoogleLoading
                                    ? AuthLoadingLabel.Processing
                                    : AUTH_COMMON.continueWithGoogle}
                            </Text>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View className="flex-row items-center justify-center gap-1 mt-6 mb-4">
                            <Text className="text-sm text-gray-500">{AUTH_COMMON.hasAccount}</Text>
                            <TouchableOpacity onPress={handleLogin}>
                                <Text className="text-sm font-bold text-blue-600">
                                    {AUTH_COMMON.login}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Terms */}
                        <View className="items-center pb-6">
                            <Text className="text-[10px] text-gray-400 text-center max-w-[280px]">
                                {AUTH_REGISTER_UI.termsPrefix}{' '}
                                <Text className="text-blue-600">{AUTH_COMMON.termsOfService}</Text>{' '}
                                và{' '}
                                <Text className="text-blue-600">{AUTH_COMMON.privacyPolicy}</Text>{' '}
                                {AUTH_REGISTER_UI.termsSuffix}
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
        height: 280,
    },
    circle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    circle2: {
        position: 'absolute',
        top: 80,
        left: -20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    circle3: {
        position: 'absolute',
        bottom: 30,
        right: 50,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    logoContainer: {
        width: 90,
        height: 90,
        borderRadius: 24,
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
