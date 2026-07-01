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
} from '@/features/jobs/domain/entities/job.type';

export const jobRemoteDataSource = {
    getJobs: (params: { page?: number; pageSize?: number; search?: string }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 0).toString(),
            page_size: (params.pageSize || 10).toString(),
        });
        if (params.search) {
            searchParams.append('search', params.search);
        }
        return createApiCall<JobListResponse>('GET', `/posts?${searchParams.toString()}`)();
    },

    getJobById: (id: string) => {
        return createApiCall<JobDetailResponse>('GET', `/posts/${id}`)();
    },

    getMyPosts: (params: { page?: number; pageSize?: number }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
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
