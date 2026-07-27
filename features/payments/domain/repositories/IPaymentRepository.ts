import type { ApiResponse } from '@/shared/domain/entities/apiresponse.type';
import type {
    CheckoutRequest,
    PaymentCheckoutResult,
    PaymentHistoryParams,
    PaymentStatusResult,
} from '@/features/payments/domain/entities/payment.type';

export interface IPaymentRepository {
    createCheckout(body: CheckoutRequest): Promise<PaymentCheckoutResult>;
    getHistory(params?: PaymentHistoryParams): Promise<ApiResponse<unknown>>;
    getStatus(orderCode: string): Promise<PaymentStatusResult>;
}
