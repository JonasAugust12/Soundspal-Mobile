import type {
    Job,
    UpdateJobRequest,
    PostType,
    ArtistType,
    RecruitmentType,
    LocationType,
    BudgetCurrency,
    PaymentType,
    ExperienceLevel,
    PostStatus,
    PostVisibility,
} from '@/features/jobs/domain/entities/job.type';
import { jobRemoteDataSource } from '@/features/jobs/data/datasources/jobRemoteDataSource';
import { isApiNotFound } from '@/shared/utils/apiError';

const MY_POSTS_LOOKUP_PAGE_SIZE = 50;

export async function findOwnedJobById(jobId: string): Promise<Job | null> {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        const response = await jobRemoteDataSource.getMyPosts({
            page,
            pageSize: MY_POSTS_LOOKUP_PAGE_SIZE,
        });

        const found = response.posts?.find((post) => post.id === jobId);
        if (found) {
            return found;
        }

        totalPages = response.pagination?.total_pages ?? 1;
        if ((response.posts?.length ?? 0) === 0) {
            break;
        }
        page += 1;
    }

    return null;
}

export async function getJobByIdWithOwnedFallback(jobId: string): Promise<Job> {
    try {
        return await jobRemoteDataSource.getJobById(jobId);
    } catch (error) {
        if (!isApiNotFound(error)) {
            throw error;
        }

        const ownedJob = await findOwnedJobById(jobId);
        if (ownedJob) {
            return ownedJob;
        }

        throw error;
    }
}

export function buildUpdatePayloadFromJob(
    job: Job,
    overrides: Partial<UpdateJobRequest> = {},
): UpdateJobRequest {
    return {
        post_type: job.post_type as PostType,
        title: job.title,
        brief_description: job.brief_description,
        description: job.description,
        type: job.type as ArtistType,
        recruitment_type: job.recruitment_type as RecruitmentType,
        location_type: job.location_type as LocationType,
        location: job.location,
        budget_min: job.budget_min,
        budget_max: job.budget_max,
        budget_currency: (job.budget_currency || 'VND') as BudgetCurrency,
        payment_type: job.payment_type as PaymentType,
        is_negotiable: job.is_negotiable,
        deadline: job.deadline || undefined,
        work_time: job.work_time,
        experience_level: job.experience_level as ExperienceLevel,
        genres: job.genres ?? [],
        required_skills: job.required_skills ?? [],
        benefits: job.benefits ?? [],
        status: job.status as PostStatus,
        visibility: job.visibility as PostVisibility,
        ...overrides,
    };
}

/**
 * Reopen a closed post: BE has no /reopen endpoint.
 * PUT /posts/:id requires the full post body; /publish only accepts draft.
 */
export async function reopenOwnedJob(jobId: string): Promise<Job> {
    const job = await getJobByIdWithOwnedFallback(jobId);
    const body = buildUpdatePayloadFromJob(job, { status: 'published' });
    return jobRemoteDataSource.updateJob(jobId, body);
}
