import type { Message } from '@/features/messaging/domain/entities/messaging.type';

export type MessageAttachmentType = 'image' | 'video' | 'audio' | 'file';

export interface JobRefData {
    id?: string;
    title?: string;
    companyName?: string;
    location?: string;
    type?: string;
    budget?: string | number;
    description?: string;
}

// Matches the web protocol: :::JOB_REF:{json}:::\n<user message>
// JSON is produced by JSON.stringify (single line), so `\{.*\}` on one line is safe.
const JOB_REF_PATTERN = /^:::JOB_REF:(\{.*\}):::\n?([\s\S]*)$/;

// Cùng giao thức nhưng chỉ nhúng `{ "id": "..." }` — thẻ collab được hydrate bằng
// `GET /collaborations/{id}` lúc render, không nhúng snapshot như JOB_REF
// (xem docs/mobile-team/collaboration-messaging-sync.md, mục 4.4).
const COLLAB_REF_PATTERN = /^:::COLLAB_REF:(\{.*\}):::\n?([\s\S]*)$/;

// job.post_type / job.type → Vietnamese label (from messages-uplift-mobile-api.md)
const JOB_TYPE_LABELS: Record<string, string> = {
    opportunity: 'Cơ hội biểu diễn',
    collaboration: 'Tìm cộng tác',
    job_offer: 'Đề nghị việc làm',
    availability: 'Thông báo lịch trống',
    gig: 'Gig',
};

export function isJobReference(content?: string | null): boolean {
    return !!content && JOB_REF_PATTERN.test(content);
}

export function parseJobReference(
    content?: string | null,
): { jobData: JobRefData; userText: string } | null {
    if (!content) return null;
    const match = content.match(JOB_REF_PATTERN);
    if (!match) return null;
    try {
        const jobData = JSON.parse(match[1]) as JobRefData;
        return { jobData, userText: match[2] ?? '' };
    } catch {
        return null;
    }
}

export function buildJobReference(jobData: JobRefData, text: string): string {
    return `:::JOB_REF:${JSON.stringify(jobData)}:::\n${text}`;
}

export function getJobTypeLabel(type?: string): string {
    if (!type) return '';
    return JOB_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

// ── COLLAB_REF ────────────────────────────────────────────────────────────────

export function isCollabReference(content?: string | null): boolean {
    return !!content && COLLAB_REF_PATTERN.test(content);
}

export function parseCollabReference(
    content?: string | null,
): { collaborationId: string; userText: string } | null {
    if (!content) return null;
    const match = content.match(COLLAB_REF_PATTERN);
    if (!match) return null;
    try {
        const { id } = JSON.parse(match[1]) as { id?: string };
        if (!id) return null;
        return { collaborationId: id, userText: match[2] ?? '' };
    } catch {
        return null;
    }
}

export function buildCollabReference(collaborationId: string, text: string): string {
    return `:::COLLAB_REF:${JSON.stringify({ id: collaborationId })}:::\n${text}`;
}

/** Tin nhắn mang thẻ tham chiếu (job/collab) — không cho sửa/xoá để lộ payload thô. */
export function isStructuredReference(content?: string | null): boolean {
    return isJobReference(content) || isCollabReference(content);
}

export function getAttachmentTypeFromMimeType(mimeType?: string | null): MessageAttachmentType {
    if (!mimeType) return 'file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
}

// Preview text for the conversation list — hides raw JOB_REF/COLLAB_REF payload and
// renders attachments as a short label (mirrors web getMessagePreviewText).
export function getConversationPreview(message?: Message | null): string {
    if (!message) return 'Chưa có tin nhắn';
    if (message.isDeleted) return 'Tin nhắn đã bị xóa';

    const content = message.content?.trim();
    if (content && isJobReference(content)) return '📋 Đơn ứng tuyển';
    if (content && isCollabReference(content)) return '🤝 Hợp tác';

    if (message.attachmentUrl || message.attachmentType) {
        switch (message.attachmentType) {
            case 'image':
                return '📷 Hình ảnh';
            case 'video':
                return '🎬 Video';
            case 'audio':
                return '🎵 Âm thanh';
            default:
                return '📎 Tệp đính kèm';
        }
    }

    return content || 'Chưa có tin nhắn';
}

// A message is "seen" by userId when their id is present in readBy.
export function isMessageSeenBy(message: Message, userId?: string | null): boolean {
    if (!userId) return false;
    return !!message.readBy?.includes(userId);
}
