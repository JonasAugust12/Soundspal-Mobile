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
    PostTypeFilter,
    LocationType,
    ExperienceLevel,
    GetJobSubmissionsParams,
    OpportunitySubmission,
    OpportunitySubmissionsResponse,
    WithdrawSubmissionRequest,
    ReviewSubmissionRequest,
    ReviewSubmissionResponse,
    PendingCountResponse,
    BulkReviewRequest,
    BulkActionResponse,
} from '@/features/jobs/domain/entities/job.type';

export interface GetJobsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: PostStatus;
    visibility?: PostVisibility;
    // Bộ lọc nâng cao
    post_type?: PostTypeFilter;
    location?: string;
    location_type?: LocationType;
    experience_level?: ExperienceLevel;
    budget_min?: number;
    budget_max?: number;
    genres?: string[];
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

const buildListQuery = (params: GetJobsParams) => {
    const searchParams = new URLSearchParams({
        page: (params.page ?? 1).toString(),
        page_size: (params.pageSize ?? 10).toString(),
    });
    if (params.status) searchParams.append('status', params.status);
    if (params.visibility) searchParams.append('visibility', params.visibility);
    if (params.post_type) searchParams.append('post_type', params.post_type);
    if (params.location_type) searchParams.append('location_type', params.location_type);
    if (params.experience_level) searchParams.append('experience_level', params.experience_level);
    if (params.location?.trim()) searchParams.append('location', params.location.trim());
    if (typeof params.budget_min === 'number')
        searchParams.append('budget_min', String(params.budget_min));
    if (typeof params.budget_max === 'number')
        searchParams.append('budget_max', String(params.budget_max));
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.sort_order) searchParams.append('sort_order', params.sort_order);
    params.genres?.forEach((g) => searchParams.append('genres', g));
    return searchParams;
};

export const jobRemoteDataSource = {
    getJobs: (params: GetJobsParams) => {
        const searchParams = buildListQuery(params);
        const hasAdvancedFilters = !!(
            params.post_type ||
            params.location_type ||
            params.experience_level ||
            params.location ||
            typeof params.budget_min === 'number' ||
            typeof params.budget_max === 'number' ||
            (params.genres && params.genres.length > 0)
        );
        // Text search dùng /posts/search; nhưng nếu có filter nâng cao thì ưu tiên /posts
        // (endpoint hỗ trợ JobPostFilters).
        if (params.search?.trim()) {
            searchParams.append('q', params.search.trim());
            if (!hasAdvancedFilters) {
                return createApiCall<JobListResponse>(
                    'GET',
                    `/posts/search?${searchParams.toString()}`,
                )();
            }
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

    // Flow 7 — Artist rút đơn ứng tuyển
    withdrawSubmission: (submissionId: string, body: WithdrawSubmissionRequest) => {
        return createApiCall<OpportunitySubmission, WithdrawSubmissionRequest>(
            'PUT',
            `/submissions/${submissionId}/withdraw`,
        )(body);
    },

    // Flow 5 — Venue xem danh sách đơn ứng tuyển của 1 job
    getJobSubmissions: (jobId: string, params: GetJobSubmissionsParams = {}) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
        });
        if (params.status) searchParams.append('status', params.status);
        if (params.sortBy) searchParams.append('sort_by', params.sortBy);
        if (params.sortOrder) searchParams.append('sort_order', params.sortOrder);
        return createApiCall<OpportunitySubmissionsResponse>(
            'GET',
            `/posts/${jobId}/submissions?${searchParams.toString()}`,
        )();
    },

    // Flow 5 — Venue accept/reject/skip 1 đơn
    reviewSubmission: (submissionId: string, body: ReviewSubmissionRequest) => {
        return createApiCall<ReviewSubmissionResponse, ReviewSubmissionRequest>(
            'PUT',
            `/submissions/${submissionId}/review`,
        )(body);
    },

    // Flow 9 — Đếm số đơn đang chờ duyệt (toàn bộ job của venue)
    getPendingApplicationsCount: () => {
        return createApiCall<PendingCountResponse>('GET', '/submissions/pending-count')();
    },

    // Flow 5 — Venue duyệt HÀNG LOẠT (accept/reject/skip nhiều đơn cùng lúc)
    bulkReviewSubmissions: (body: BulkReviewRequest) => {
        return createApiCall<BulkActionResponse, BulkReviewRequest>(
            'POST',
            '/submissions/bulk-action',
        )(body);
    },
};
