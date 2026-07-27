import {
    canCancelCollab,
    canRespondToCollab,
    formatCollabDate,
    isCollabOverdue,
    toApiDate,
} from '@/features/collabRequests/domain/utils/collabRequestHelpers';
import type { CollabRequest } from '@/features/collabRequests/domain/entities/collabRequest.type';

const base: CollabRequest = {
    id: 'c1',
    sender: { id: 's1', username: 'alice', display_name: 'Alice' },
    receiver: { id: 'r1', username: 'bob', display_name: 'Bob' },
    title: 'EP',
    description: 'desc',
    start_date: '2026-08-01',
    end_date: '2026-08-05',
    is_public: true,
    status: 'PENDING',
    created_at: '2026-07-28T00:00:00Z',
    updated_at: '2026-07-28T00:00:00Z',
};

describe('collabRequestHelpers', () => {
    it('toApiDate converts yyyy-MM-dd to dd-MM-yyyy', () => {
        expect(toApiDate('2026-08-01')).toBe('01-08-2026');
    });

    it('formatCollabDate formats for display', () => {
        expect(formatCollabDate('2026-08-01')).toBe('01/08/2026');
    });

    it('overdue only for PENDING past end_date', () => {
        const overdue = isCollabOverdue(
            { ...base, end_date: '2020-01-01' },
            new Date('2026-07-28T12:00:00'),
        );
        expect(overdue).toBe(true);
        expect(
            isCollabOverdue(
                { ...base, status: 'ACCEPTED', end_date: '2020-01-01' },
                new Date('2026-07-28T12:00:00'),
            ),
        ).toBe(false);
    });

    it('receiver can respond when pending and not overdue', () => {
        expect(canRespondToCollab({ ...base, end_date: '2099-01-01' }, 'r1')).toBe(true);
        expect(canRespondToCollab({ ...base, end_date: '2099-01-01' }, 's1')).toBe(false);
        expect(canRespondToCollab({ ...base, end_date: '2020-01-01' }, 'r1')).toBe(false);
    });

    it('can cancel pending or accepted', () => {
        expect(canCancelCollab(base)).toBe(true);
        expect(canCancelCollab({ ...base, status: 'ACCEPTED' })).toBe(true);
        expect(canCancelCollab({ ...base, status: 'REJECTED' })).toBe(false);
    });
});
