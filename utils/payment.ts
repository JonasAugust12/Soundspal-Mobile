import type {
    NormalizedPaymentStatus,
    PaymentStatusData,
    PaymentStatusResult,
} from '@/types/payment.type';

const SUCCESS_STATUSES = new Set([
    'success',
    'succeeded',
    'paid',
    'completed',
    'complete',
    'payment_success',
    'payment_paid',
]);
const PENDING_STATUSES = new Set([
    'pending',
    'processing',
    'created',
    'waiting',
    'open',
    'payment_pending',
]);
const FAILED_STATUSES = new Set([
    'failed',
    'failure',
    'error',
    'expired',
    'timeout',
    'payment_failed',
    'payment_error',
]);
const CANCELLED_STATUSES = new Set([
    'cancelled',
    'canceled',
    'cancel',
    'payment_cancelled',
    'payment_canceled',
]);

interface ApiErrorLike {
    response?: {
        status?: number;
        data?: {
            message?: string;
            error?: string;
        };
    };
    message?: string;
    code?: string;
}

export function formatVnd(amount: number): string {
    return `${amount.toLocaleString('vi-VN')} VND`;
}

export function normalizePaymentStatus(status?: string | null): NormalizedPaymentStatus {
    if (!status) return 'unknown';

    const normalized = status
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');
    const compact = normalized.replace(/_/g, '');

    if (SUCCESS_STATUSES.has(normalized) || SUCCESS_STATUSES.has(compact)) return 'success';
    if (PENDING_STATUSES.has(normalized) || PENDING_STATUSES.has(compact)) return 'pending';
    if (FAILED_STATUSES.has(normalized) || FAILED_STATUSES.has(compact)) return 'failed';
    if (CANCELLED_STATUSES.has(normalized) || CANCELLED_STATUSES.has(compact)) return 'cancelled';

    return 'unknown';
}

export function isPaymentTerminal(status: NormalizedPaymentStatus | undefined): boolean {
    return status === 'success' || status === 'failed' || status === 'cancelled';
}

export function getPaymentStatusLabel(status: NormalizedPaymentStatus): string {
    switch (status) {
        case 'success':
            return 'Thanh toán thành công';
        case 'pending':
            return 'Đang chờ thanh toán';
        case 'failed':
            return 'Thanh toán thất bại';
        case 'cancelled':
            return 'Thanh toán đã hủy';
        default:
            return 'Chưa xác định';
    }
}

export function getPaymentStatusDescription(status: NormalizedPaymentStatus): string {
    switch (status) {
        case 'success':
            return 'Premium sẽ được kích hoạt sau khi hệ thống xử lý webhook từ PayOS.';
        case 'pending':
            return 'Hoàn tất thanh toán trên PayOS, rồi quay lại ứng dụng để kiểm tra trạng thái.';
        case 'failed':
            return 'Giao dịch chưa hoàn tất. Bạn có thể tạo phiên thanh toán mới.';
        case 'cancelled':
            return 'Phiên thanh toán đã bị hủy. Bạn có thể mở lại PayOS hoặc tạo phiên mới.';
        default:
            return 'Ứng dụng chưa đọc được trạng thái từ cổng thanh toán.';
    }
}

export function getPaymentErrorMessage(error: unknown): string {
    const err = error as ApiErrorLike;

    if (err?.response?.status === 400) {
        return (
            err.response.data?.message ||
            err.response.data?.error ||
            'Thông tin thanh toán không hợp lệ.'
        );
    }

    if (err?.response?.status === 401) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    if (err?.response?.status === 404) {
        return 'Không tìm thấy giao dịch thanh toán.';
    }

    if (err?.response?.status && err.response.status >= 500) {
        return 'Máy chủ thanh toán đang gặp sự cố. Vui lòng thử lại sau.';
    }

    if (err?.code === 'ERR_NETWORK') {
        return 'Không thể kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
    }

    return err?.response?.data?.message || err?.message || 'Không thể xử lý thanh toán lúc này.';
}

export function extractPayOSOrderCode(checkoutUrl: string): string | null {
    if (!checkoutUrl) return null;

    try {
        const parsedUrl = new URL(checkoutUrl);
        const queryOrderCode =
            parsedUrl.searchParams.get('orderCode') ||
            parsedUrl.searchParams.get('order_code') ||
            parsedUrl.searchParams.get('order');

        if (queryOrderCode && /^\d+$/.test(queryOrderCode)) {
            return queryOrderCode;
        }

        const pathOrderCode = parsedUrl.pathname
            .split('/')
            .reverse()
            .find((segment) => /^\d+$/.test(segment));

        if (pathOrderCode) {
            return pathOrderCode;
        }
    } catch {
        const fallbackOrderCode = checkoutUrl.match(
            /(?:orderCode|order_code|order)=([0-9]+)/i,
        )?.[1];
        if (fallbackOrderCode) return fallbackOrderCode;

        const numericSegments = checkoutUrl.match(/\d{6,}/g);
        if (numericSegments?.length) return numericSegments[numericSegments.length - 1];
    }

    return null;
}

export function getRawPaymentStatus(data: PaymentStatusData): string | undefined {
    return (
        data.status ||
        data.payment_status ||
        data.paymentStatus ||
        data.transaction_status ||
        data.state
    );
}

export function mapPaymentStatusResult(
    orderCode: string,
    data: PaymentStatusData,
): PaymentStatusResult {
    const rawStatus = getRawPaymentStatus(data);

    return {
        orderCode,
        status: normalizePaymentStatus(rawStatus),
        rawStatus,
        message: data.message || data.description,
        data,
    };
}
