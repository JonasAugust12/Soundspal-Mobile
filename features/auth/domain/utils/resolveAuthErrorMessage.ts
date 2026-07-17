import {
    AuthApiErrorCode,
    AUTH_API_ERROR_MESSAGES,
    AUTH_BACKEND_ERROR_CODES,
    AUTH_ERROR_CONTEXT_FALLBACKS,
    AuthErrorContext,
} from '@/features/auth/domain/constants/authApiErrorCode';

interface ApiErrorBody {
    code?: number | string;
    /** Mã lỗi dạng snake_case, vd: 'email_not_verified'. */
    error?: string;
    message?: string;
    details?: {
        email?: string;
    };
}

interface AxiosLikeError {
    message?: string;
    code?: string;
    response?: {
        status?: number;
        data?: ApiErrorBody;
    };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type BackendPattern = {
    code: AuthApiErrorCode;
    patterns: RegExp[];
};

const BACKEND_MESSAGE_PATTERNS: BackendPattern[] = [
    {
        code: AuthApiErrorCode.InvalidCredentials,
        patterns: [
            /invalid credentials/i,
            /incorrect password/i,
            /wrong password/i,
            /sai.*mật khẩu/i,
            /email.*password.*incorrect/i,
            /unauthorized/i,
        ],
    },
    {
        code: AuthApiErrorCode.AccountNotVerified,
        patterns: [/not verified/i, /chưa.*xác thực/i, /chưa.*xác minh/i, /email.*not.*verified/i],
    },
    {
        code: AuthApiErrorCode.AccountDisabled,
        patterns: [/disabled/i, /deactivated/i, /bị.*khóa/i, /vô hiệu/i],
    },
    {
        code: AuthApiErrorCode.EmailAlreadyExists,
        patterns: [/email.*already/i, /email.*exists/i, /email.*registered/i, /email.*tồn tại/i],
    },
    {
        code: AuthApiErrorCode.UsernameAlreadyExists,
        patterns: [
            /username.*already/i,
            /username.*exists/i,
            /username.*taken/i,
            /username.*tồn tại/i,
        ],
    },
    {
        code: AuthApiErrorCode.UserNotFound,
        patterns: [/user not found/i, /không tìm thấy.*tài khoản/i, /account not found/i],
    },
    {
        code: AuthApiErrorCode.InvalidVerificationCode,
        patterns: [/invalid.*code/i, /incorrect.*code/i, /mã.*không.*đúng/i, /wrong.*code/i],
    },
    {
        code: AuthApiErrorCode.VerificationCodeExpired,
        patterns: [/code.*expired/i, /mã.*hết hạn/i, /otp.*expired/i],
    },
    {
        code: AuthApiErrorCode.InvalidResetToken,
        patterns: [/invalid.*token/i, /reset.*token.*invalid/i, /token.*invalid/i],
    },
    {
        code: AuthApiErrorCode.ResetTokenExpired,
        patterns: [/token.*expired/i, /reset.*expired/i],
    },
    {
        code: AuthApiErrorCode.InvalidOAuthToken,
        patterns: [/invalid.*oauth/i, /google.*token/i, /authorization.*invalid/i],
    },
    {
        code: AuthApiErrorCode.OAuthRegistrationExpired,
        patterns: [/registration.*expired/i, /registration.*token/i],
    },
    {
        code: AuthApiErrorCode.RateLimited,
        patterns: [/too many/i, /rate limit/i, /quá nhiều/i, /thử lại sau/i],
    },
    {
        code: AuthApiErrorCode.ValidationError,
        patterns: [/validation/i, /invalid input/i, /không hợp lệ/i],
    },
];

const HTTP_STATUS_TO_CODE: Partial<Record<number, AuthApiErrorCode>> = {
    400: AuthApiErrorCode.ValidationError,
    401: AuthApiErrorCode.InvalidCredentials,
    403: AuthApiErrorCode.AccountNotVerified,
    404: AuthApiErrorCode.UserNotFound,
    409: AuthApiErrorCode.EmailAlreadyExists,
    422: AuthApiErrorCode.ValidationError,
    429: AuthApiErrorCode.RateLimited,
};

function normalizeMessage(message?: string): string {
    return (message || '').trim().toLowerCase();
}

function matchBackendCode(message: string): AuthApiErrorCode | null {
    const normalized = normalizeMessage(message);
    if (!normalized) {
        return null;
    }

    for (const entry of BACKEND_MESSAGE_PATTERNS) {
        if (entry.patterns.some((pattern) => pattern.test(normalized))) {
            return entry.code;
        }
    }

    return null;
}

function isNetworkError(error: AxiosLikeError): boolean {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        return true;
    }

    const message = normalizeMessage(error.message);
    return message.includes('network error') || message.includes('timeout');
}

/**
 * Suy ra mã lỗi nghiệp vụ từ error của axios.
 * Thứ tự ưu tiên: lỗi mạng → mã lỗi backend → message backend → HTTP status.
 */
export function resolveAuthErrorCode(error: unknown): AuthApiErrorCode {
    const axiosError = error as AxiosLikeError;
    const body = axiosError.response?.data;

    if (isNetworkError(axiosError)) {
        return AuthApiErrorCode.NetworkError;
    }

    if (body?.error) {
        const backendCode = AUTH_BACKEND_ERROR_CODES[normalizeMessage(body.error)];
        if (backendCode) {
            return backendCode;
        }
    }

    if (body?.message) {
        const matchedCode = matchBackendCode(body.message);
        if (matchedCode) {
            return matchedCode;
        }
    }

    const status = axiosError.response?.status;
    const statusCode = status ? HTTP_STATUS_TO_CODE[status] : undefined;
    if (statusCode) {
        return statusCode;
    }

    return AuthApiErrorCode.Unknown;
}

/**
 * Email của tài khoản chưa xác thực, để điều hướng sang màn nhập mã xác nhận.
 * Backend trả về trong `details.email`; nếu thiếu thì dùng identifier khi nó là email
 * (identifier cũng có thể là username — khi đó không đủ dữ liệu để verify).
 */
export function resolveUnverifiedEmail(error: unknown, identifier?: string): string | null {
    const detailsEmail = (error as AxiosLikeError).response?.data?.details?.email?.trim();
    if (detailsEmail && EMAIL_PATTERN.test(detailsEmail)) {
        return detailsEmail;
    }

    const trimmedIdentifier = identifier?.trim();
    if (trimmedIdentifier && EMAIL_PATTERN.test(trimmedIdentifier)) {
        return trimmedIdentifier;
    }

    return null;
}

export function resolveAuthErrorMessage(
    error: unknown,
    context: AuthErrorContext = AuthErrorContext.Generic,
): string {
    const axiosError = error as AxiosLikeError;
    const backendMessage = axiosError.response?.data?.message;
    const code = resolveAuthErrorCode(error);

    if (code !== AuthApiErrorCode.Unknown) {
        return AUTH_API_ERROR_MESSAGES[code];
    }

    if (backendMessage && backendMessage.trim().length > 0) {
        return backendMessage;
    }

    if (axiosError.message && !axiosError.message.startsWith('Request failed with status code')) {
        return axiosError.message;
    }

    return AUTH_ERROR_CONTEXT_FALLBACKS[context];
}
