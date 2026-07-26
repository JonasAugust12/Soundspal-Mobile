import { normalizeBlogTopics } from '@/features/blog/data/mappers/blogTopicMapper';

describe('normalizeBlogTopics', () => {
    it('parses the nested {data:{items}} envelope with id/name/slug', () => {
        const raw = {
            data: {
                items: [
                    { id: 'uuid-1', name: 'Xu hướng âm nhạc', slug: 'xu-huong' },
                    { id: 'uuid-2', name: 'Kinh doanh âm nhạc', slug: 'kinh-doanh' },
                ],
            },
        };
        const topics = normalizeBlogTopics(raw);
        expect(topics).toHaveLength(2);
        expect(topics[0]).toMatchObject({
            id: 'uuid-1',
            name: 'Xu hướng âm nhạc',
            slug: 'xu-huong',
        });
    });

    it('accepts a bare array and the {topics} / {data:[]} shapes', () => {
        expect(normalizeBlogTopics([{ id: 'a', name: 'A' }])).toHaveLength(1);
        expect(normalizeBlogTopics({ topics: [{ id: 'b', name: 'B' }] })).toHaveLength(1);
        expect(normalizeBlogTopics({ data: [{ id: 'c', name: 'C' }] })).toHaveLength(1);
    });

    it('accepts string topics and derives id/slug from the name', () => {
        const topics = normalizeBlogTopics(['Sản xuất']);
        expect(topics).toHaveLength(1);
        expect(topics[0].name).toBe('Sản xuất');
        expect(topics[0].id).toBe('san-xuat');
        expect(topics[0].slug).toBe('san-xuat');
    });

    it('falls back to slug for id when id is missing', () => {
        const topics = normalizeBlogTopics([{ name: 'Hợp tác', slug: 'hop-tac' }]);
        expect(topics[0].id).toBe('hop-tac');
    });

    it('de-dupes by id and drops null/non-object rows (name falls back to id)', () => {
        const topics = normalizeBlogTopics([
            { id: 'x', name: 'One' },
            { id: 'x', name: 'Dup' },
            { id: 'y' }, // no name → falls back to id 'y'
            null,
            42,
        ]);
        expect(topics.map((t) => t.id)).toEqual(['x', 'y']);
        expect(topics.find((t) => t.id === 'y')?.name).toBe('y');
    });

    it('returns [] for empty / malformed payloads', () => {
        expect(normalizeBlogTopics(undefined)).toEqual([]);
        expect(normalizeBlogTopics({})).toEqual([]);
        expect(normalizeBlogTopics({ data: { items: 'nope' } })).toEqual([]);
    });
});
