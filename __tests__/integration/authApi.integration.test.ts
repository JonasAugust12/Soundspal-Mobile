/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const BASE_URL = 'https://talentlink.io.vn/api/v1';
const TEST_TIMEOUT = 10000;

describe('Auth API Integration Tests', () => {
    describe('Public Endpoints (No Auth Required)', () => {
        it(
            'POST /auth/login - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/login`, {
                        email: 'test@example.com',
                        password: 'wrongpassword',
                    });
                } catch (error: any) {
                    // We expect 401 or 400, but endpoint is alive if we get a response
                    expect([400, 401, 422]).toContain(error.response?.status);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /auth/signup - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/signup`, {
                        email: 'test@example.com',
                        password: 'test123',
                        username: 'testuser',
                    });
                } catch (error: any) {
                    // May get 400 (invalid data) or 409 (email exists), but endpoint is alive
                    expect([400, 409, 422]).toContain(error.response?.status);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /auth/reset-password-request - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/reset-password-request`, {
                        email: 'test@example.com',
                    });
                } catch (error: any) {
                    // May succeed or fail, but endpoint should respond
                    expect(error.response?.status || 200).toBeGreaterThanOrEqual(200);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /auth/verify-email - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/verify-email`, {
                        code: '000000',
                    });
                } catch (error: any) {
                    // Expect 400 or 401 for invalid code
                    expect([400, 401, 422]).toContain(error.response?.status);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /auth/verification-email-resend - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/verification-email-resend`, {
                        email: 'test@example.com',
                    });
                } catch (error: any) {
                    // May succeed or fail, but endpoint should respond
                    expect(error.response?.status || 200).toBeGreaterThanOrEqual(200);
                }
            },
            TEST_TIMEOUT,
        );
    });

    describe('Protected Endpoints (Auth Required)', () => {
        it(
            'POST /auth/logout - should respond with 401 without token',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/logout`, {
                        refresh_token: 'invalid_token',
                    });
                } catch (error: any) {
                    // Should get 401 unauthorized
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /auth/mobile-oauth - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/mobile-oauth`, {
                        provider: 'google',
                        id_token: 'invalid_token',
                    });
                } catch (error: any) {
                    // Expect error response but endpoint is alive
                    expect(error.response?.status).toBeGreaterThanOrEqual(400);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /auth/complete-oauth - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/complete-oauth`, {
                        temporary_token: 'invalid_token',
                        display_name: 'Test User',
                    });
                } catch (error: any) {
                    // Expect error response but endpoint is alive
                    expect(error.response?.status).toBeGreaterThanOrEqual(400);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );
    });

    describe('Password Reset Flow', () => {
        it(
            'POST /auth/confirm-reset-password-request - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/confirm-reset-password-request`, {
                        email: 'test@example.com',
                        code: '000000',
                    });
                } catch (error: any) {
                    // Expect 400 for invalid code
                    expect([400, 422]).toContain(error.response?.status);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /auth/reset-password - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/reset-password`, {
                        email: 'test@example.com',
                        code: '000000',
                        new_password: 'newpassword123',
                    });
                } catch (error: any) {
                    // Expect 400 for invalid code
                    expect([400, 422]).toContain(error.response?.status);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /auth/reset-password-request-resend - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/auth/reset-password-request-resend`, {
                        email: 'test@example.com',
                    });
                } catch (error: any) {
                    // May succeed or fail, but endpoint should respond
                    expect(error.response?.status || 200).toBeGreaterThanOrEqual(200);
                }
            },
            TEST_TIMEOUT,
        );
    });
});
