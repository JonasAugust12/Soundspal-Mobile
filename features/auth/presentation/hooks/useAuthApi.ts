import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { getUserFromToken } from '@/shared/utils/jwt';
import { authRepository } from '@/features/auth/data/repositories/AuthRepositoryImpl';
import { LoginUseCase } from '@/features/auth/domain/usecases/LoginUseCase';
import { clearSyncedFcmToken, getOrCreateDeviceId } from '@/features/notifications/data/deviceInfo';
import type { LoginRequest } from '@/features/auth/domain/entities/auth.type';

const loginUseCase = new LoginUseCase(authRepository);

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
                    queryClient.clear();
                }
            }
        },
    });
};

export const useSignup = () => {
    return useMutation({
        mutationFn: authRepository.signup,
    });
};

export const useLogout = () => {
    const { logout, refreshToken } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            authRepository.logout({
                refresh_token: refreshToken || '',
                device_id: getOrCreateDeviceId(),
            }),
        onSettled: () => {
            // Always logout on client side, even if API fails
            logout();
            clearSyncedFcmToken();
            queryClient.clear();
        },
    });
};

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

export const useResendVerificationCode = () => {
    return useMutation({
        mutationFn: authRepository.resendVerification,
    });
};

export const useRequestPasswordReset = () => {
    return useMutation({
        mutationFn: authRepository.requestPasswordReset,
    });
};

export const useConfirmResetPasswordRequest = () => {
    return useMutation({
        mutationFn: authRepository.confirmResetPassword,
    });
};

export const useResendResetPasswordCode = () => {
    return useMutation({
        mutationFn: authRepository.resendResetPasswordCode,
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: authRepository.resetPassword,
    });
};

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

// Request Email Change Hook — gửi mã OTP tới email mới
export const useRequestEmailChange = () => {
    return useMutation({
        mutationFn: authRepository.requestEmailChange,
    });
};

// Verify Email Change Hook — xác nhận OTP để đổi email
export const useVerifyEmailChange = () => {
    return useMutation({
        mutationFn: authRepository.verifyEmailChange,
    });
};

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
