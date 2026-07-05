import type {
    IJobRepository,
    GetJobsParams,
} from '@/features/jobs/domain/repositories/IJobRepository';
import type { JobListResponse } from '@/features/jobs/domain/entities/job.type';

export class GetJobsUseCase {
    constructor(private readonly repository: IJobRepository) {}

    execute(params: GetJobsParams): Promise<JobListResponse> {
        return this.repository.getJobs(params);
    }
}
