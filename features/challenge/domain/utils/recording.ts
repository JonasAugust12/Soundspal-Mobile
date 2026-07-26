import type { Beat } from '@/features/challenge/domain/entities/challenge.type';

/**
 * Helpers cho màn thu âm — port từ web `recordingHelpers.ts` + `beatDownloadHelpers.ts`.
 * Phần convert WAV (Web Audio API) KHÔNG port: expo-av trên mobile thu ra .m4a vốn đã
 * nằm trong danh sách định dạng backend chấp nhận, nên không cần convert.
 */

/** Hai chế độ thu: hát trên nền beat, hoặc hát chay (không beat). */
export type RecordingMode = 'with-beat' | 'vocal-only';

/** Định dạng audio backend chấp nhận cho entry (POST /beats/{id}/entries). */
export const ACCEPTED_UPLOAD_AUDIO_EXTENSIONS = [
    'mp3',
    'wav',
    'flac',
    'm4a',
    'ogg',
    'aac',
] as const;

export type AcceptedUploadAudioExtension = (typeof ACCEPTED_UPLOAD_AUDIO_EXTENSIONS)[number];

/** Format giây → "MM:SS" (hoặc "HH:MM:SS" khi ≥ 1 giờ). */
export function formatRecordingTime(
    totalSeconds: number,
    options?: { includeHours?: boolean },
): string {
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
        return options?.includeHours ? '00:00:00' : '00:00';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const segments =
        options?.includeHours || hours > 0 ? [hours, minutes, seconds] : [minutes, seconds];

    return segments.map((value) => String(value).padStart(2, '0')).join(':');
}

/** Tên file mặc định cho bản thu (expo-av xuất .m4a). */
export function getRecordingFileName(beatId: string, extension = 'm4a'): string {
    return `soundspal-entry-${beatId}.${extension}`;
}

/** Lấy đuôi file (không dấu chấm, lowercase) — "" nếu không có đuôi hợp lệ. */
export function getUploadAudioExtension(fileName: string): string {
    const normalized = fileName.trim().toLowerCase();
    const dotIndex = normalized.lastIndexOf('.');
    if (dotIndex <= 0 || dotIndex === normalized.length - 1) {
        return '';
    }
    return normalized.slice(dotIndex + 1);
}

/** File upload có đuôi nằm trong danh sách backend chấp nhận không. */
export function isAcceptedUploadAudioFile(file: { name: string }): boolean {
    const extension = getUploadAudioExtension(file.name);
    return ACCEPTED_UPLOAD_AUDIO_EXTENSIONS.includes(extension as AcceptedUploadAudioExtension);
}

const ALLOWED_DOWNLOAD_EXTENSIONS = new Set<string>(ACCEPTED_UPLOAD_AUDIO_EXTENSIONS);

/** Đoán đuôi audio từ URL beat (bỏ query/hash); fallback mp3. */
export function getBeatAudioExtension(audioUrl: string): string {
    const pathname = audioUrl.split('?')[0]?.split('#')[0] ?? '';
    const extension = pathname.split('.').pop()?.toLowerCase();
    if (extension && ALLOWED_DOWNLOAD_EXTENSIONS.has(extension)) {
        return extension;
    }
    return 'mp3';
}

/** slug tiêu đề beat → tên file tải về an toàn (bỏ dấu tiếng Việt qua NFD). */
function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Tên file khi tải beat về: "<slug-title>.<ext>", fallback "beat-<id>". */
export function getBeatDownloadFileName(beat: Pick<Beat, 'audio_url' | 'id' | 'title'>): string {
    const safeTitle = slugify(beat.title);
    const baseName = safeTitle || `beat-${beat.id}`;
    const extension = beat.audio_url ? getBeatAudioExtension(beat.audio_url) : 'mp3';
    return `${baseName}.${extension}`;
}
