export type PaymentPurpose = 'ACCOUNT_UPGRADE';

export type BillingPeriod = 'monthly' | 'yearly';

/** Một gói Premium (giá + kỳ hạn) — server re-validate amount theo billing_period. */
export interface PremiumPlan {
    billing_period: BillingPeriod;
    amount: number;
    /** ≤ 25 ký tự ASCII không dấu — PayOS dùng làm memo VietQR, dài hơn sẽ fail. */
    description: string;
    durationDays: number;
    label: string;
    /** Nhãn khuyến mãi (vd "2 tháng miễn phí") — chỉ gói năm có. */
    promo?: string;
}

/** Một dòng lịch sử giao dịch từ GET /payments/history. */
export interface PaymentHistoryItem {
    id: string;
    amount: number;
    currency: string;
    status: string;
    purpose: string;
    description: string;
    created_at: string;
    order_code?: string;
}

export type NormalizedPaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'unknown';

export interface PayOSReturnInfo {
    orderCode: string | null;
    rawStatus: string | null;
    normalizedStatus: NormalizedPaymentStatus;
}

export interface CheckoutRequest {
    amount: number;
    billing_period: BillingPeriod;
    cancel_url: string;
    description: string;
    purpose: PaymentPurpose;
    redirect_url: string;
    reference_id: string;
}

export interface CheckoutResponse {
    checkout_url: string;
}

export interface PaymentHistoryParams {
    limit?: number;
    offset?: number;
}

export interface PaymentCheckoutResult {
    checkoutUrl: string;
    orderCode: string | null;
    message?: string;
}

export type PaymentStatusData = Record<string, string>;

export interface PaymentStatusResult {
    orderCode: string;
    status: NormalizedPaymentStatus;
    rawStatus?: string;
    message?: string;
    data: PaymentStatusData;
}
