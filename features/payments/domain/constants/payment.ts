import type { BillingPeriod, PremiumPlan } from '@/features/payments/domain/entities/payment.type';

/**
 * Bảng giá Premium — PHẢI khớp bảng giá server (payment-service re-validate amount
 * theo billing_period và từ chối nếu lệch, chống sửa giá phía client).
 *
 * description ≤ 25 ký tự ASCII không dấu: PayOS dùng nó làm memo chuyển khoản VietQR,
 * chuỗi dài/có dấu làm CreatePaymentLink fail.
 */
export const PREMIUM_PLANS: Record<BillingPeriod, PremiumPlan> = {
    monthly: {
        billing_period: 'monthly',
        amount: 49_000,
        description: 'Soundspal Premium 1M',
        durationDays: 30,
        label: 'Hàng tháng',
    },
    yearly: {
        billing_period: 'yearly',
        amount: 490_000,
        description: 'Soundspal Premium 1Y',
        durationDays: 365,
        label: 'Hàng năm',
        // = 10× giá tháng → tặng 2 tháng (~17%). Gói mặc định được đề xuất.
        promo: '2 tháng miễn phí',
    },
};

/** Gói được chọn sẵn khi mở màn Premium (web cũng promote gói năm). */
export const DEFAULT_BILLING_PERIOD: BillingPeriod = 'yearly';

/** Poll trạng thái thanh toán mỗi 2s, tối đa 10 lần (~20s) — khớp recipe của web. */
export const PAYMENT_STATUS_POLL_INTERVAL_MS = 2000;
export const PAYMENT_STATUS_MAX_POLLS = 10;

export const PAYMENT_STATUS_STALE_TIME_MS = 2000;

export const PAYMENT_CURRENCY = 'VND';
