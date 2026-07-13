import { createApiCall } from '@/shared/infrastructure/api/apiClient';
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
    RequestEmailChangeRequest,
    RequestEmailChangeResponse,
    VerifyEmailChangeRequest,
    VerifyEmailChangeResponse,
    GetMeResponse,
} from '@/features/auth/domain/entities/auth.type';

export const authRemoteDataSource = {
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
    requestEmailChange: createApiCall<RequestEmailChangeResponse, RequestEmailChangeRequest>(
        'POST',
        '/auth/change-email-request',
    ),
    verifyEmailChange: createApiCall<VerifyEmailChangeResponse, VerifyEmailChangeRequest>(
        'POST',
        '/auth/verify-email-change',
    ),
    // Lấy thông tin user hiện tại để xác thực token + làm mới dữ liệu khi mở app.
    getMe: createApiCall<GetMeResponse>('GET', '/users/me'),
};
