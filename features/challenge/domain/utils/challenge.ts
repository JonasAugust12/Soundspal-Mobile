import type { Beat, BeatEntry } from '@/features/challenge/domain/entities/challenge.type';

/**
 * Helpers thuần cho Challenge — port 1:1 từ web (challengeLandingHelpers,
 * beatBookmarkHelpers, leaderboardHelpers) để hai nền tảng cùng một hành vi:
 * ưu tiên genres[], strict === true cho is_bookmarked/is_liked, và ẩn entry lỗi chấm.
 */

export const CHALLENGE_LANDING_PAGE_SIZE = 20;
export const MAX_BEAT_GENRES = 5;

/** Trim + loại trùng (không phân biệt hoa/thường), giữ nguyên thứ tự xuất hiện. */
export function normalizeBeatGenres(genres: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const genre of genres) {
        const trimmed = genre.trim();
        if (!trimmed) continue;

        const key = trimmed.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        result.push(trimmed);
    }

    return result;
}

/** Genre để render tag: ưu tiên genres[], fallback về `genre` (legacy = genres[0]). */
export function getBeatGenres(beat: Pick<Beat, 'genre' | 'genres'>): string[] {
    if (beat.genres?.length) return normalizeBeatGenres(beat.genres);
    if (beat.genre?.trim()) return [beat.genre.trim()];
    return [];
}

/** Ghép các genre đã chọn thành query `genre=Pop,Hip-Hop` (backend match OR). */
export function formatBeatGenreFilter(selectedGenres: string[]): string | undefined {
    const normalized = normalizeBeatGenres(selectedGenres);
    return normalized.length > 0 ? normalized.join(',') : undefined;
}

/** Bật/tắt một genre trong danh sách multi-select (so sánh không phân biệt hoa/thường). */
export function toggleSelectedGenre(selectedGenres: string[], genre: string): string[] {
    const normalized = normalizeBeatGenres(selectedGenres);
    const target = genre.trim();
    if (!target) return normalized;

    const key = target.toLowerCase();
    const exists = normalized.some((value) => value.toLowerCase() === key);
    if (exists) return normalized.filter((value) => value.toLowerCase() !== key);

    return [...normalized, target];
}

/** Tên hiển thị của creator: display name nếu có, else username. */
export function getBeatCreatorDisplayName(
    beat: Pick<Beat, 'creator_display_name' | 'creator_username'>,
): string {
    return beat.creator_display_name?.trim() || beat.creator_username;
}

/** Beat hero = beat có entry_count cao nhất. */
export function getHeroBeat(beats: Beat[]): Beat | undefined {
    return beats.reduce<Beat | undefined>((topBeat, beat) => {
        if (!topBeat) return beat;
        return beat.entry_count > topBeat.entry_count ? beat : topBeat;
    }, undefined);
}

// ── Bookmark ────────────────────────────────────────────────────────────────

/** Strict === true: field thiếu (chưa đăng nhập) KHÔNG được coi là đã bookmark. */
export function isBeatBookmarked(beat: Pick<Beat, 'is_bookmarked'>): boolean {
    return beat.is_bookmarked === true;
}

/** Cập nhật bất biến cờ is_bookmarked của một beat trong list. */
export function applyBeatBookmarkToggle(
    beats: Beat[],
    beatId: string,
    isBookmarked: boolean,
): Beat[] {
    return beats.map((beat) =>
        beat.id === beatId ? { ...beat, is_bookmarked: isBookmarked } : beat,
    );
}

// ── Leaderboard vote (like) ──────────────────────────────────────────────────

/** Strict === true, cùng quy tắc với is_bookmarked. */
export function isEntryLiked(entry: Pick<BeatEntry, 'is_liked'>): boolean {
    return entry.is_liked === true;
}

/** Set is_liked + đồng bộ vote_count (±1, không âm) cho một entry trong list. */
export function applyEntryLikeToggle(
    entries: BeatEntry[],
    entryId: string,
    liked: boolean,
): BeatEntry[] {
    return entries.map((entry) => {
        if (entry.id !== entryId) return entry;

        const wasLiked = isEntryLiked(entry);
        if (wasLiked === liked) return entry;

        return {
            ...entry,
            is_liked: liked,
            vote_count: Math.max(0, entry.vote_count + (liked ? 1 : -1)),
        };
    });
}

/** Ẩn entry `scoring_status === 'failed'` khỏi bảng xếp hạng (giống web). */
export function filterLeaderboardEntries(entries: BeatEntry[]): BeatEntry[] {
    return entries.filter((entry) => entry.scoring_status !== 'failed');
}
