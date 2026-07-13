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

export interface IAuthRepository {
    login(body: LoginRequest): Promise<LoginResponse>;
    signup(body: SignupRequest): Promise<SignupResponse>;
    logout(body: LogoutRequest): Promise<LogoutResponse>;
    verifyEmail(body: VerifyEmailRequest): Promise<VerifyEmailResponse>;
    resendVerification(body: ResendVerificationRequest): Promise<ResendVerificationResponse>;
    requestPasswordReset(body: RequestPasswordResetRequest): Promise<RequestPasswordResetResponse>;
    confirmResetPassword(body: ConfirmResetPasswordRequest): Promise<ConfirmResetPasswordResponse>;
    resendResetPasswordCode(
        body: RequestPasswordResetRequest,
    ): Promise<RequestPasswordResetResponse>;
    resetPassword(body: ResetPasswordRequest): Promise<ResetPasswordResponse>;
    mobileOAuth(body: MobileOAuthRequest): Promise<MobileOAuthResponse>;
    completeOAuth(body: CompleteOAuthRequest): Promise<CompleteOAuthResponse>;
    requestEmailChange(body: RequestEmailChangeRequest): Promise<RequestEmailChangeResponse>;
    verifyEmailChange(body: VerifyEmailChangeRequest): Promise<VerifyEmailChangeResponse>;
    getMe(): Promise<GetMeResponse>;
}
