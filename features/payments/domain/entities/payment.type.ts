export type PaymentPurpose = 'ACCOUNT_UPGRADE';

export type NormalizedPaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'unknown';

export interface PayOSReturnInfo {
    orderCode: string | null;
    rawStatus: string | null;
    normalizedStatus: NormalizedPaymentStatus;
}

export interface CheckoutRequest {
    amount: number;
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
