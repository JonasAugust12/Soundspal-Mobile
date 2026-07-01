/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const BASE_URL = 'https://talentlink.io.vn/api/v1';
const TEST_TIMEOUT = 10000;

describe('Messaging API Integration Tests', () => {
    describe('Protected Endpoints (Auth Required)', () => {
        it(
            'GET /conversations - should respond with 401 without token',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/conversations`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /conversations/:id - should respond with 401 without token',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/conversations/test-conversation-id`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /messages/conversation/:id - should respond with 401 without token',
            async () => {
                try {
                    await axios.get(`${BASE_URL}/messages/conversation/test-conversation-id`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'GET /messages/conversation/:id/unread-count - should respond with 401 without token',
            async () => {
                try {
                    await axios.get(
                        `${BASE_URL}/messages/conversation/test-conversation-id/unread-count`,
                    );
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /conversations - should respond with 401 without token',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/conversations`, {
                        name: 'Test Conversation',
                        isGroup: false,
                        participantIds: ['user-id'],
                    });
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'DELETE /conversations/:id - should respond with 401 without token',
            async () => {
                try {
                    await axios.delete(`${BASE_URL}/conversations/test-conversation-id`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /messages - should respond with 401 without token',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/messages`, {
                        conversationId: 'test-id',
                        content: 'Test message',
                    });
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'PUT /messages/:id - should respond with 401 without token',
            async () => {
                try {
                    await axios.put(`${BASE_URL}/messages/test-message-id`, {
                        content: 'Updated message',
                    });
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'DELETE /messages/:id - should respond with 401 without token',
            async () => {
                try {
                    await axios.delete(`${BASE_URL}/messages/test-message-id`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /messages/:id/read - should respond with 401 without token',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/messages/test-message-id/read`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );

        it(
            'POST /messages/conversation/:id/read - should respond with 401 without token',
            async () => {
                try {
                    await axios.post(`${BASE_URL}/messages/conversation/test-conversation-id/read`);
                } catch (error: any) {
                    expect(error.response?.status).toBe(401);
                    expect(error.response).toBeDefined();
                }
            },
            TEST_TIMEOUT,
        );
    });
});
