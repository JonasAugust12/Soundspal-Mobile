export type PaymentPurpose = 'ACCOUNT_UPGRADE';

export type NormalizedPaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'unknown';

export interface CheckoutRequest {
    amount: number;
    description: string;
    purpose: PaymentPurpose;
    reference_id: string;
}

export interface CheckoutResponse {
    checkout_url: string;
    order_code?: number | string;
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
