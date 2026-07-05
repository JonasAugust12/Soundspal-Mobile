import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type {
    JobListResponse,
    JobDetailResponse,
    Job,
    CreateJobRequest,
    UpdateJobRequest,
    SubmitApplicationRequest,
    Application,
    MySubmissionsResponse,
    PostStatus,
    PostVisibility,
} from '@/features/jobs/domain/entities/job.type';

export interface GetJobsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: PostStatus;
    visibility?: PostVisibility;
}

const buildListQuery = (params: GetJobsParams) => {
    const searchParams = new URLSearchParams({
        page: (params.page ?? 1).toString(),
        page_size: (params.pageSize ?? 10).toString(),
    });
    if (params.status) {
        searchParams.append('status', params.status);
    }
    if (params.visibility) {
        searchParams.append('visibility', params.visibility);
    }
    return searchParams;
};

export const jobRemoteDataSource = {
    getJobs: (params: GetJobsParams) => {
        const searchParams = buildListQuery(params);
        if (params.search?.trim()) {
            searchParams.append('q', params.search.trim());
            return createApiCall<JobListResponse>(
                'GET',
                `/posts/search?${searchParams.toString()}`,
            )();
        }
        return createApiCall<JobListResponse>('GET', `/posts?${searchParams.toString()}`)();
    },

    getJobById: (id: string) => {
        return createApiCall<JobDetailResponse>('GET', `/posts/${id}`)();
    },

    getMyPosts: (params: { page?: number; pageSize?: number }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 10).toString(),
        });
        return createApiCall<JobListResponse>('GET', `/posts/me?${searchParams.toString()}`)();
    },

    createJob: createApiCall<Job, CreateJobRequest>('POST', '/posts'),

    updateJob: (id: string, body: UpdateJobRequest) => {
        return createApiCall<Job, UpdateJobRequest>('PUT', `/posts/${id}`)(body);
    },

    deleteJob: (id: string) => {
        return createApiCall<void>('DELETE', `/posts/${id}`)();
    },

    publishJob: (id: string) => {
        return createApiCall<Job>('POST', `/posts/${id}/publish`)();
    },

    closeJob: (id: string) => {
        return createApiCall<Job>('POST', `/posts/${id}/close`)();
    },

    submitJobApplication: (jobId: string, body: SubmitApplicationRequest) => {
        return createApiCall<Application, SubmitApplicationRequest>(
            'POST',
            `/posts/${jobId}/submit`,
        )(body);
    },

    getMySubmissions: (params: { page?: number; pageSize?: number }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
        });
        return createApiCall<MySubmissionsResponse>(
            'GET',
            `/my-submissions?${searchParams.toString()}`,
        )();
    },
};
