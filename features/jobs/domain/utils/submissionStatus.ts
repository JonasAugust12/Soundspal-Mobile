import type { SubmissionStatus } from '@/features/jobs/domain/entities/job.type';

interface SubmissionStatusMeta {
    label: string;
    // Tailwind class nền pill (light + dark).
    bgClass: string;
    // Tailwind class màu chữ (light + dark).
    textClass: string;
    // Màu thanh accent bên trái (hex) — khớp cách web tô màu theo trạng thái.
    accent: string;
}

const META: Record<SubmissionStatus, SubmissionStatusMeta> = {
    pending_review: {
        label: 'Chờ duyệt',
        bgClass: 'bg-amber-100 dark:bg-amber-900/40',
        textClass: 'text-amber-700 dark:text-amber-300',
        accent: '#F59E0B',
    },
    under_review: {
        label: 'Đang xem xét',
        bgClass: 'bg-blue-100 dark:bg-blue-900/40',
        textClass: 'text-blue-700 dark:text-blue-300',
        accent: '#3B82F6',
    },
    accepted: {
        label: 'Đã nhận',
        bgClass: 'bg-green-100 dark:bg-green-900/40',
        textClass: 'text-green-700 dark:text-green-300',
        accent: '#10B981',
    },
    rejected: {
        label: 'Từ chối',
        bgClass: 'bg-red-100 dark:bg-red-900/40',
        textClass: 'text-red-700 dark:text-red-300',
        accent: '#EF4444',
    },
    skipped: {
        label: 'Bỏ qua',
        bgClass: 'bg-gray-100 dark:bg-gray-800',
        textClass: 'text-gray-600 dark:text-gray-300',
        accent: '#9CA3AF',
    },
    withdrawn: {
        label: 'Đã rút',
        bgClass: 'bg-gray-100 dark:bg-gray-800',
        textClass: 'text-gray-600 dark:text-gray-300',
        accent: '#9CA3AF',
    },
    expired: {
        label: 'Hết hạn',
        bgClass: 'bg-gray-100 dark:bg-gray-800',
        textClass: 'text-gray-500 dark:text-gray-400',
        accent: '#6B7280',
    },
};

const FALLBACK: SubmissionStatusMeta = {
    label: 'Không rõ',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-600 dark:text-gray-300',
    accent: '#9CA3AF',
};

export function getSubmissionStatusMeta(status: string): SubmissionStatusMeta {
    return META[status as SubmissionStatus] ?? FALLBACK;
}
