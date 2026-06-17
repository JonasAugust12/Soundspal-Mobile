import type { AxiosError } from 'axios';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import { PREMIUM_UPGRADE_PAYMENT, PAYMENT_STATUS_STALE_TIME_MS } from '@/constants/payment';
import type { ApiResponse } from '@/types/apiresponse.type';
import type {
    CheckoutRequest,
    CheckoutResponse,
    PaymentCheckoutResult,
    PaymentHistoryParams,
    PaymentStatusData,
    PaymentStatusResult,
} from '@/types/payment.type';
import { extractLatestOrderCodeFromHistory, mapPaymentStatusResult } from '@/utils/payment';

const paymentApi = {
    createCheckout: async (body: CheckoutRequest): Promise<PaymentCheckoutResult> => {
        const response = await createApiCall<ApiResponse<CheckoutResponse>, CheckoutRequest>(
            'POST',
            '/payments/checkout',
        )(body);

        const checkoutUrl = response.data?.checkout_url;
        if (!checkoutUrl) {
            throw new Error('Payment API did not return checkout_url.');
        }

        return {
            checkoutUrl,
            orderCode: null,
            message: response.message,
        };
    },

    getHistory: async (params?: PaymentHistoryParams): Promise<ApiResponse<unknown>> => {
        return createApiCall<ApiResponse<unknown>, PaymentHistoryParams>(
            'GET',
            '/payments/history',
        )(params);
    },

    getStatus: async (orderCode: string): Promise<PaymentStatusResult> => {
        const normalizedOrderCode = orderCode.trim();
        if (!normalizedOrderCode || !/^\d+$/.test(normalizedOrderCode)) {
            throw new Error('Missing or invalid PayOS order code.');
        }

        const response = await createApiCall<ApiResponse<PaymentStatusData>>(
            'GET',
            `/payments/status/${encodeURIComponent(normalizedOrderCode)}`,
        )();

        return mapPaymentStatusResult(normalizedOrderCode, response.data || {});
    },
};

function isPaymentStatusNotFoundError(error: unknown): boolean {
    const err = error as AxiosError<{ error?: string }>;
    return err?.response?.status === 404;
}

export async function resolvePaymentOrderCodeFromHistory(
    preferredOrderCode?: string | null,
): Promise<string | null> {
    if (preferredOrderCode?.trim()) {
        return preferredOrderCode.trim();
    }

    try {
        const response = await paymentApi.getHistory({ limit: 10, offset: 0 });
        return extractLatestOrderCodeFromHistory(response.data);
    } catch {
        return null;
    }
}

export const paymentKeys = {
    all: ['payments'] as const,
    history: (params?: PaymentHistoryParams) =>
        [...paymentKeys.all, 'history', params ?? {}] as const,
    status: (orderCode: string) => [...paymentKeys.all, 'status', orderCode] as const,
};

export function buildPremiumUpgradeCheckoutRequest(
    userId: string,
    urls: { redirect_url: string; cancel_url: string },
): CheckoutRequest {
    return {
        ...PREMIUM_UPGRADE_PAYMENT,
        reference_id: userId,
        redirect_url: urls.redirect_url,
        cancel_url: urls.cancel_url,
    };
}

export const useCreatePaymentCheckout = () => {
    return useMutation({
        mutationFn: paymentApi.createCheckout,
    });
};

export const useGetPaymentHistory = (
    params?: PaymentHistoryParams,
    options?: { enabled?: boolean },
) => {
    return useQuery({
        queryKey: paymentKeys.history(params),
        queryFn: () => paymentApi.getHistory(params),
        enabled: options?.enabled !== false,
    });
};

export const useGetPaymentStatus = (orderCode?: string | null, options?: { enabled?: boolean }) => {
    const normalizedOrderCode = orderCode?.trim() || null;
    const shouldFetch = options?.enabled !== false && !!normalizedOrderCode;

    return useQuery({
        queryKey: paymentKeys.status(normalizedOrderCode ?? '__none__'),
        queryFn: normalizedOrderCode ? () => paymentApi.getStatus(normalizedOrderCode) : skipToken,
        enabled: shouldFetch,
        staleTime: PAYMENT_STATUS_STALE_TIME_MS,
        retry: (failureCount, error) =>
            isPaymentStatusNotFoundError(error) ? failureCount < 8 : failureCount < 1,
        retryDelay: (attemptIndex) => Math.min(3000 * (attemptIndex + 1), 15000),
    });
};
