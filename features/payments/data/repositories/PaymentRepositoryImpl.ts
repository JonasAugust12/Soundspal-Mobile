import type { IPaymentRepository } from '@/features/payments/domain/repositories/IPaymentRepository';
import { paymentRemoteDataSource } from '@/features/payments/data/datasources/paymentsRemoteDataSource';

export class PaymentRepositoryImpl implements IPaymentRepository {
    createCheckout = paymentRemoteDataSource.createCheckout;
    getHistory = paymentRemoteDataSource.getHistory;
    getStatus = paymentRemoteDataSource.getStatus;
}

export const paymentRepository = new PaymentRepositoryImpl();
