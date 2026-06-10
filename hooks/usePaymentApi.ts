import { useMutation, useQuery } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import { PREMIUM_UPGRADE_PAYMENT, PAYMENT_STATUS_STALE_TIME_MS } from '@/constants/payment';
import type { ApiResponse } from '@/types/apiresponse.type';
import type {
    CheckoutRequest,
    CheckoutResponse,
    PaymentCheckoutResult,
    PaymentStatusData,
    PaymentStatusResult,
} from '@/types/payment.type';
import { extractPayOSOrderCode, mapPaymentStatusResult } from '@/utils/payment';

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

        const responseOrderCode = response.data?.order_code;
        const orderCode =
            responseOrderCode !== undefined && responseOrderCode !== null
                ? String(responseOrderCode)
                : extractPayOSOrderCode(checkoutUrl);

        return {
            checkoutUrl,
            orderCode,
            message: response.message,
        };
    },

    getStatus: async (orderCode: string): Promise<PaymentStatusResult> => {
        const response = await createApiCall<ApiResponse<PaymentStatusData>>(
            'GET',
            `/payments/status/${encodeURIComponent(orderCode)}`,
        )();

        return mapPaymentStatusResult(orderCode, response.data || {});
    },
};

export const paymentKeys = {
    all: ['payments'] as const,
    status: (orderCode: string) => [...paymentKeys.all, 'status', orderCode] as const,
};

export function buildPremiumUpgradeCheckoutRequest(userId: string): CheckoutRequest {
    return {
        ...PREMIUM_UPGRADE_PAYMENT,
        reference_id: userId,
    };
}

export const useCreatePaymentCheckout = () => {
    return useMutation({
        mutationFn: paymentApi.createCheckout,
    });
};

export const useGetPaymentStatus = (orderCode?: string | null, options?: { enabled?: boolean }) => {
    const resolvedOrderCode = orderCode || '';

    return useQuery({
        queryKey: paymentKeys.status(resolvedOrderCode),
        queryFn: () => paymentApi.getStatus(resolvedOrderCode),
        enabled: options?.enabled !== false && !!resolvedOrderCode,
        staleTime: PAYMENT_STATUS_STALE_TIME_MS,
    });
};
