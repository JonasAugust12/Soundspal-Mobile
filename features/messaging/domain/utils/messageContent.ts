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

export function getAttachmentTypeFromMimeType(mimeType?: string | null): MessageAttachmentType {
    if (!mimeType) return 'file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
}

// Preview text for the conversation list — hides raw JOB_REF payload and
// renders attachments as a short label (mirrors web getMessagePreviewText).
export function getConversationPreview(message?: Message | null): string {
    if (!message) return 'Chưa có tin nhắn';
    if (message.isDeleted) return 'Tin nhắn đã bị xóa';

    const content = message.content?.trim();
    if (content && isJobReference(content)) return '📋 Đơn ứng tuyển';

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
