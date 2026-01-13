// Collaboration/Partnership Types - từ TalentLink-Mobile job submissions
// API endpoint: https://talentlink.io.vn/api/v1/

export type SubmissionStatus =
  | "pending_review"
  | "accepted"
  | "rejected"
  | "withdrawn";
export type ReviewActionType =
  | "submit"
  | "review_start"
  | "review_complete"
  | "skip"
  | "reject"
  | "accept"
  | "withdraw"
  | "note_add"
  | "status_change";

// Opportunity/Job Info in submission
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

// My Submission - submission I created (ứng tuyển của tôi)
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

// List response for my submissions
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

// Opportunity Submission - submission received for my job post (ứng tuyển nhận được)
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

// List response for opportunity submissions (submissions received for my post)
export interface OpportunitySubmissionsResponse {
  submissions: OpportunitySubmission[];
  total: number;
  total_pages: number;
  page: number;
  page_size: number;
}

// Request bodies
export interface WithdrawSubmissionRequest {
  reason: string;
}

export interface ReviewSubmissionRequest {
  action: ReviewActionType;
  review_notes?: string;
}

export type ReviewSubmissionResponse = OpportunitySubmission;
