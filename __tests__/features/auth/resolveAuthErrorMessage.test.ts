import { resolveAuthErrorMessage } from '@/features/auth/domain/utils/resolveAuthErrorMessage';
import {
    AuthApiErrorCode,
    AUTH_API_ERROR_MESSAGES,
    AuthErrorContext,
} from '@/features/auth/domain/constants/authApiErrorCode';

describe('resolveAuthErrorMessage', () => {
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
