import {
    normalizeBeatGenres,
    getBeatGenres,
    formatBeatGenreFilter,
    toggleSelectedGenre,
    getBeatCreatorDisplayName,
    getHeroBeat,
    isBeatBookmarked,
    applyBeatBookmarkToggle,
    isEntryLiked,
    applyEntryLikeToggle,
    filterLeaderboardEntries,
    localizeScoreExplanation,
} from '@/features/challenge/domain/utils/challenge';
import type { Beat, BeatEntry } from '@/features/challenge/domain/entities/challenge.type';

function makeBeat(overrides: Partial<Beat> = {}): Beat {
    return {
        id: 'b1',
        audio_url: 'https://cdn/beat.mp3',
        bpm: 120,
        cover_image_url: '',
        created_at: '2026-01-01T00:00:00Z',
        creator_id: 'u1',
        creator_username: 'creator',
        description: '',
        duration_seconds: 100,
        entry_count: 0,
        genre: 'Pop',
        is_active: true,
        key_signature: 'C',
        title: 'Beat',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

function makeEntry(overrides: Partial<BeatEntry> = {}): BeatEntry {
    return {
        id: 'e1',
        audio_url: 'https://cdn/e.mp3',
        beat_id: 'b1',
        created_at: '2026-01-01T00:00:00Z',
        display_name: 'Singer',
        explanation: '',
        expression_score: 0,
        normalized_score: 0,
        pitch_score: 0,
        rhythm_score: 0,
        scored_at: '',
        stability_score: 0,
        tone_score: 0,
        total_score: 0,
        user_id: 'u2',
        username: 'singer',
        vote_count: 3,
        ...overrides,
    };
}

describe('multi-genre helpers', () => {
    it('normalizeBeatGenres trims and dedupes case-insensitively, keeping order', () => {
        expect(normalizeBeatGenres([' Pop ', 'pop', 'Hip-Hop', ''])).toEqual(['Pop', 'Hip-Hop']);
    });

    it('getBeatGenres prefers genres[] and falls back to genre', () => {
        expect(getBeatGenres(makeBeat({ genres: ['Rock', 'Rock'] }))).toEqual(['Rock']);
        expect(getBeatGenres(makeBeat({ genre: 'Jazz', genres: [] }))).toEqual(['Jazz']);
        expect(getBeatGenres(makeBeat({ genre: '', genres: [] }))).toEqual([]);
    });

    it('formatBeatGenreFilter joins with comma or returns undefined', () => {
        expect(formatBeatGenreFilter(['Pop', 'Hip-Hop'])).toBe('Pop,Hip-Hop');
        expect(formatBeatGenreFilter([])).toBeUndefined();
    });

    it('toggleSelectedGenre adds and removes case-insensitively', () => {
        expect(toggleSelectedGenre(['Pop'], 'Rock')).toEqual(['Pop', 'Rock']);
        expect(toggleSelectedGenre(['Pop', 'Rock'], 'pop')).toEqual(['Rock']);
    });

    it('getBeatCreatorDisplayName prefers display name', () => {
        expect(getBeatCreatorDisplayName(makeBeat({ creator_display_name: 'Real Name' }))).toBe(
            'Real Name',
        );
        expect(getBeatCreatorDisplayName(makeBeat({ creator_display_name: '  ' }))).toBe('creator');
    });

    it('getHeroBeat returns the beat with the most entries', () => {
        const beats = [
            makeBeat({ id: 'a', entry_count: 2 }),
            makeBeat({ id: 'b', entry_count: 9 }),
            makeBeat({ id: 'c', entry_count: 5 }),
        ];
        expect(getHeroBeat(beats)?.id).toBe('b');
        expect(getHeroBeat([])).toBeUndefined();
    });
});

describe('bookmark helpers', () => {
    it('isBeatBookmarked is strict === true', () => {
        expect(isBeatBookmarked(makeBeat({ is_bookmarked: true }))).toBe(true);
        expect(isBeatBookmarked(makeBeat({ is_bookmarked: false }))).toBe(false);
        expect(isBeatBookmarked(makeBeat())).toBe(false);
    });

    it('applyBeatBookmarkToggle updates only the target beat immutably', () => {
        const beats = [makeBeat({ id: 'a' }), makeBeat({ id: 'b' })];
        const next = applyBeatBookmarkToggle(beats, 'b', true);
        expect(next[0].is_bookmarked).toBeUndefined();
        expect(next[1].is_bookmarked).toBe(true);
        expect(next).not.toBe(beats);
    });
});

describe('leaderboard vote helpers', () => {
    it('isEntryLiked is strict === true', () => {
        expect(isEntryLiked(makeEntry({ is_liked: true }))).toBe(true);
        expect(isEntryLiked(makeEntry())).toBe(false);
    });

    it('applyEntryLikeToggle syncs vote_count and is idempotent per state', () => {
        const entries = [makeEntry({ id: 'e1', vote_count: 3, is_liked: false })];
        const liked = applyEntryLikeToggle(entries, 'e1', true);
        expect(liked[0]).toMatchObject({ is_liked: true, vote_count: 4 });

        const unliked = applyEntryLikeToggle(liked, 'e1', false);
        expect(unliked[0]).toMatchObject({ is_liked: false, vote_count: 3 });

        // no-op when state already matches
        expect(applyEntryLikeToggle(liked, 'e1', true)[0]).toBe(liked[0]);
    });

    it('applyEntryLikeToggle never drops vote_count below zero', () => {
        const entries = [makeEntry({ id: 'e1', vote_count: 0, is_liked: true })];
        expect(applyEntryLikeToggle(entries, 'e1', false)[0].vote_count).toBe(0);
    });

    it('filterLeaderboardEntries removes only failed entries', () => {
        const entries = [
            makeEntry({ id: 'ok', scoring_status: 'scored' }),
            makeEntry({ id: 'pending', scoring_status: 'pending' }),
            makeEntry({ id: 'bad', scoring_status: 'failed' }),
        ];
        expect(filterLeaderboardEntries(entries).map((e) => e.id)).toEqual(['ok', 'pending']);
    });

    it('localizeScoreExplanation maps known English ML phrases to Vietnamese', () => {
        const en =
            'Pitch accuracy is excellent with strong intonation. Rhythm alignment is weak — vocal timing diverges from the beat.';
        const vi = localizeScoreExplanation(en);
        expect(vi).toContain('Độ chính xác cao độ rất tốt');
        expect(vi).toContain('Nhịp yếu');
        expect(vi).not.toContain('Pitch accuracy');
    });
});
