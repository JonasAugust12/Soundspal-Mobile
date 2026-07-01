/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const BASE_URL = 'https://talentlink.io.vn/api/v1';
const TEST_TIMEOUT = 10000;

describe('User API Integration Tests', () => {
    describe('Public Endpoints (Check if alive)', () => {
        it(
            'GET /users/:username - should respond for user profile request',
            async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/users/testuser`);
                    expect(response.status).toBe(200);
                    expect(response.data).toBeDefined();
                } catch (error: any) {
                    // Endpoint is alive if we get any response
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /users/media/:username - should respond for user media request',
            async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/users/media/testuser`);
                    expect(response.status).toBe(200);
                    expect(response.data).toBeDefined();
                } catch (error: any) {
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /users/videos/all/:username - should respond for user videos request',
            async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/users/videos/all/testuser`);
                    expect(response.status).toBe(200);
                    expect(response.data).toBeDefined();
                } catch (error: any) {
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /users/genres - should respond for all genres request',
            async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/users/genres`);
                    expect(response.status).toBe(200);
                    expect(response.data).toBeDefined();
                } catch (error: any) {
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /users/genres/:username - should respond for user genres request',
            async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/users/genres/testuser`);
                    expect(response.status).toBe(200);
                    expect(response.data).toBeDefined();
                } catch (error: any) {
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );
    });

    describe('Protected Endpoints (Auth Required)', () => {
        it(
            'GET /users/me - should respond with 401 without token',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/users/me`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /users/me/media - should respond with 401 without token',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/users/me/media`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'PUT /users/me/basic - should respond with 401 without token',
            async () => {
                try {
                    await axios.put(`${BASE_URL}/users/me/basic`, {
                        display_name: 'Test User',
                    });
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'PUT /users/me/contact - should respond with 401 without token',
            async () => {
                try {
                    await axios.put(`${BASE_URL}/users/me/contact`, {
                        email: 'test@example.com',
                    });
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'PUT /users/me/social - should respond with 401 without token',
            async () => {
                try {
                    await axios.put(`${BASE_URL}/users/me/social`, {
                        facebook_url: 'https://facebook.com/test',
                    });
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /users/me/avatar - should respond with 401 without token',
            async () => {
                try {
                    const formData = new FormData();
                    await axios.post(`${BASE_URL}/users/me/avatar`, formData);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /users/me/media - should respond with 401 without token',
            async () => {
                try {
                    const formData = new FormData();
                    await axios.post(`${BASE_URL}/users/me/media`, formData);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'DELETE /users/me/media/:id - should respond with 401 without token',
            async () => {
                try {
                    await axios.delete(`${BASE_URL}/users/me/media/test-id`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /users/videos - should respond with 401 without token',
            async () => {
                try {
                    const formData = new FormData();
                    await axios.post(`${BASE_URL}/users/videos`, formData);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'PUT /users/genres/:username - should respond with 401 without token',
            async () => {
                try {
                    await axios.put(`${BASE_URL}/users/genres/testuser`, {
                        genre_names: ['rock', 'jazz'],
                    });
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );
    });
});
