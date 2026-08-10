import type { CollabRequest, CollabRequestStatus } from '../entities/collabRequest.type';

/** Convert local/ISO date (yyyy-MM-dd) to API request format (dd-MM-yyyy). */
export function toApiDate(isoDate: string): string {
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}-${m}-${y}`;
}

/** Format API response date (yyyy-MM-dd) for display as dd/MM/yyyy. */
export function formatCollabDate(isoDate: string): string {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
}

export function todayIsoLocal(now = new Date()): string {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function isCollabOverdue(
    item: Pick<CollabRequest, 'status' | 'end_date'>,
    now = new Date(),
): boolean {
    if (item.status !== 'PENDING') return false;
    const end = item.end_date?.trim();
    if (!end) return false;
    const endDay = new Date(`${end}T23:59:59`);
    if (Number.isNaN(endDay.getTime())) return false;
    return now.getTime() > endDay.getTime();
}

export function counterpartOf(item: CollabRequest, currentUserId: string) {
    return item.sender.id === currentUserId ? item.receiver : item.sender;
}

export function isSentByMe(item: CollabRequest, currentUserId: string): boolean {
    return item.sender.id === currentUserId;
}

export function canRespondToCollab(item: CollabRequest, currentUserId: string): boolean {
    return !isSentByMe(item, currentUserId) && item.status === 'PENDING' && !isCollabOverdue(item);
}

export function canCancelCollab(item: CollabRequest): boolean {
    return item.status === 'PENDING' || item.status === 'ACCEPTED';
}

/** Nhắn tin chỉ mở sau khi đề nghị được chấp nhận (khớp gate của web). */
export function canMessageCollabPartner(item: CollabRequest): boolean {
    return item.status === 'ACCEPTED';
}

export function isOngoing(item: CollabRequest, today = todayIsoLocal()): boolean {
    return item.start_date <= today && item.end_date >= today;
}

export function isUpcoming(item: CollabRequest, today = todayIsoLocal()): boolean {
    return item.start_date > today;
}

export function statusLabel(status: CollabRequestStatus, overdue = false): string {
    if (overdue && status === 'PENDING') return 'Đã quá hạn';
    switch (status) {
        case 'PENDING':
            return 'Chờ phản hồi';
        case 'ACCEPTED':
            return 'Đồng ý';
        case 'REJECTED':
            return 'Từ chối';
        case 'CANCELLED':
            return 'Đã hủy';
        default:
            return 'Chờ phản hồi';
    }
}

export interface CollabStatusMeta {
    label: string;
    bgClass: string;
    textClass: string;
    accent: string;
}

export function getCollabStatusMeta(
    status: CollabRequestStatus,
    overdue = false,
): CollabStatusMeta {
    if (overdue && status === 'PENDING') {
        return {
            label: 'Đã quá hạn',
            bgClass: 'bg-amber-100',
            textClass: 'text-amber-700',
            accent: '#F59E0B',
        };
    }
    switch (status) {
        case 'PENDING':
            return {
                label: 'Chờ phản hồi',
                bgClass: 'bg-sky-100',
                textClass: 'text-sky-700',
                accent: '#0EA5E9',
            };
        case 'ACCEPTED':
            return {
                label: 'Đồng ý',
                bgClass: 'bg-emerald-100',
                textClass: 'text-emerald-700',
                accent: '#10B981',
            };
        case 'REJECTED':
            return {
                label: 'Từ chối',
                bgClass: 'bg-rose-100',
                textClass: 'text-rose-700',
                accent: '#F43F5E',
            };
        case 'CANCELLED':
            return {
                label: 'Đã hủy',
                bgClass: 'bg-gray-100',
                textClass: 'text-gray-600',
                accent: '#9CA3AF',
            };
        default:
            return {
                label: 'Chờ phản hồi',
                bgClass: 'bg-gray-100',
                textClass: 'text-gray-600',
                accent: '#9CA3AF',
            };
    }
}

/** Stable pastel palette for calendar event coloring by id. */
const PALETTES = [
    { bg: '#EDE9FE', border: '#7C3BED', text: '#5B21B6' },
    { bg: '#FCE7F3', border: '#F471B7', text: '#9D174D' },
    { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
    { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
    { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
    { bg: '#E0E7FF', border: '#6366F1', text: '#3730A3' },
];

export function paletteForId(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return PALETTES[hash % PALETTES.length];
}
