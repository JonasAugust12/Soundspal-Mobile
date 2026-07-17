import { decodeJWT, isTokenValid, getUserFromToken } from '@/shared/utils/jwt';

describe('jwt', () => {
    // Valid JWT token for testing (payload: {sub: "123", email: "test@example.com", role: "user", is_verified: true, username: "testuser", avatar_url: "https://example.com/avatar.jpg", display_name: "Test User", exp: 9999999999})
    const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlzX3ZlcmlmaWVkIjp0cnVlLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwiYXZhdGFyX3VybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vYXZhdGFyLmpwZyIsImRpc3BsYXlfbmFtZSI6IlRlc3QgVXNlciIsImV4cCI6OTk5OTk5OTk5OX0.X2Yx5qKZYH0xPz-rQ8uN9_RtJd7WvXzYgHcKpLmNqJs';

    // Expired JWT token (exp in the past)
    const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlzX3ZlcmlmaWVkIjp0cnVlLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwiYXZhdGFyX3VybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vYXZhdGFyLmpwZyIsImRpc3BsYXlfbmFtZSI6IlRlc3QgVXNlciIsImV4cCI6MTYwMDAwMDAwMH0.YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY';

    describe('decodeJWT', () => {
        it('should decode a valid JWT token', () => {
            const decoded = decodeJWT(validToken);
            expect(decoded).not.toBeNull();
            expect(decoded?.sub).toBe('123');
            expect(decoded?.email).toBe('test@example.com');
            expect(decoded?.role).toBe('user');
            expect(decoded?.is_verified).toBe(true);
            expect(decoded?.username).toBe('testuser');
        });

        it('should return null for invalid token format', () => {
            expect(decodeJWT('invalid')).toBeNull();
            expect(decodeJWT('invalid.token')).toBeNull();
            expect(decodeJWT('')).toBeNull();
        });

        it('should return null for malformed base64', () => {
            expect(decodeJWT('header.!!!invalid-base64!!!.signature')).toBeNull();
        });

        it('should handle tokens with 3 parts but invalid JSON', () => {
            const invalidJsonToken = 'eyJhbGciOiJIUzI1NiJ9.aW52YWxpZC1qc29u.signature';
            expect(decodeJWT(invalidJsonToken)).toBeNull();
        });
    });

    describe('isTokenValid', () => {
        it('should return true for valid non-expired token', () => {
            expect(isTokenValid(validToken)).toBe(true);
        });

        it('should return false for expired token', () => {
            expect(isTokenValid(expiredToken)).toBe(false);
        });

        it('should return false for invalid token', () => {
            expect(isTokenValid('invalid')).toBe(false);
            expect(isTokenValid('')).toBe(false);
        });

        it('should return false for token without exp claim', () => {
            // Token without exp: {sub: "123", email: "test@example.com"}
            const tokenWithoutExp =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.4Adcj0vQKJk5FP6H8rJdQjhJfJ4rQ0xKwP0YrH0LkLE';
            expect(isTokenValid(tokenWithoutExp)).toBe(false);
        });
    });

    describe('getUserFromToken', () => {
        it('should extract user data from valid token', () => {
            const user = getUserFromToken(validToken);
            expect(user).not.toBeNull();
            expect(user?.id).toBe('123');
            expect(user?.email).toBe('test@example.com');
            expect(user?.role).toBe('user');
            expect(user?.is_verified).toBe(true);
            expect(user?.username).toBe('testuser');
            expect(user?.avatar_url).toBe('https://example.com/avatar.jpg');
            expect(user?.display_name).toBe('Test User');
        });

        it('should return null for invalid token', () => {
            expect(getUserFromToken('invalid')).toBeNull();
            expect(getUserFromToken('')).toBeNull();
        });

        it('should handle missing fields with default values', () => {
            // Token with minimal data: {sub: "456"}
            const minimalToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NTYifQ.Iy0DjhPpJ8h8QGZhj2kMYvJ4rNW0Kx0R1Hw8LrK0TlI';
            const user = getUserFromToken(minimalToken);
            expect(user).not.toBeNull();
            expect(user?.id).toBe('456');
            expect(user?.email).toBe('');
            expect(user?.role).toBe('');
            expect(user?.is_verified).toBe(false);
            expect(user?.username).toBe('');
            expect(user?.avatar_url).toBe('');
            expect(user?.display_name).toBe('');
        });

        it('should convert is_verified to boolean', () => {
            // Token with is_verified as falsy value
            const tokenWithFalseVerified =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ODkiLCJpc192ZXJpZmllZCI6ZmFsc2V9.ZXhhbXBsZS1zaWduYXR1cmU';
            const user = getUserFromToken(tokenWithFalseVerified);
            expect(user?.is_verified).toBe(false);
        });
    });
});
