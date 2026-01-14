import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { useMobileOAuth } from '@/hooks/useAuthApi';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'expo-router';
import { getUserFromToken } from '@/utils/jwt';

export const useGoogleSignIn = () => {
    const { showSuccess, showError } = useToast();
    const { mutateAsync: mobileOAuth, isPending: isLoading } = useMobileOAuth();
    const { setCredentials } = useAuthStore();
    const router = useRouter();
    const [registrationToken, setRegistrationToken] = useState<string | null>(null);

    const configureGoogleSignIn = () => {
        GoogleSignin.configure({
            webClientId: '419154220948-58io8pdnh0e0ngcd7v94cf4icprgpf4l.apps.googleusercontent.com',
            offlineAccess: true,
            // forceCodeForRefreshToken: true,
        });
    };

    const signInWithGoogle = async () => {
        try {
            configureGoogleSignIn();

            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });
            console.log('Google Play Services are available.');

            // Sign out first to ensure fresh login
            await GoogleSignin.signOut();
            console.log('Google Sign out successful.');

            const userInfo = await GoogleSignin.signIn();
            console.log('Google Sign-In successful:', userInfo);

            const authCode = userInfo.data?.serverAuthCode;
            console.log('Authorization Code:', authCode);

            if (!authCode) {
                showError('Lỗi', 'Không thể lấy authorization code từ Google');
                return;
            }

            const response = await mobileOAuth({
                code: authCode,
            });

            console.log('mobile-oauth response:', response);

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

                    showSuccess('Đăng nhập thành công! 🎉', 'Chào mừng bạn trở lại.');
                    router.replace('/(tabs)');
                }
            } else {
                // Profile incomplete, need to complete
                setRegistrationToken(response.data.registration_token!);
                router.push({
                    pathname: '/(auth)/complete-oauth-profile',
                    params: {
                        registration_token: response.data.registration_token,
                    },
                });
            }
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);

            if (error.code === 'SIGN_IN_CANCELLED') {
                // User cancelled, do nothing
                return;
            }

            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Đăng nhập Google thất bại';

            showError('Lỗi đăng nhập', errorMessage);
        }
    };

    return {
        signInWithGoogle,
        isLoading,
        registrationToken,
    };
};
