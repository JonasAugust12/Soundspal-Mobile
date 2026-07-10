import { MOCK_JOBS, MOCK_JOB_ID_PREFIX, findMockJobById } from '@/mock-data/jobs';
import {
    formatBudget,
    formatDate,
    formatJobType,
} from '@/features/jobs/domain/utils/jobFormatters';

const ARTIST_TYPES = ['singer', 'producer', 'venue'];

describe('MOCK_JOBS', () => {
    it('có nhiều job và id đều mang prefix mock', () => {
        expect(MOCK_JOBS.length).toBeGreaterThanOrEqual(5);
        MOCK_JOBS.forEach((job) => {
            expect(job.id.startsWith(MOCK_JOB_ID_PREFIX)).toBe(true);
        });
    });

    it('id không trùng nhau', () => {
        const ids = MOCK_JOBS.map((j) => j.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('type luôn nằm trong 3 ArtistType thật', () => {
        MOCK_JOBS.forEach((job) => {
            expect(ARTIST_TYPES).toContain(job.type);
        });
    });

    it('có đủ nội dung tối thiểu để hiển thị ý nghĩa', () => {
        MOCK_JOBS.forEach((job) => {
            expect(job.title.length).toBeGreaterThan(5);
            expect(job.brief_description.length).toBeGreaterThan(0);
            expect(job.description.length).toBeGreaterThan(20);
            expect(job.genres.length).toBeGreaterThan(0);
            expect(job.required_skills.length).toBeGreaterThan(0);
        });
    });

    it('ngày tháng là ISO parse được và deadline còn ở tương lai', () => {
        const now = new Date('2026-07-10T00:00:00.000Z').getTime();
        MOCK_JOBS.forEach((job) => {
            expect(Number.isNaN(new Date(job.created_at).getTime())).toBe(false);
            const deadline = new Date(job.deadline).getTime();
            expect(Number.isNaN(deadline)).toBe(false);
            expect(deadline).toBeGreaterThan(now);
            expect(job.is_deadline_passed).toBe(false);
        });
    });

    it('formatter không vỡ với dữ liệu mock', () => {
        MOCK_JOBS.forEach((job) => {
            expect(formatBudget(job.budget_min, job.budget_max, job.budget_currency)).toMatch(
                /VND/,
            );
            expect(formatDate(job.created_at)).toMatch(/^\d{2}-\d{2}-\d{4}$/);
            expect(formatJobType(job.type)).not.toBe('N/A');
        });
    });
});

describe('findMockJobById', () => {
    it('trả về job đúng theo id', () => {
        const first = MOCK_JOBS[0];
        expect(findMockJobById(first.id)).toBe(first);
    });

    it('trả về undefined với id không phải mock', () => {
        expect(findMockJobById('real-job-123')).toBeUndefined();
    });
});
