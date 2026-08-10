import {
    buildCollabReference,
    getConversationPreview,
    isCollabReference,
    isJobReference,
    isStructuredReference,
    parseCollabReference,
} from '@/features/messaging/domain/utils/messageContent';
import type { Message } from '@/features/messaging/domain/entities/messaging.type';

const COLLAB_ID = 'a1b2c3d4-0000-4000-8000-000000000001';

const message = (content: string): Message =>
    ({
        id: 'm1',
        conversationId: 'c1',
        senderId: 'u1',
        content,
        createdAt: '2026-08-01T00:00:00Z',
    }) as Message;

describe('COLLAB_REF protocol', () => {
    it('builds the wire format the web parses', () => {
        expect(buildCollabReference(COLLAB_ID, 'Chào bạn')).toBe(
            `:::COLLAB_REF:{"id":"${COLLAB_ID}"}:::\nChào bạn`,
        );
    });

    it('round-trips id and user text', () => {
        const parsed = parseCollabReference(buildCollabReference(COLLAB_ID, 'Lịch rehearsal?'));
        expect(parsed).toEqual({ collaborationId: COLLAB_ID, userText: 'Lịch rehearsal?' });
    });

    it('keeps multi-line user text intact', () => {
        const parsed = parseCollabReference(buildCollabReference(COLLAB_ID, 'dòng 1\ndòng 2'));
        expect(parsed?.userText).toBe('dòng 1\ndòng 2');
    });

    it('rejects plain text, a job ref, and a payload without id', () => {
        expect(parseCollabReference('xin chào')).toBeNull();
        expect(parseCollabReference(':::JOB_REF:{"id":"j1"}:::\nhi')).toBeNull();
        expect(parseCollabReference(':::COLLAB_REF:{"title":"x"}:::\nhi')).toBeNull();
    });

    it('does not confuse the two reference kinds', () => {
        const collab = buildCollabReference(COLLAB_ID, 'hi');
        expect(isCollabReference(collab)).toBe(true);
        expect(isJobReference(collab)).toBe(false);
        expect(isStructuredReference(collab)).toBe(true);
        expect(isStructuredReference(':::JOB_REF:{"id":"j1"}:::\nhi')).toBe(true);
        expect(isStructuredReference('hi')).toBe(false);
    });
});

describe('getConversationPreview', () => {
    it('hides the raw COLLAB_REF payload', () => {
        const preview = getConversationPreview(message(buildCollabReference(COLLAB_ID, 'hi')));
        expect(preview).not.toContain(':::');
        expect(preview).toBe('🤝 Hợp tác');
    });

    it('still labels job references', () => {
        expect(getConversationPreview(message(':::JOB_REF:{"id":"j1"}:::\nhi'))).toBe(
            '📋 Đơn ứng tuyển',
        );
    });

    it('falls back to plain content', () => {
        expect(getConversationPreview(message('xin chào'))).toBe('xin chào');
    });
});
