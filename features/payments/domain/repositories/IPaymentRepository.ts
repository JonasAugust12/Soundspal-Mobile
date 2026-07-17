import type { paymentRemoteDataSource } from '@/features/payments/data/datasources/paymentsRemoteDataSource';

export interface IPaymentRepository {
    createCheckout(
        ...args: Parameters<typeof paymentRemoteDataSource.createCheckout>
    ): ReturnType<typeof paymentRemoteDataSource.createCheckout>;
    getHistory(
        ...args: Parameters<typeof paymentRemoteDataSource.getHistory>
    ): ReturnType<typeof paymentRemoteDataSource.getHistory>;
    getStatus(
        ...args: Parameters<typeof paymentRemoteDataSource.getStatus>
    ): ReturnType<typeof paymentRemoteDataSource.getStatus>;
}
