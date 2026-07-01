// Media types
export interface Media {
    id: string;
    file_name: string;
    file_url: string;
    storage_url: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    updated_at?: string;
}

export interface MediaListResponse {
    media: Media[];
    total: number;
}

export interface UploadMediaResponse {
    id: string;
    file_name: string;
    file_url: string;
    storage_url: string;
    mime_type: string;
    file_size: number;
}
