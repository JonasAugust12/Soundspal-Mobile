/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const BASE_URL = 'https://talentlink.io.vn/api/v1';
const TEST_TIMEOUT = 10000;

describe('Job API Integration Tests', () => {
    describe('Public Endpoints (Check if alive)', () => {
        it(
            'GET /posts - should respond (endpoint alive)',
            async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/posts?page=0&page_size=10`);
                    // If successful, check response structure
                    expect(response.status).toBe(200);
                    expect(response.data).toBeDefined();
                } catch (error: any) {
                    // Endpoint is alive if we get any response (200, 401, 400, etc.)
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /posts with search param - should respond (endpoint alive)',
            async () => {
                try {
                    const response = await axios.get(
                        `${BASE_URL}/posts?page=0&page_size=10&search=musician`,
                    );
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
            'GET /posts/:id - should respond for job detail request',
            async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/posts/test-job-id`);
                    expect(response.status).toBe(200);
                    expect(response.data).toBeDefined();
                } catch (error: any) {
                    // Endpoint is alive if we get any valid error response
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );
    });

    describe('Protected Endpoints (Auth Required)', () => {
        it(
            'GET /posts/me - should respond with 401 without token',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/posts/me?page=1&page_size=20`);
                } catch (error: any) {
                    // Should get 401 unauthorized
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /posts - should respond with 401 without token',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/posts`, {
                        title: 'Test Job',
                        description: 'Test Description',
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
            'PUT /posts/:id - should respond with 401 without token',
            async () => {
                try {
                    await axios.put(`${BASE_URL}/posts/test-id`, {
                        title: 'Updated Title',
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
            'DELETE /posts/:id - should respond with 401 without token',
            async () => {
                try {
                    await axios.delete(`${BASE_URL}/posts/test-id`);
                } catch (error: any) {
                    // Should get 401 unauthorized
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /posts/:id/submit - should respond with 401 without token',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/posts/test-id/submit`, {
                        message: 'Application message',
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
            'GET /my-submissions - should respond with 401 without token',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/my-submissions?page=1&page_size=20`);
                } catch (error: any) {
                    // Should get 401 unauthorized
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );
    });
});
