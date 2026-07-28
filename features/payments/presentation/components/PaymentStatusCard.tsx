import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ExternalLink, RefreshCw } from 'lucide-react-native';
import {
    getPaymentErrorMessage,
    getPaymentStatusDescription,
    getPaymentStatusLabel,
} from '@/features/payments/domain/utils/payment';
import type { NormalizedPaymentStatus } from '@/features/payments/domain/entities/payment.type';
import { getPaymentStatusTone } from './paymentStatusTone';

interface PaymentStatusCardProps {
    paymentStatus?: NormalizedPaymentStatus;
    orderCode: string | null;
    rawStatus?: string;
    /** Lỗi đọc trạng thái đã được lọc — null khi PayOS đã báo thành công. */
    statusError: unknown;
    pollBudgetExhausted: boolean;
    isTerminalStatus: boolean;
    canRefreshStatus: boolean;
    isFetchingStatus: boolean;
    isOpeningCheckout: boolean;
    canCreateCheckout: boolean;
    onOpenCheckout: () => void;
    onRefreshStatus: () => void;
    onCreateCheckout: () => void;
}

export function PaymentStatusCard({
    paymentStatus,
    orderCode,
    rawStatus,
    statusError,
    pollBudgetExhausted,
    isTerminalStatus,
    canRefreshStatus,
    isFetchingStatus,
    isOpeningCheckout,
    canCreateCheckout,
    onOpenCheckout,
    onRefreshStatus,
    onCreateCheckout,
}: PaymentStatusCardProps) {
    const tone = getPaymentStatusTone(paymentStatus);

    return (
        <View className={`mx-5 mt-5 rounded-2xl p-5 border ${tone.bg} ${tone.border}`}>
            <View className="flex-row items-start gap-3">
                <View className="mt-0.5">{tone.icon}</View>
                <View className="flex-1">
                    <Text className={`text-base font-black ${tone.title}`}>
                        {getPaymentStatusLabel(paymentStatus || 'pending')}
                    </Text>
                    <Text className={`text-sm mt-1 leading-5 ${tone.body}`}>
                        {getPaymentStatusDescription(paymentStatus || 'pending')}
                    </Text>
                    {pollBudgetExhausted && !isTerminalStatus && (
                        <Text className="text-xs text-gray-600 mt-2 leading-4">
                            Giao dịch đang được xử lý — Premium có thể kích hoạt sau ít phút. Kéo để
                            làm mới hoặc bấm nút tải lại.
                        </Text>
                    )}
                    {orderCode && (
                        <Text className="text-xs text-gray-500 mt-3">
                            Mã đơn PayOS: {orderCode}
                        </Text>
                    )}
                    {rawStatus && (
                        <Text className="text-xs text-gray-500 mt-1">
                            Trạng thái API: {rawStatus}
                        </Text>
                    )}
                    {!!statusError && (
                        <Text className="text-xs text-red-600 mt-3">
                            {getPaymentErrorMessage(statusError)}
                        </Text>
                    )}
                </View>
            </View>

            <View className="flex-row gap-3 mt-5">
                {!isTerminalStatus && (
                    <TouchableOpacity
                        onPress={onOpenCheckout}
                        disabled={isOpeningCheckout}
                        className="flex-1 bg-gray-900 rounded-xl py-3 items-center justify-center flex-row gap-2"
                    >
                        {isOpeningCheckout ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <ExternalLink size={17} color="white" />
                                <Text className="text-white font-bold">Mở PayOS</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
                {canRefreshStatus && (
                    <TouchableOpacity
                        onPress={onRefreshStatus}
                        disabled={isFetchingStatus}
                        className={`${isTerminalStatus ? 'flex-1' : 'w-14'} bg-white rounded-xl items-center justify-center border border-gray-200 py-3`}
                    >
                        {isFetchingStatus ? (
                            <ActivityIndicator color="#7C3BED" size="small" />
                        ) : (
                            <RefreshCw size={18} color="#7C3BED" />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {isTerminalStatus && paymentStatus !== 'success' && (
                <TouchableOpacity
                    onPress={onCreateCheckout}
                    disabled={!canCreateCheckout}
                    className="mt-3 bg-purple-600 rounded-xl py-3 items-center"
                >
                    <Text className="text-white font-bold">Tạo phiên thanh toán mới</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
