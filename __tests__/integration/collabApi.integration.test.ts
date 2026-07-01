/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const BASE_URL = 'https://talentlink.io.vn/api/v1';
const TEST_TIMEOUT = 10000;

describe('Collaboration API Integration Tests', () => {
    describe('Protected Endpoints (Auth Required)', () => {
        it(
            'GET /my-submissions - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/my-submissions?page=1&page_size=20`);
                    // If success, endpoint is alive
                } catch (error: any) {
                    // Endpoint is alive if we get any error response
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /posts/me - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/posts/me?page=1&page_size=20`);
                } catch (error: any) {
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /posts/:id/submissions - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.get(
                        `${BASE_URL}/posts/test-job-id/submissions?page=1&page_size=20`,
                    );
                } catch (error: any) {
                    // May get 401 (auth required) or 404 (not found)
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /my-posts/submissions - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/my-posts/submissions?page=1&page_size=20`);
                } catch (error: any) {
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'PUT /submissions/:id/withdraw - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.put(`${BASE_URL}/submissions/test-submission-id/withdraw`, {
                        reason: 'Test reason',
                    });
                } catch (error: any) {
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'PUT /submissions/:id/review - should respond (endpoint alive)',
            async () => {
                try {
                    await axios.put(`${BASE_URL}/submissions/test-submission-id/review`, {
                        action: 'accept',
                    });
                } catch (error: any) {
                    expect(error.response).toBeDefined();
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            },
            TEST_TIMEOUT,
        );
    });
});
