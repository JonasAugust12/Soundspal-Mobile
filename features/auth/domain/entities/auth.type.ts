export type UserRole = 'producer' | 'singer' | 'venue';

export interface LoginRequest {
    identifier: string;
    password: string;
}

export interface LoginResponse {
    code: number;
    message: string;
    data: {
        access_token: string;
        refresh_token: string;
        token_type: string;
    };
}

export interface SignupRequest {
    display_name: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface SignupResponse {
    code: number;
    message: string;
    data: {
        id: string;
        display_name: string;
        email: string;
        role: UserRole;
        created_at: string;
    } | null;
}

export interface LogoutRequest {
    refresh_token: string;
}

export interface LogoutResponse {
    code: number;
    data: null;
    message: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface RefreshTokenResponse {
    code: number;
    data: {
        access_token: string;
        refresh_token: string;
        token_type: string;
    } | null;
    message: string;
}

export interface VerifyEmailRequest {
    code: string;
    email: string;
}

export interface VerifyEmailResponse {
    code: number;
    data: null;
    message: string;
}

export interface ResendVerificationRequest {
    email: string;
}

export interface ResendVerificationResponse {
    code: number;
    data: null;
    message: string;
}

export interface RequestPasswordResetRequest {
    email: string;
}

export interface RequestPasswordResetResponse {
    code: number;
    data: null;
    message: string;
}

export interface ConfirmResetPasswordRequest {
    email: string;
    reset_code: string;
}

export interface ConfirmResetPasswordResponse {
    code: number;
    data: {
        reset_token: string;
    };
    message: string;
}

export interface ResetPasswordRequest {
    email: string;
    new_password: string;
    reset_token: string;
}

export interface ResetPasswordResponse {
    code: number;
    data: null;
    message: string;
}

// Change Email Types
export interface RequestEmailChangeRequest {
    new_email: string;
}

export interface RequestEmailChangeResponse {
    code: number;
    data: null;
    message: string;
}

export interface VerifyEmailChangeRequest {
    new_email: string;
    code: string;
}

export interface VerifyEmailChangeResponse {
    code: number;
    data: null;
    message: string;
}

// Current User (/users/me) — dùng khi khởi động app để làm mới thông tin user
export interface MeUser {
    id: string;
    email: string;
    role: string;
    is_verified?: boolean;
    username?: string;
    avatar_url?: string;
    display_name?: string;
    tier?: string;
}

export interface GetMeResponse {
    message: string;
    data: MeUser;
}

// Google OAuth Types
export interface MobileOAuthRequest {
    code: string;
}

export interface MobileOAuthResponse {
    code: number;
    message: string;
    data: {
        access_token?: string;
        refresh_token?: string;
        is_registered: boolean;
        registration_token?: string;
    };
}

export interface CompleteOAuthRequest {
    registration_token: string;
    role: UserRole;
    username: string;
}

export interface CompleteOAuthResponse {
    code: number;
    message: string;
    data: {
        access_token: string;
        refresh_token: string;
        is_registered: boolean;
        registration_token?: string;
    };
}
