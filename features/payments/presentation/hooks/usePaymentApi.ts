import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { PAYMENT_STATUS_STALE_TIME_MS } from '@/features/payments/domain/constants/payment';
import type { PaymentHistoryParams } from '@/features/payments/domain/entities/payment.type';
import {
    extractLatestOrderCodeFromHistory,
    parsePaymentHistoryItems,
} from '@/features/payments/domain/utils/payment';
import { paymentRepository } from '@/features/payments/data/repositories/PaymentRepositoryImpl';

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
        const response = await paymentRepository.getHistory({ limit: 10, offset: 0 });
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

export const useCreatePaymentCheckout = () => {
    return useMutation({
        mutationFn: paymentRepository.createCheckout,
    });
};

export const useGetPaymentHistory = (
    params?: PaymentHistoryParams,
    options?: { enabled?: boolean },
) => {
    return useQuery({
        queryKey: paymentKeys.history(params),
        queryFn: () => paymentRepository.getHistory(params),
        enabled: options?.enabled !== false,
    });
};

/** Lịch sử giao dịch đã chuẩn hoá về `PaymentHistoryItem[]` cho tầng UI. */
export const usePaymentHistoryItems = (params?: PaymentHistoryParams) => {
    const query = useGetPaymentHistory(params);
    const items = useMemo(() => parsePaymentHistoryItems(query.data?.data), [query.data]);

    return { items, isLoading: query.isLoading };
};

export const useGetPaymentStatus = (orderCode?: string | null, options?: { enabled?: boolean }) => {
    const normalizedOrderCode = orderCode?.trim() || null;
    const shouldFetch = options?.enabled !== false && !!normalizedOrderCode;

    return useQuery({
        queryKey: paymentKeys.status(normalizedOrderCode ?? '__none__'),
        queryFn: normalizedOrderCode
            ? () => paymentRepository.getStatus(normalizedOrderCode)
            : skipToken,
        enabled: shouldFetch,
        staleTime: PAYMENT_STATUS_STALE_TIME_MS,
        retry: (failureCount, error) =>
            isPaymentStatusNotFoundError(error) ? failureCount < 8 : failureCount < 1,
        retryDelay: (attemptIndex) => Math.min(3000 * (attemptIndex + 1), 15000),
    });
};
