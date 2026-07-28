import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import {
    formatPaymentDate,
    formatVnd,
    normalizePaymentStatus,
} from '@/features/payments/domain/utils/payment';
import type { PaymentHistoryItem } from '@/features/payments/domain/entities/payment.type';
import { getPaymentStatusTone } from './paymentStatusTone';
import { premiumStyles } from './premiumStyles';

interface PaymentHistoryCardProps {
    items: PaymentHistoryItem[];
    isLoading: boolean;
}

/** Lịch sử thanh toán (billing) — GET /payments/history */
export function PaymentHistoryCard({ items, isLoading }: PaymentHistoryCardProps) {
    return (
        <View className="mx-5 mt-5 bg-white rounded-2xl p-5" style={premiumStyles.sectionCard}>
            <Text className="text-lg font-black text-gray-900">Lịch sử thanh toán</Text>
            {isLoading ? (
                <View className="py-6 items-center">
                    <ActivityIndicator color="#7C3BED" />
                </View>
            ) : items.length === 0 ? (
                <Text className="text-sm text-gray-500 mt-3">Chưa có giao dịch nào.</Text>
            ) : (
                <View className="mt-3">
                    {items.map((item, index) => {
                        const itemTone = getPaymentStatusTone(normalizePaymentStatus(item.status));
                        return (
                            <View
                                key={item.id}
                                className={`flex-row items-center gap-3 py-3 ${
                                    index > 0 ? 'border-t border-gray-100' : ''
                                }`}
                            >
                                <View className="mt-0.5">{itemTone.icon}</View>
                                <View className="flex-1">
                                    <Text
                                        className="text-sm font-bold text-gray-900"
                                        numberOfLines={1}
                                    >
                                        {item.description || 'Soundspal Premium'}
                                    </Text>
                                    <Text className="text-xs text-gray-500 mt-0.5">
                                        {formatPaymentDate(item.created_at) || item.created_at}
                                    </Text>
                                </View>
                                <Text className="text-sm font-black text-gray-900">
                                    {formatVnd(item.amount)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}
