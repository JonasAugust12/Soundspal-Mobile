// Asset types
export interface Asset {
    asset_type: string;
    created_at: string;
    duration: number;
    file_name: string;
    file_size: number;
    id: string;
    mime_type: string;
    storage_key: string;
    storage_url: string;
    thumbnail_url: string;
}

// Invite types
export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface Invite {
    expires_at: string;
    id: string;
    invited_at: string;
    invitee_email: string;
    invitee_id: string;
    invitee_name: string;
    message: string;
    responded_at: string;
    status: InviteStatus;
}

// Tag types
export interface Tag {
    created_at: string;
    id: string;
    tag_type: string;
    tag_value: string;
}

// Enum types - matching Go backend exactly
export type PostType = 'job_offer' | 'gig' | 'availability';
export type ArtistType = 'venue' | 'producer' | 'singer';
export type RecruitmentType = 'full_time' | 'part_time' | 'contract' | 'one_time';
export type LocationType = 'remote' | 'onsite' | 'hybrid';
export type BudgetCurrency = 'USD' | 'EUR' | 'JPY' | 'VND';
export type PaymentType = 'bySession' | 'byHour' | 'byProject' | 'byMonth';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert' | 'any';
export type PostStatus = 'draft' | 'published' | 'closed' | 'completed' | 'cancelled';
export type PostVisibility = 'public' | 'private' | 'invite_only';

// Main Job/Post interface
export interface Job {
    applications_count: number;
    assets: Asset[];
    benefits: string[];
    bookings_count: number;
    brief_description: string;
    budget_currency: string;
    budget_max: number;
    budget_min: number;
    closed_at: string;
    created_at: string;
    creator_id: string;
    creator_role: string;
    creator_username: string;
    creator_display_name: string;
    deadline: string;
    description: string;
    experience_level: string;
    genres: string[];
    id: string;
    invites: Invite[];
    is_negotiable: boolean;
    location: string;
    location_type: string;
    payment_type: string;
    post_type: string;
    published_at: string;
    recruitment_type: string;
    required_skills: string[];
    status: string;
    tags: Tag[];
    title: string;
    type: string;
    updated_at: string;
    views_count: number;
    visibility: string;
    work_time: string;
    is_pool: boolean;
    pool_type: string;
    auto_notify: boolean;
    total_submissions: number;
    can_accept_submissions: boolean;
    is_deadline_passed: boolean;
}

// Pagination
export interface Pagination {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

// API Response types
export interface JobListResponse {
    pagination: Pagination;
    posts: Job[];
}

export type JobDetailResponse = Job;

// Create Job Request - matching Go backend struct exactly
export interface CreateJobRequest {
    // PostType - required
    post_type: PostType;

    // Basic Info - all required
    title: string;
    brief_description: string;
    description: string;
    type: ArtistType;
    recruitment_type: RecruitmentType;

    // Location - optional
    location_type?: LocationType;
    location?: string;

    // Budget - all optional except is_negotiable
    budget_min?: number | null;
    budget_max?: number | null;
    budget_currency?: BudgetCurrency | null;
    payment_type?: PaymentType | null;
    is_negotiable: boolean;

    // Timeline - optional
    deadline?: string | null;
    work_time?: string;

    // Requirements - optional
    experience_level?: ExperienceLevel | null;
    genres?: string[];
    required_skills?: string[];
    benefits?: string[];

    // Status - required with default
    status: PostStatus;

    // Visibility - required with default
    visibility: PostVisibility;
}

// Update Job Request (partial)
export type UpdateJobRequest = Partial<CreateJobRequest>;

// Application types
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface SubmitApplicationRequest {
    full_name: string;
    email: string;
    phone_number: string;
    cover_letter: string;
    portfolio_links?: string[];
    demo_file?: string;
}

export interface Application {
    id: string;
    pool_id: string;
    creator_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    cover_letter: string;
    portfolio_links: string[];
    demo_file: string;
    status: ApplicationStatus;
    is_reviewed: boolean;
    can_be_reviewed: boolean;
    can_withdraw: boolean;
    review_notes: string;
    reviewed_at: string;
    created_at: string;
    updated_at: string;
}

export type SubmitApplicationResponse = Application;

// Submission types (for my submissions and received submissions)
export type SubmissionStatus =
    | 'pending_review'
    | 'under_review'
    | 'accepted'
    | 'rejected'
    | 'skipped'
    | 'withdrawn'
    | 'expired';

export interface OpportunityInfo {
    id: string;
    title: string;
    post_type: string;
    pool_type: string;
    status: string;
    creator_id: string;
    creator_role: string;
    submission_deadline: string;
    total_submissions: number;
}

export interface MySubmission {
    id: string;
    cover_letter: string;
    portfolio_links: string[];
    demo_file: string;
    status: SubmissionStatus;
    can_withdraw: boolean;
    rejection_reason: string;
    reviewed_at: string;
    created_at: string;
    updated_at: string;
    job: OpportunityInfo;
}

export interface MySubmissionsResponse {
    submissions: MySubmission[];
    total: number;
    total_pages: number;
    page: number;
    page_size: number;
    pending_count: number;
    accepted_count: number;
    rejected_count: number;
}

export interface OpportunitySubmission {
    id: string;
    pool_id: string;
    creator_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    cover_letter: string;
    portfolio_links: string[];
    demo_file: string;
    status: SubmissionStatus;
    is_reviewed: boolean;
    can_be_reviewed: boolean;
    can_withdraw: boolean;
    review_notes: string;
    reviewed_at: string;
    created_at: string;
    updated_at: string;
}

export interface OpportunitySubmissionsResponse {
    submissions: OpportunitySubmission[];
    total: number;
    total_pages: number;
    page: number;
    page_size: number;
}

export interface WithdrawSubmissionRequest {
    reason: string;
}

// Params khi venue lấy danh sách đơn ứng tuyển của 1 job (GET /posts/:id/submissions)
export interface GetJobSubmissionsParams {
    page?: number;
    pageSize?: number;
    status?: SubmissionStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// GET /submissions/pending-count → { count }
export interface PendingCountResponse {
    count: number;
}

// Review submission types
export type ReviewActionType =
    | 'submit'
    | 'review_start'
    | 'review_complete'
    | 'skip'
    | 'reject'
    | 'accept'
    | 'withdraw'
    | 'note_add'
    | 'status_change';

export interface ReviewSubmissionRequest {
    action: ReviewActionType;
    review_notes?: string;
}

export type ReviewSubmissionResponse = OpportunitySubmission;
