import { resolvePushRoute } from '@/features/notifications/domain/utils/resolvePushRoute';
import type { PushNotificationData } from '@/features/notifications/domain/entities/notification.type';

describe('resolvePushRoute (push deep-link: job + tin nhắn)', () => {
    describe('no data / không suy ra được', () => {
        it('trả null khi data undefined', () => {
            expect(resolvePushRoute(undefined)).toBeNull();
        });

        it('trả null khi data null', () => {
            expect(resolvePushRoute(null)).toBeNull();
        });

        it('trả null khi type không xác định', () => {
            expect(resolvePushRoute({ type: 'something_else' })).toBeNull();
        });

        it('trả null khi data rỗng (không type, không route)', () => {
            expect(resolvePushRoute({})).toBeNull();
        });
    });

    describe('new_application → gửi tới venue', () => {
        it('mở danh sách ứng viên của đúng job khi có job_id', () => {
            const data: PushNotificationData = {
                type: 'new_application',
                job_id: 'job-123',
            };
            expect(resolvePushRoute(data)).toBe('/(jobs)/applicants?id=job-123');
        });

        it('trả null khi thiếu job_id (không đủ dữ liệu để điều hướng)', () => {
            expect(resolvePushRoute({ type: 'new_application' })).toBeNull();
        });
    });

    describe('application_status_changed → gửi tới artist', () => {
        it('mở màn "Đơn của tôi"', () => {
            const data: PushNotificationData = {
                type: 'application_status_changed',
                submission_id: 'sub-1',
                job_id: 'job-9',
                new_status: 'accepted',
            };
            expect(resolvePushRoute(data)).toBe('/(jobs)/my-applications');
        });

        it('vẫn mở "Đơn của tôi" kể cả khi chỉ có type', () => {
            expect(resolvePushRoute({ type: 'application_status_changed' })).toBe(
                '/(jobs)/my-applications',
            );
        });
    });

    describe('new_message → gửi tới người nhận tin nhắn', () => {
        it('mở đúng cuộc trò chuyện khi có conversation_id', () => {
            const data: PushNotificationData = {
                type: 'new_message',
                conversation_id: 'conv-42',
                message_id: 'msg-1',
            };
            expect(resolvePushRoute(data)).toBe('/(messages)/detailMessage?conversationId=conv-42');
        });

        it('trả null khi thiếu conversation_id', () => {
            expect(resolvePushRoute({ type: 'new_message' })).toBeNull();
        });

        // Route phải khớp DetailMessageScreen (useLocalSearchParams<{ conversationId }>),
        // KHÔNG phải `/(messages)/<id>` — route đó không tồn tại trong app.
        it('không sinh route dạng /(messages)/<id> (route không tồn tại)', () => {
            const route = resolvePushRoute({ type: 'new_message', conversation_id: 'conv-42' });
            expect(route).not.toBe('/(messages)/conv-42');
            expect(route).toContain('detailMessage');
            expect(route).toContain('conversationId=conv-42');
        });
    });

    // Bug A: messaging-service (chat.gateway.ts) gửi camelCase, KHÔNG kèm `type`,
    // và tự đính `route: "/(messages)/<id>"` — route đó không tồn tại trong app.
    describe('payload THẬT của messaging-service (regression Bug A)', () => {
        const realPayload = {
            conversationId: 'conv-42',
            messageId: 'msg-1',
            route: '/(messages)/conv-42',
        } as PushNotificationData;

        it('bỏ qua route chết, dựng đúng route chat từ conversationId (camelCase)', () => {
            expect(resolvePushRoute(realPayload)).toBe(
                '/(messages)/detailMessage?conversationId=conv-42',
            );
        });

        it('không bao giờ trả về route chết /(messages)/<id>', () => {
            expect(resolvePushRoute(realPayload)).not.toBe('/(messages)/conv-42');
        });

        it('nhận diện chat qua conversationId kể cả khi thiếu type', () => {
            expect(resolvePushRoute({ conversationId: 'c1' })).toBe(
                '/(messages)/detailMessage?conversationId=c1',
            );
        });
    });

    describe('collaboration_* → đề nghị hợp tác', () => {
        it('collaboration_requested mở hub manage', () => {
            expect(resolvePushRoute({ type: 'collaboration_requested' })).toBe(
                '/(profiles)/collab-requests?tab=manage',
            );
        });

        it('collaboration_status_changed mở hub manage', () => {
            expect(
                resolvePushRoute({
                    type: 'collaboration_status_changed',
                    new_status: 'ACCEPTED',
                }),
            ).toBe('/(profiles)/collab-requests?tab=manage');
        });

        it('collaboration_cancelled mở hub manage', () => {
            expect(resolvePushRoute({ type: 'collaboration_cancelled' })).toBe(
                '/(profiles)/collab-requests?tab=manage',
            );
        });
    });

    describe('route/path tường minh chỉ là FALLBACK', () => {
        // Đảo ngược so với trước: route suy ra từ data thắng, vì producer có thể
        // gửi route sai (xem Bug A).
        it('route suy từ type thắng route tường minh do producer gửi', () => {
            const data: PushNotificationData = {
                type: 'new_application',
                job_id: 'job-123',
                route: '/(messages)/42',
            };
            expect(resolvePushRoute(data)).toBe('/(jobs)/applicants?id=job-123');
        });

        it('dùng route tường minh khi không suy ra được từ data', () => {
            expect(resolvePushRoute({ route: '/(blog)/7' })).toBe('/(blog)/7');
        });

        it('dùng path khi không có route', () => {
            expect(resolvePushRoute({ path: '/(blog)/7' })).toBe('/(blog)/7');
        });

        it('type lạ nhưng có route tường minh → dùng route', () => {
            expect(resolvePushRoute({ type: 'something_else', route: '/(blog)/7' })).toBe(
                '/(blog)/7',
            );
        });

        it('route rỗng thì bỏ qua, rơi về nhánh type', () => {
            const data: PushNotificationData = {
                type: 'new_application',
                job_id: 'job-123',
                route: '',
            };
            expect(resolvePushRoute(data)).toBe('/(jobs)/applicants?id=job-123');
        });
    });
});
