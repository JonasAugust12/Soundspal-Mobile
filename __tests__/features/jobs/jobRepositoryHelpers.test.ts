import {
    getJobByIdWithOwnedFallback,
    findOwnedJobById,
    reopenOwnedJob,
    buildUpdatePayloadFromJob,
} from '@/features/jobs/data/repositories/jobRepositoryHelpers';
import { jobRemoteDataSource } from '@/features/jobs/data/datasources/jobRemoteDataSource';

jest.mock('@/features/jobs/data/datasources/jobRemoteDataSource', () => ({
    jobRemoteDataSource: {
        getJobById: jest.fn(),
        getMyPosts: jest.fn(),
        updateJob: jest.fn(),
    },
}));

const mockJob = {
    id: 'job-draft-1',
    title: 'Draft job with enough length',
    brief_description: 'Short summary for the job post',
    description: 'This is a detailed job description with more than twenty characters.',
    post_type: 'job_offer',
    type: 'producer',
    recruitment_type: 'part_time',
    location_type: 'onsite',
    location: 'Hanoi',
    budget_min: 100,
    budget_max: 200,
    budget_currency: 'VND',
    payment_type: 'bySession',
    is_negotiable: false,
    experience_level: 'intermediate',
    genres: ['Pop'],
    required_skills: ['Mixing'],
    benefits: ['Flexible hours'],
    status: 'closed',
    visibility: 'public',
} as const;

describe('jobRepositoryHelpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns public job from GET /posts/:id when available', async () => {
        (jobRemoteDataSource.getJobById as jest.Mock).mockResolvedValue(mockJob);

        const result = await getJobByIdWithOwnedFallback('job-draft-1');

        expect(result).toEqual(mockJob);
        expect(jobRemoteDataSource.getMyPosts).not.toHaveBeenCalled();
    });

    it('falls back to /posts/me when public GET returns 404', async () => {
        (jobRemoteDataSource.getJobById as jest.Mock).mockRejectedValue({
            response: { status: 404 },
        });
        (jobRemoteDataSource.getMyPosts as jest.Mock).mockResolvedValue({
            posts: [mockJob],
            pagination: { current_page: 1, total_pages: 1, page_size: 50, total_items: 1 },
        });

        const result = await getJobByIdWithOwnedFallback('job-draft-1');

        expect(result).toEqual(mockJob);
        expect(jobRemoteDataSource.getMyPosts).toHaveBeenCalledWith({ page: 1, pageSize: 50 });
    });

    it('returns null when owned job is not found in /posts/me', async () => {
        (jobRemoteDataSource.getMyPosts as jest.Mock).mockResolvedValue({
            posts: [],
            pagination: { current_page: 1, total_pages: 1, page_size: 50, total_items: 0 },
        });

        const result = await findOwnedJobById('missing-job');

        expect(result).toBeNull();
    });

    it('merges partial form overrides into full update payload', () => {
        const payload = buildUpdatePayloadFromJob(
            mockJob as unknown as import('@/features/jobs/domain/entities/job.type').Job,
            {
                brief_description: 'Updated short summary',
                payment_type: 'byMonth',
            },
        );

        expect(payload.brief_description).toBe('Updated short summary');
        expect(payload.payment_type).toBe('byMonth');
        expect(payload.title).toBe(mockJob.title);
        expect(payload.status).toBe('closed');
    });

    it('reopens closed job via PUT with full post body', async () => {
        (jobRemoteDataSource.getJobById as jest.Mock).mockResolvedValue(mockJob);
        (jobRemoteDataSource.updateJob as jest.Mock).mockResolvedValue({
            ...mockJob,
            status: 'published',
        });

        const result = await reopenOwnedJob('job-draft-1');

        expect(jobRemoteDataSource.updateJob).toHaveBeenCalledWith(
            'job-draft-1',
            buildUpdatePayloadFromJob(
                mockJob as unknown as import('@/features/jobs/domain/entities/job.type').Job,
                {
                    status: 'published',
                },
            ),
        );
        expect(result.status).toBe('published');
    });
});
