export enum AuthApiErrorCode {
    InvalidCredentials = 'INVALID_CREDENTIALS',
    AccountNotVerified = 'ACCOUNT_NOT_VERIFIED',
    AccountDisabled = 'ACCOUNT_DISABLED',
    EmailAlreadyExists = 'EMAIL_ALREADY_EXISTS',
    UsernameAlreadyExists = 'USERNAME_ALREADY_EXISTS',
    UserNotFound = 'USER_NOT_FOUND',
    InvalidVerificationCode = 'INVALID_VERIFICATION_CODE',
    VerificationCodeExpired = 'VERIFICATION_CODE_EXPIRED',
    InvalidResetToken = 'INVALID_RESET_TOKEN',
    ResetTokenExpired = 'RESET_TOKEN_EXPIRED',
    InvalidOAuthToken = 'INVALID_OAUTH_TOKEN',
    OAuthRegistrationExpired = 'OAUTH_REGISTRATION_EXPIRED',
    RateLimited = 'RATE_LIMITED',
    NetworkError = 'NETWORK_ERROR',
    ValidationError = 'VALIDATION_ERROR',
    Unknown = 'UNKNOWN',
}

export enum AuthErrorContext {
    Login = 'login',
    Register = 'register',
    ForgotPassword = 'forgotPassword',
    VerifyResetCode = 'verifyResetCode',
    ResetPassword = 'resetPassword',
    VerifyEmail = 'verifyEmail',
    ResendVerification = 'resendVerification',
    ResendResetCode = 'resendResetCode',
    GoogleSignIn = 'googleSignIn',
    CompleteOAuth = 'completeOAuth',
    Logout = 'logout',
    Generic = 'generic',
}

/**
 * Map field `error` trong body lỗi của backend sang AuthApiErrorCode.
 * Ưu tiên hơn việc đoán qua message/HTTP status. Thêm key mới khi backend bổ sung mã lỗi.
 */
export const AUTH_BACKEND_ERROR_CODES: Record<string, AuthApiErrorCode> = {
    email_not_verified: AuthApiErrorCode.AccountNotVerified,
};

export const AUTH_API_ERROR_MESSAGES: Record<AuthApiErrorCode, string> = {
    [AuthApiErrorCode.InvalidCredentials]:
        'Email/username hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
    [AuthApiErrorCode.AccountNotVerified]:
        'Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư của bạn.',
    [AuthApiErrorCode.AccountDisabled]:
        'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ bộ phận hỗ trợ.',
    [AuthApiErrorCode.EmailAlreadyExists]:
        'Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.',
    [AuthApiErrorCode.UsernameAlreadyExists]:
        'Username này đã được sử dụng. Vui lòng chọn username khác.',
    [AuthApiErrorCode.UserNotFound]: 'Không tìm thấy tài khoản với thông tin đã nhập.',
    [AuthApiErrorCode.InvalidVerificationCode]:
        'Mã xác thực không đúng. Vui lòng kiểm tra lại hoặc gửi mã mới.',
    [AuthApiErrorCode.VerificationCodeExpired]: 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.',
    [AuthApiErrorCode.InvalidResetToken]:
        'Phiên đặt lại mật khẩu không hợp lệ. Vui lòng thử lại từ đầu.',
    [AuthApiErrorCode.ResetTokenExpired]:
        'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới.',
    [AuthApiErrorCode.InvalidOAuthToken]: 'Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.',
    [AuthApiErrorCode.OAuthRegistrationExpired]:
        'Phiên hoàn tất đăng ký đã hết hạn. Vui lòng đăng nhập Google lại.',
    [AuthApiErrorCode.RateLimited]: 'Bạn thao tác quá nhanh. Vui lòng đợi vài phút rồi thử lại.',
    [AuthApiErrorCode.NetworkError]: 'Không thể kết nối máy chủ. Kiểm tra mạng và thử lại.',
    [AuthApiErrorCode.ValidationError]: 'Thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại.',
    [AuthApiErrorCode.Unknown]: 'Đã xảy ra lỗi. Vui lòng thử lại.',
};

export const AUTH_ERROR_CONTEXT_FALLBACKS: Record<AuthErrorContext, string> = {
    [AuthErrorContext.Login]: AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.InvalidCredentials],
    [AuthErrorContext.Register]: 'Không thể đăng ký tài khoản. Vui lòng thử lại.',
    [AuthErrorContext.ForgotPassword]: 'Không thể gửi mã xác thực. Vui lòng thử lại.',
    [AuthErrorContext.VerifyResetCode]:
        AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.InvalidVerificationCode],
    [AuthErrorContext.ResetPassword]: 'Không thể đặt lại mật khẩu. Vui lòng thử lại.',
    [AuthErrorContext.VerifyEmail]:
        AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.InvalidVerificationCode],
    [AuthErrorContext.ResendVerification]: 'Không thể gửi lại mã xác thực. Vui lòng thử lại.',
    [AuthErrorContext.ResendResetCode]: 'Không thể gửi lại mã. Vui lòng thử lại.',
    [AuthErrorContext.GoogleSignIn]: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
    [AuthErrorContext.CompleteOAuth]: 'Không thể hoàn tất đăng ký. Vui lòng thử lại.',
    [AuthErrorContext.Logout]: 'Không thể đăng xuất từ server, nhưng đã xóa session local.',
    [AuthErrorContext.Generic]: AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.Unknown],
};
