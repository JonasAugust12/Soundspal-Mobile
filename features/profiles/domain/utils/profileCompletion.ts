export interface ProfileCompletionItem {
    key: string;
    label: string;
    done: boolean;
}

export interface ProfileCompletionInput {
    avatar_url?: string | null;
    cover_url?: string | null;
    display_name?: string;
    username?: string;
    city?: string | null;
    country?: string | null;
    brief_bio?: string;
    genresCount: number;
    servicesCount: number;
    videoCount: number;
}

/**
 * Tính % hoàn thiện hồ sơ artist theo checklist 8 mục (mỗi mục 12.5%).
 * Bám tinh thần `computeProfileCompletion` bên web nhưng dùng các field mobile có
 * (mobile dùng priced `services` thay cho `service_types` của web).
 */
export function computeProfileCompletion(input: ProfileCompletionInput): {
    pct: number;
    items: ProfileCompletionItem[];
} {
    const items: ProfileCompletionItem[] = [
        { key: 'avatar', label: 'Ảnh đại diện', done: Boolean(input.avatar_url) },
        { key: 'cover', label: 'Ảnh bìa', done: Boolean(input.cover_url) },
        {
            key: 'stageName',
            label: 'Nghệ danh',
            done: Boolean(input.display_name && input.display_name !== input.username),
        },
        { key: 'location', label: 'Địa điểm', done: Boolean(input.city || input.country) },
        { key: 'genre', label: 'Thể loại', done: input.genresCount > 0 },
        { key: 'service', label: 'Dịch vụ', done: input.servicesCount > 0 },
        { key: 'brief', label: 'Giới thiệu ngắn', done: (input.brief_bio ?? '').length > 20 },
        { key: 'video', label: 'Video demo', done: input.videoCount > 0 },
    ];

    const doneCount = items.filter((i) => i.done).length;
    const pct = Math.round((doneCount / items.length) * 100);

    return { pct, items };
}
