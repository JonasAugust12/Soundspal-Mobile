import type { IJobRepository } from '@/features/jobs/domain/repositories/IJobRepository';
import type {
    Application,
    SubmitApplicationRequest,
} from '@/features/jobs/domain/entities/job.type';

export class SubmitJobApplicationUseCase {
    constructor(private readonly repository: IJobRepository) {}

    execute(jobId: string, body: SubmitApplicationRequest): Promise<Application> {
        if (!jobId?.trim()) {
            return Promise.reject(new Error('Job ID is required'));
        }
        return this.repository.submitJobApplication(jobId, body);
    }
}
