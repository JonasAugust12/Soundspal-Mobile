import {
    resolveAuthErrorCode,
    resolveAuthErrorMessage,
    resolveUnverifiedEmail,
} from '@/features/auth/domain/utils/resolveAuthErrorMessage';
import {
    AuthApiErrorCode,
    AUTH_API_ERROR_MESSAGES,
    AuthErrorContext,
} from '@/features/auth/domain/constants/authApiErrorCode';

/** Body thật của POST /auth/login khi tài khoản chưa xác minh email. */
const emailNotVerifiedError = {
    message: 'Request failed with status code 403',
    response: {
        status: 403,
        data: {
            error: 'email_not_verified',
            message: 'Email chưa được xác minh. Vui lòng kiểm tra hộp thư và xác minh tài khoản.',
            details: { email: 'dientran18012004@gmail.com' },
        },
    },
};

describe('resolveAuthErrorCode', () => {
    it('maps the backend `error` field to a business error code', () => {
        expect(resolveAuthErrorCode(emailNotVerifiedError)).toBe(
            AuthApiErrorCode.AccountNotVerified,
        );
    });

    it('prioritises network errors over any other code', () => {
        expect(resolveAuthErrorCode({ code: 'ERR_NETWORK', message: 'Network Error' })).toBe(
            AuthApiErrorCode.NetworkError,
        );
    });

    it('falls back to HTTP status when no backend code is present', () => {
        expect(resolveAuthErrorCode({ response: { status: 429 } })).toBe(
            AuthApiErrorCode.RateLimited,
        );
    });

    it('returns Unknown when nothing can be inferred', () => {
        expect(resolveAuthErrorCode({ message: 'boom' })).toBe(AuthApiErrorCode.Unknown);
    });
});

describe('resolveUnverifiedEmail', () => {
    it('reads the email from details.email', () => {
        expect(resolveUnverifiedEmail(emailNotVerifiedError, 'dientran')).toBe(
            'dientran18012004@gmail.com',
        );
    });

    it('falls back to the identifier when it is an email', () => {
        expect(resolveUnverifiedEmail({ response: { status: 403, data: {} } }, 'a@b.com')).toBe(
            'a@b.com',
        );
    });

    it('returns null when the identifier is a username and backend sent no email', () => {
        expect(
            resolveUnverifiedEmail({ response: { status: 403, data: {} } }, 'dientran'),
        ).toBeNull();
    });
});

describe('resolveAuthErrorMessage', () => {
    it('maps the email_not_verified body to the canonical message', () => {
        expect(resolveAuthErrorMessage(emailNotVerifiedError, AuthErrorContext.Login)).toBe(
            AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.AccountNotVerified],
        );
    });

    it('never leaks the raw "Request failed with status code" message', () => {
        expect(resolveAuthErrorMessage({ message: 'Request failed with status code 500' })).toBe(
            AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.Unknown],
        );
    });

    it('keeps the backend message when no error code matches', () => {
        expect(
            resolveAuthErrorMessage({ response: { data: { message: 'Máy chủ bảo trì' } } }),
        ).toBe('Máy chủ bảo trì');
    });

    it('maps invalid credentials backend message', () => {
        const message = resolveAuthErrorMessage(
            {
                response: {
                    status: 401,
                    data: { message: 'Invalid credentials' },
                },
            },
            AuthErrorContext.Login,
        );

        expect(message).toBe(AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.InvalidCredentials]);
    });

    it('maps email already exists from HTTP 409', () => {
        const message = resolveAuthErrorMessage(
            {
                response: {
                    status: 409,
                    data: { message: 'Conflict' },
                },
            },
            AuthErrorContext.Register,
        );

        expect(message).toBe(AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.EmailAlreadyExists]);
    });

    it('maps invalid verification code message', () => {
        const message = resolveAuthErrorMessage(
            {
                response: {
                    status: 400,
                    data: { message: 'Invalid verification code' },
                },
            },
            AuthErrorContext.VerifyEmail,
        );

        expect(message).toBe(AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.InvalidVerificationCode]);
    });

    it('returns context fallback for unknown errors', () => {
        const message = resolveAuthErrorMessage({}, AuthErrorContext.ForgotPassword);

        expect(message).toBe('Không thể gửi mã xác thực. Vui lòng thử lại.');
    });

    it('returns network error message', () => {
        const message = resolveAuthErrorMessage(
            { code: 'ERR_NETWORK', message: 'Network Error' },
            AuthErrorContext.Login,
        );

        expect(message).toBe(AUTH_API_ERROR_MESSAGES[AuthApiErrorCode.NetworkError]);
    });
});
