import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { getUserFromToken } from '@/utils/jwt';
import type {
    LoginRequest,
    LoginResponse,
    SignupRequest,
    SignupResponse,
    LogoutRequest,
    LogoutResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
    ResendVerificationRequest,
    ResendVerificationResponse,
    RequestPasswordResetRequest,
    RequestPasswordResetResponse,
    ConfirmResetPasswordRequest,
    ConfirmResetPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    MobileOAuthRequest,
    MobileOAuthResponse,
    CompleteOAuthRequest,
    CompleteOAuthResponse,
} from '@/types/auth.type';

// API Calls
const authApi = {
    login: createApiCall<LoginResponse, LoginRequest>('POST', '/auth/login'),
    signup: createApiCall<SignupResponse, SignupRequest>('POST', '/auth/signup'),
    logout: createApiCall<LogoutResponse, LogoutRequest>('POST', '/auth/logout'),
    verifyEmail: createApiCall<VerifyEmailResponse, VerifyEmailRequest>(
        'POST',
        '/auth/verify-email',
    ),
    resendVerification: createApiCall<ResendVerificationResponse, ResendVerificationRequest>(
        'POST',
        '/auth/verification-email-resend',
    ),
    requestPasswordReset: createApiCall<RequestPasswordResetResponse, RequestPasswordResetRequest>(
        'POST',
        '/auth/reset-password-request',
    ),
    confirmResetPassword: createApiCall<ConfirmResetPasswordResponse, ConfirmResetPasswordRequest>(
        'POST',
        '/auth/confirm-reset-password-request',
    ),
    resendResetPasswordCode: createApiCall<
        RequestPasswordResetResponse,
        RequestPasswordResetRequest
    >('POST', '/auth/reset-password-request-resend'),
    resetPassword: createApiCall<ResetPasswordResponse, ResetPasswordRequest>(
        'POST',
        '/auth/reset-password',
    ),
    mobileOAuth: createApiCall<MobileOAuthResponse, MobileOAuthRequest>(
        'POST',
        '/auth/mobile-oauth',
    ),
    completeOAuth: createApiCall<CompleteOAuthResponse, CompleteOAuthRequest>(
        'POST',
        '/auth/complete-oauth',
    ),
};

// Login Hook
export const useLogin = () => {
    const { setCredentials } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            if (data.data) {
                const { access_token, refresh_token } = data.data;
                const user = getUserFromToken(access_token);

                if (user) {
                    setCredentials({
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        user,
                    });
                    // Clear all cache on login
                    queryClient.clear();
                }
            }
        },
    });
};

// Signup Hook
export const useSignup = () => {
    return useMutation({
        mutationFn: authApi.signup,
    });
};

// Logout Hook
export const useLogout = () => {
    const { logout, refreshToken } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authApi.logout({ refresh_token: refreshToken || '' }),
        onSettled: () => {
            // Always logout on client side, even if API fails
            logout();
            queryClient.clear();
        },
    });
};

// Verify Email Hook
export const useVerifyEmail = () => {
    const { setCredentials } = useAuthStore();

    return useMutation({
        mutationFn: authApi.verifyEmail,
        onSuccess: (_, _variables) => {
            // Update user verification status if needed
            const store = useAuthStore.getState();
            if (store.user) {
                setCredentials({
                    accessToken: store.accessToken!,
                    refreshToken: store.refreshToken!,
                    user: { ...store.user, is_verified: true },
                });
            }
        },
    });
};

// Resend Verification Code Hook
export const useResendVerificationCode = () => {
    return useMutation({
        mutationFn: authApi.resendVerification,
    });
};

// Request Password Reset Hook
export const useRequestPasswordReset = () => {
    return useMutation({
        mutationFn: authApi.requestPasswordReset,
    });
};

// Confirm Reset Password Request Hook
export const useConfirmResetPasswordRequest = () => {
    return useMutation({
        mutationFn: authApi.confirmResetPassword,
    });
};

// Resend Reset Password Code Hook
export const useResendResetPasswordCode = () => {
    return useMutation({
        mutationFn: authApi.resendResetPasswordCode,
    });
};

// Reset Password Hook
export const useResetPassword = () => {
    return useMutation({
        mutationFn: authApi.resetPassword,
    });
};

// Mobile OAuth Hook
export const useMobileOAuth = () => {
    const { setCredentials } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.mobileOAuth,
        onSuccess: (data) => {
            if (data.data?.is_registered && data.data?.access_token && data.data?.refresh_token) {
                const user = getUserFromToken(data.data.access_token);
                if (user) {
                    setCredentials({
                        accessToken: data.data.access_token,
                        refreshToken: data.data.refresh_token,
                        user,
                    });
                    queryClient.clear();
                }
            }
        },
    });
};

// Complete OAuth Hook
export const useCompleteOAuth = () => {
    const { setCredentials } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.completeOAuth,
        onSuccess: (data) => {
            if (data.data?.access_token && data.data?.refresh_token) {
                const user = getUserFromToken(data.data.access_token);
                if (user) {
                    setCredentials({
                        accessToken: data.data.access_token,
                        refreshToken: data.data.refresh_token,
                        user,
                    });
                    queryClient.clear();
                }
            }
        },
    });
};
