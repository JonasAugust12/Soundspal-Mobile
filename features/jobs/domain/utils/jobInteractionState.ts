import type { Job, SubmissionStatus } from '@/features/jobs/domain/entities/job.type';

// Port từ web src/lib/jobInteractionHelpers.ts — tính CTA chính theo trạng thái người xem.

export type JobInteractionReason =
    | 'owner'
    | 'availability'
    | 'already_applied'
    | 'withdrawn'
    | 'not_published'
    | 'deadline_passed'
    | 'capacity_reached'
    | 'applications_closed'
    | null;

export type JobPrimaryAction = 'apply' | 'contact' | 'manage' | 'view_application' | 'unavailable';

export interface JobInteractionState {
    canApply: boolean;
    canContact: boolean;
    canSave: boolean;
    isOwner: boolean;
    primaryAction: JobPrimaryAction;
    reason: JobInteractionReason;
    showApplicationCount: boolean;
}

export function getJobApplicationCount(job: Job): number {
    return job.total_submissions ?? job.applications_count ?? 0;
}

/**
 * Tính trạng thái tương tác của người xem với 1 job.
 * Ưu tiên field `viewer_*` từ backend; nếu không có thì suy ra từ viewerId + đơn ứng tuyển (my-submissions).
 */
export function getJobInteractionState(
    job: Job,
    viewerId?: string | null,
    submissionStatus?: SubmissionStatus | null,
): JobInteractionState {
    const isOwner =
        job.viewer_is_owner ??
        Boolean(viewerId && String(viewerId).trim() === String(job.creator_id).trim());
    const subStatus = job.viewer_submission_status ?? submissionStatus ?? null;
    const hasApplied = job.viewer_has_applied ?? Boolean(subStatus);
    const isAvailability = job.post_type === 'availability';

    if (isOwner) {
        return {
            canApply: false,
            canContact: false,
            canSave: false,
            isOwner: true,
            primaryAction: 'manage',
            reason: 'owner',
            showApplicationCount: !isAvailability,
        };
    }

    if (isAvailability) {
        return {
            canApply: false,
            canContact: true,
            canSave: true,
            isOwner: false,
            primaryAction: 'contact',
            reason: 'availability',
            showApplicationCount: false,
        };
    }

    if (hasApplied) {
        return {
            canApply: false,
            canContact: true,
            canSave: true,
            isOwner: false,
            primaryAction: 'view_application',
            reason: subStatus === 'withdrawn' ? 'withdrawn' : 'already_applied',
            showApplicationCount: true,
        };
    }

    let reason: JobInteractionReason = null;
    if (job.status !== 'published') reason = 'not_published';
    else if (job.is_deadline_passed) reason = 'deadline_passed';
    else if (job.max_submissions && getJobApplicationCount(job) >= job.max_submissions) {
        reason = 'capacity_reached';
    } else if (job.can_accept_submissions === false) reason = 'applications_closed';

    return {
        canApply: reason === null,
        canContact: true,
        canSave: true,
        isOwner: false,
        primaryAction: reason === null ? 'apply' : 'unavailable',
        reason,
        showApplicationCount: true,
    };
}

/** Nhãn tiếng Việt cho lý do không ứng tuyển được. */
export function getJobReasonLabel(reason: JobInteractionReason): string {
    switch (reason) {
        case 'already_applied':
            return 'Bạn đã ứng tuyển công việc này';
        case 'withdrawn':
            return 'Bạn đã rút đơn — không thể ứng tuyển lại';
        case 'not_published':
            return 'Bài đăng chưa mở nhận ứng tuyển';
        case 'deadline_passed':
            return 'Đã hết hạn ứng tuyển';
        case 'capacity_reached':
            return 'Bài đăng đã đủ số lượng ứng tuyển';
        case 'applications_closed':
            return 'Bài đăng đã ngừng nhận ứng tuyển';
        case 'availability':
            return 'Đây là tin nhận show — hãy nhắn tin để liên hệ';
        default:
            return 'Bài đăng hiện không nhận ứng tuyển';
    }
}
