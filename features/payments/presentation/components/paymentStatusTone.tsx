import React from 'react';
import { AlertCircle, CheckCircle2, Clock3, XCircle } from 'lucide-react-native';
import type { NormalizedPaymentStatus } from '@/features/payments/domain/entities/payment.type';

export interface PaymentStatusTone {
    bg: string;
    border: string;
    icon: React.ReactElement;
    title: string;
    body: string;
}

/** Màu + icon theo trạng thái thanh toán; dùng chung cho thẻ trạng thái và lịch sử. */
export function getPaymentStatusTone(
    status: NormalizedPaymentStatus | undefined,
): PaymentStatusTone {
    switch (status) {
        case 'success':
            return {
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                icon: <CheckCircle2 size={22} color="#059669" />,
                title: 'text-emerald-700',
                body: 'text-emerald-600',
            };
        case 'failed':
            return {
                bg: 'bg-red-50',
                border: 'border-red-100',
                icon: <XCircle size={22} color="#DC2626" />,
                title: 'text-red-700',
                body: 'text-red-600',
            };
        case 'cancelled':
            return {
                bg: 'bg-amber-50',
                border: 'border-amber-100',
                icon: <AlertCircle size={22} color="#D97706" />,
                title: 'text-amber-700',
                body: 'text-amber-600',
            };
        case 'pending':
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-100',
                icon: <Clock3 size={22} color="#2563EB" />,
                title: 'text-blue-700',
                body: 'text-blue-600',
            };
        default:
            return {
                bg: 'bg-gray-50',
                border: 'border-gray-100',
                icon: <AlertCircle size={22} color="#6B7280" />,
                title: 'text-gray-800',
                body: 'text-gray-600',
            };
    }
}
