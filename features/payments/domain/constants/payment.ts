import type { CheckoutRequest } from '@/features/payments/domain/entities/payment.type';

export const PREMIUM_UPGRADE_PAYMENT: Omit<
    CheckoutRequest,
    'reference_id' | 'redirect_url' | 'cancel_url'
> = {
    purpose: 'ACCOUNT_UPGRADE',
    amount: 2000,
    description: 'Soundspal Premium 30 days',
};

export const PREMIUM_UPGRADE_DURATION_DAYS = 30;

export const PAYMENT_STATUS_POLL_INTERVAL_MS = 5000;

export const PAYMENT_STATUS_STALE_TIME_MS = 5000;

export const PAYMENT_CURRENCY = 'VND';
