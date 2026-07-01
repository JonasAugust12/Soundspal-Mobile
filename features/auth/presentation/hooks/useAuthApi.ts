import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { getUserFromToken } from '@/shared/utils/jwt';
import { authRepository } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import { LoginUseCase } from '@/features/auth/domain/usecases/LoginUseCase';
import type { LoginRequest } from '@/features/auth/domain/entities/auth.type';

const loginUseCase = new LoginUseCase(authRepository);

// Login Hook
export const useLogin = () => {
    const { setCredentials } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: LoginRequest) => loginUseCase.execute(body),
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
        mutationFn: authRepository.signup,
    });
};

// Logout Hook
export const useLogout = () => {
    const { logout, refreshToken } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authRepository.logout({ refresh_token: refreshToken || '' }),
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
        mutationFn: authRepository.verifyEmail,
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
        mutationFn: authRepository.resendVerification,
    });
};

// Request Password Reset Hook
export const useRequestPasswordReset = () => {
    return useMutation({
        mutationFn: authRepository.requestPasswordReset,
    });
};

// Confirm Reset Password Request Hook
export const useConfirmResetPasswordRequest = () => {
    return useMutation({
        mutationFn: authRepository.confirmResetPassword,
    });
};

// Resend Reset Password Code Hook
export const useResendResetPasswordCode = () => {
    return useMutation({
        mutationFn: authRepository.resendResetPasswordCode,
    });
};

// Reset Password Hook
export const useResetPassword = () => {
    return useMutation({
        mutationFn: authRepository.resetPassword,
    });
};

// Mobile OAuth Hook
export const useMobileOAuth = () => {
    const { setCredentials } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authRepository.mobileOAuth,
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
        mutationFn: authRepository.completeOAuth,
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
