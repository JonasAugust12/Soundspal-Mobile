import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { useMobileOAuth } from '@/features/auth/presentation/hooks/useAuthApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { useRouter } from 'expo-router';
import { getUserFromToken } from '@/shared/utils/jwt';
import {
    AuthGoogleError,
    AuthSuccessToast,
    AuthToastTitle,
} from '@/features/auth/domain/constants/authMessages';
import { AuthErrorContext } from '@/features/auth/domain/constants/authApiErrorCode';
import { resolveAuthErrorMessage } from '@/features/auth/domain/utils/resolveAuthErrorMessage';
import { useDevicePayload } from '@/features/notifications/presentation/hooks/useDevicePayload';

export const useGoogleSignIn = () => {
    const { showSuccess, showError } = useToast();
    const { mutateAsync: mobileOAuth, isPending: isLoading } = useMobileOAuth();
    const { setCredentials } = useAuthStore();
    const { getDevicePayload } = useDevicePayload();
    const router = useRouter();
    const [registrationToken, setRegistrationToken] = useState<string | null>(null);

    const configureGoogleSignIn = () => {
        GoogleSignin.configure({
            // OAuth client loại "Web application" của project talent-link-480717.
            // PHẢI trùng client_id mà backend dùng để đổi serverAuthCode (backend giữ
            // client_secret cặp với nó) — lệch nhau là 401 oauth_failed.
            // Đây là project RIÊNG cho đăng nhập, khác project FCM (talentlink-22clc
            // trong google-services.json) — hai thứ độc lập, đừng đồng bộ nhầm.
            webClientId: `${process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID}`,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
    };

    const signInWithGoogle = async () => {
        try {
            configureGoogleSignIn();

            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });
            console.warn('Google Play Services are available.');

            await GoogleSignin.signOut();
            console.warn('Google Sign out successful.');

            const userInfo = await GoogleSignin.signIn();
            console.warn('Google Sign-In successful:', userInfo);

            const authCode = userInfo.data?.serverAuthCode;
            console.warn('Authorization Code:', authCode);

            if (!authCode) {
                showError(AuthToastTitle.Error, AuthGoogleError.MissingAuthCode);
                return;
            }

            // Đính token FCM + thông tin thiết bị để backend đăng ký nhận push.
            const device = await getDevicePayload();
            const response = await mobileOAuth({
                code: authCode,
                device_id: device.device_id,
                platform: device.platform,
                ...(device.fcm_token ? { fcm_token: device.fcm_token } : {}),
            });

            console.warn('mobile-oauth response:', response);

            if (response.data.is_registered) {
                const userInfoFromToken = getUserFromToken(response.data.access_token!);

                if (userInfoFromToken) {
                    setCredentials({
                        accessToken: response.data.access_token!,
                        refreshToken: response.data.refresh_token!,
                        user: {
                            id: userInfoFromToken.id,
                            email: userInfoFromToken.email,
                            role: userInfoFromToken.role,
                            is_verified: userInfoFromToken.is_verified,
                            username: userInfoFromToken.username,
                            avatar_url: userInfoFromToken.avatar_url,
                            display_name: userInfoFromToken.display_name,
                        },
                    });

                    // Điều hướng sau đăng nhập do useProtectedRoute xử lý (bao gồm returnTo).
                    showSuccess(AuthSuccessToast.LoginTitle, AuthSuccessToast.LoginBody);
                }
            } else {
                setRegistrationToken(response.data.registration_token!);
                router.push({
                    pathname: '/(auth)/complete-oauth-profile',
                    params: {
                        registration_token: response.data.registration_token,
                    },
                });
            }
        } catch (error: unknown) {
            console.error('Google Sign-In Error:', error);

            const err = error as {
                code?: string;
                message?: string;
                response?: { data?: { message?: string } };
            };

            if (err.code === 'SIGN_IN_CANCELLED') {
                return;
            }

            showError(
                AuthToastTitle.LoginError,
                resolveAuthErrorMessage(error, AuthErrorContext.GoogleSignIn),
            );
        }
    };

    return {
        signInWithGoogle,
        isLoading,
        registrationToken,
    };
};
