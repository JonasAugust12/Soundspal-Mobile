import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type { ApiResponse } from '@/shared/domain/entities/apiresponse.type';
import type {
    CheckoutRequest,
    CheckoutResponse,
    PaymentCheckoutResult,
    PaymentHistoryParams,
    PaymentStatusData,
    PaymentStatusResult,
} from '@/features/payments/domain/entities/payment.type';
import { mapPaymentStatusResult } from '@/features/payments/domain/utils/payment';

export const paymentRemoteDataSource = {
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
