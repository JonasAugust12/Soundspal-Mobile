export interface Beat {
    id: string;
    audio_url: string;
    bpm: number;
    cover_image_url: string;
    created_at: string;
    creator_avatar_url?: string;
    creator_id: string;
    creator_username: string;
    description: string;
    duration_seconds: number;
    entry_count: number;
    genre: string;
    is_active: boolean;
    key_signature: string;
    title: string;
    updated_at: string;
    waveform_json?: string;
}

export interface BeatPagination {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

export interface GetBeatsResponse {
    beats: Beat[];
    pagination: BeatPagination;
}

export interface GetBeatsParams {
    page?: number;
    page_size?: number;
    genre?: string;
}

export interface BeatEntry {
    id: string;
    audio_url: string;
    beat_id: string;
    created_at: string;
    display_name: string;
    explanation: string;
    scoring_status?: 'pending' | 'completed' | 'failed' | 'scored';
    expression_score: number;
    normalized_score: number;
    pitch_score: number;
    rhythm_score: number;
    scored_at: string;
    stability_score: number;
    tone_score: number;
    total_score: number;
    user_id: string;
    username: string;
    avatar_url?: string;
    vote_count: number;
}

export interface GetLeaderboardResponse {
    beat_id: string;
    entries: BeatEntry[];
    has_scored_entries?: boolean;
}

export interface UserStats {
    average_score: number;
    best_score: number;
    total_entries: number;
    total_votes_received: number;
    user_id: string;
}

export interface GetMyBeatsResponse {
    beats: Beat[];
    pagination: BeatPagination;
}

export interface GetMyBeatsParams {
    page?: number;
    page_size?: number;
    genre?: string;
}

export interface GetMyEntriesResponse {
    entries: BeatEntry[];
    pagination: BeatPagination;
}

export interface GetMyEntriesParams {
    page?: number;
    page_size?: number;
    beat_id?: string;
    scoring_status?: string;
}
