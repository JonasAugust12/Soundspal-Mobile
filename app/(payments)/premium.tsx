import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    CreditCard,
    Crown,
    ExternalLink,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    XCircle,
} from 'lucide-react-native';
import {
    buildPremiumUpgradeCheckoutRequest,
    useCreatePaymentCheckout,
    useGetPaymentStatus,
} from '@/hooks/usePaymentApi';
import { useGetCurrentUser, userKeys } from '@/hooks/useUserApi';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import {
    PAYMENT_STATUS_POLL_INTERVAL_MS,
    PREMIUM_UPGRADE_DURATION_DAYS,
    PREMIUM_UPGRADE_PAYMENT,
} from '@/constants/payment';
import {
    formatVnd,
    getPaymentErrorMessage,
    getPaymentStatusDescription,
    getPaymentStatusLabel,
    isPaymentTerminal,
} from '@/utils/payment';
import type { NormalizedPaymentStatus, PaymentCheckoutResult } from '@/types/payment.type';

const premiumBenefits = [
    {
        title: 'Ứng tuyển không giới hạn',
        description: 'Không bị giới hạn số lượt ứng tuyển vào cơ hội phù hợp.',
        icon: Sparkles,
    },
    {
        title: 'Bộ lọc tìm kiếm nâng cao',
        description: 'Mở khóa các bộ lọc sâu hơn khi khám phá nghệ sĩ, producer và venue.',
        icon: ShieldCheck,
    },
    {
        title: 'Ưu tiên hiển thị hồ sơ',
        description: 'Tăng khả năng xuất hiện trong kết quả tìm kiếm và đề xuất.',
        icon: Crown,
    },
];

function formatDate(value?: string | null): string | null {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function getStatusTone(status: NormalizedPaymentStatus | undefined) {
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

export default function PremiumPaymentScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { showSuccess, showError, showInfo } = useToast();
    const {
        data: currentUser,
        refetch: refetchCurrentUser,
        isRefetching: isRefetchingUser,
    } = useGetCurrentUser();
    const { mutateAsync: createCheckout, isPending: isCreatingCheckout } =
        useCreatePaymentCheckout();

    const [checkout, setCheckout] = useState<PaymentCheckoutResult | null>(null);
    const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
    const handledTerminalStatus = useRef<NormalizedPaymentStatus | null>(null);
    const appState = useRef(AppState.currentState);

    const orderCode = checkout?.orderCode || null;
    const statusQuery = useGetPaymentStatus(orderCode, {
        enabled: !!orderCode,
    });
    const paymentStatus = statusQuery.data?.status;
    const refetchPaymentStatus = statusQuery.refetch;
    const statusTone = useMemo(() => getStatusTone(paymentStatus), [paymentStatus]);
    const isTerminalStatus = isPaymentTerminal(paymentStatus);

    const tier = String(currentUser?.tier || user?.tier || 'free').toLowerCase();
    const isPremium = tier === 'premium';
    const expiresAt = formatDate(
        currentUser?.subscription_expires_at || currentUser?.expires_at || null,
    );
    const ctaLabel = isPremium ? 'Gia hạn Premium' : 'Nâng cấp Premium';

    const canCreateCheckout =
        !isCreatingCheckout && !isOpeningCheckout && PREMIUM_UPGRADE_PAYMENT.amount > 0;
    const hasActiveCheckout = !!checkout && !isTerminalStatus;
    const primaryButtonLabel = hasActiveCheckout ? 'Tiếp tục thanh toán' : ctaLabel;
    const canUsePrimaryButton = hasActiveCheckout ? !isOpeningCheckout : canCreateCheckout;

    const openCheckoutUrl = useCallback(
        async (checkoutUrl: string) => {
            try {
                setIsOpeningCheckout(true);
                await Linking.openURL(checkoutUrl);
            } catch {
                showError(
                    'Không thể mở PayOS',
                    'Vui lòng thử lại hoặc kiểm tra trình duyệt mặc định.',
                );
            } finally {
                setIsOpeningCheckout(false);
            }
        },
        [showError],
    );

    const handleCreateCheckout = async () => {
        if (!user?.id) {
            showError('Chưa đăng nhập', 'Vui lòng đăng nhập lại trước khi thanh toán.');
            return;
        }

        if (PREMIUM_UPGRADE_PAYMENT.amount <= 0) {
            showError('Chưa cấu hình giá', 'Giá Premium chưa hợp lệ. Vui lòng kiểm tra cấu hình.');
            return;
        }

        try {
            const result = await createCheckout(buildPremiumUpgradeCheckoutRequest(user.id));
            handledTerminalStatus.current = null;
            setCheckout(result);

            if (!result.orderCode) {
                showInfo(
                    'Đã tạo thanh toán',
                    'Không đọc được mã đơn PayOS từ checkout_url nên ứng dụng chưa thể tự kiểm tra trạng thái.',
                );
            }

            await openCheckoutUrl(result.checkoutUrl);
        } catch (error) {
            showError('Không thể tạo thanh toán', getPaymentErrorMessage(error));
        }
    };

    const handleOpenExistingCheckout = async () => {
        if (!checkout?.checkoutUrl) return;
        await openCheckoutUrl(checkout.checkoutUrl);
    };

    const handleRefresh = async () => {
        await refetchCurrentUser();
        if (orderCode) {
            await statusQuery.refetch();
        }
    };

    useEffect(() => {
        handledTerminalStatus.current = null;
    }, [orderCode]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            const wasInactive =
                appState.current === 'inactive' || appState.current === 'background';
            if (wasInactive && nextState === 'active' && orderCode && !isTerminalStatus) {
                void refetchPaymentStatus();
            }
            appState.current = nextState;
        });

        return () => subscription.remove();
    }, [isTerminalStatus, orderCode, refetchPaymentStatus]);

    useEffect(() => {
        if (!orderCode || isTerminalStatus) return;

        const intervalId = setInterval(() => {
            void refetchPaymentStatus();
        }, PAYMENT_STATUS_POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [isTerminalStatus, orderCode, refetchPaymentStatus]);

    useEffect(() => {
        if (!paymentStatus || !isPaymentTerminal(paymentStatus)) return;
        if (handledTerminalStatus.current === paymentStatus) return;

        handledTerminalStatus.current = paymentStatus;

        if (paymentStatus === 'success') {
            showSuccess(
                'Thanh toán thành công',
                'Hệ thống đang kích hoạt Premium cho tài khoản của bạn.',
            );
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
            void refetchCurrentUser();
            return;
        }

        if (paymentStatus === 'cancelled') {
            showInfo('Thanh toán đã hủy', 'Bạn có thể mở lại PayOS hoặc tạo phiên thanh toán mới.');
            return;
        }

        showError('Thanh toán thất bại', 'Giao dịch chưa hoàn tất. Vui lòng thử lại sau.');
    }, [paymentStatus, queryClient, refetchCurrentUser, showError, showInfo, showSuccess]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetchingUser || statusQuery.isRefetching}
                        onRefresh={handleRefresh}
                        tintColor="#7C3BED"
                    />
                }
            >
                <View className="px-5 pt-2 pb-5 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white items-center justify-center"
                        style={styles.iconButton}
                    >
                        <ArrowLeft size={21} color="#111827" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-lg font-black text-gray-900">Premium</Text>
                        <Text className="text-xs text-gray-500">Thanh toán PayOS</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center">
                        <Crown size={21} color="#D97706" />
                    </View>
                </View>

                <View className="mx-5 rounded-3xl overflow-hidden" style={styles.heroCard}>
                    <LinearGradient
                        colors={['#111827', '#7C3BED', '#D97706']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="bg-white/15 px-3 py-1.5 rounded-full">
                                <Text className="text-white text-xs font-bold">
                                    {isPremium ? 'PREMIUM ACTIVE' : 'FREE PLAN'}
                                </Text>
                            </View>
                            <Text className="text-white/80 text-sm">
                                {PREMIUM_UPGRADE_DURATION_DAYS} ngày
                            </Text>
                        </View>

                        <View className="mt-8">
                            <Text className="text-white/75 text-sm font-semibold">
                                Soundspal Premium
                            </Text>
                            <Text className="text-white text-4xl font-black mt-1">
                                {formatVnd(PREMIUM_UPGRADE_PAYMENT.amount)}
                            </Text>
                            {expiresAt && (
                                <Text className="text-white/70 mt-2">
                                    Premium hiện tại hết hạn ngày {expiresAt}
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={
                                hasActiveCheckout
                                    ? handleOpenExistingCheckout
                                    : handleCreateCheckout
                            }
                            disabled={!canUsePrimaryButton}
                            activeOpacity={0.85}
                            className="bg-white rounded-2xl mt-8 py-4 items-center justify-center flex-row gap-2"
                        >
                            {isCreatingCheckout || isOpeningCheckout ? (
                                <ActivityIndicator color="#7C3BED" size="small" />
                            ) : (
                                <>
                                    {hasActiveCheckout ? (
                                        <ExternalLink size={20} color="#7C3BED" />
                                    ) : (
                                        <CreditCard size={20} color="#7C3BED" />
                                    )}
                                    <Text className="text-purple-700 text-base font-black">
                                        {primaryButtonLabel}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                <View className="mx-5 mt-5 bg-white rounded-2xl p-5" style={styles.sectionCard}>
                    <Text className="text-lg font-black text-gray-900">Quyền lợi Premium</Text>
                    <View className="mt-4 gap-4">
                        {premiumBenefits.map((benefit) => {
                            const Icon = benefit.icon;
                            return (
                                <View key={benefit.title} className="flex-row gap-3">
                                    <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
                                        <Icon size={20} color="#7C3BED" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-bold text-gray-900">
                                            {benefit.title}
                                        </Text>
                                        <Text className="text-sm text-gray-600 mt-0.5 leading-5">
                                            {benefit.description}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {checkout && (
                    <View
                        className={`mx-5 mt-5 rounded-2xl p-5 border ${statusTone.bg} ${statusTone.border}`}
                    >
                        <View className="flex-row items-start gap-3">
                            <View className="mt-0.5">{statusTone.icon}</View>
                            <View className="flex-1">
                                <Text className={`text-base font-black ${statusTone.title}`}>
                                    {getPaymentStatusLabel(paymentStatus || 'pending')}
                                </Text>
                                <Text className={`text-sm mt-1 leading-5 ${statusTone.body}`}>
                                    {getPaymentStatusDescription(paymentStatus || 'pending')}
                                </Text>
                                {orderCode && (
                                    <Text className="text-xs text-gray-500 mt-3">
                                        Mã đơn PayOS: {orderCode}
                                    </Text>
                                )}
                                {statusQuery.data?.rawStatus && (
                                    <Text className="text-xs text-gray-500 mt-1">
                                        Trạng thái API: {statusQuery.data.rawStatus}
                                    </Text>
                                )}
                                {statusQuery.error && (
                                    <Text className="text-xs text-red-600 mt-3">
                                        {getPaymentErrorMessage(statusQuery.error)}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View className="flex-row gap-3 mt-5">
                            <TouchableOpacity
                                onPress={handleOpenExistingCheckout}
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
                            <TouchableOpacity
                                onPress={() => statusQuery.refetch()}
                                disabled={!orderCode || statusQuery.isFetching}
                                className="w-14 bg-white rounded-xl items-center justify-center border border-gray-200"
                            >
                                {statusQuery.isFetching ? (
                                    <ActivityIndicator color="#7C3BED" size="small" />
                                ) : (
                                    <RefreshCw
                                        size={18}
                                        color={orderCode ? '#7C3BED' : '#9CA3AF'}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>

                        {isTerminalStatus && paymentStatus !== 'success' && (
                            <TouchableOpacity
                                onPress={handleCreateCheckout}
                                disabled={!canCreateCheckout}
                                className="mt-3 bg-purple-600 rounded-xl py-3 items-center"
                            >
                                <Text className="text-white font-bold">
                                    Tạo phiên thanh toán mới
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View
                    className="mx-5 mt-5 mb-10 bg-white rounded-2xl p-5"
                    style={styles.sectionCard}
                >
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center">
                            <ShieldCheck size={20} color="#059669" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-black text-gray-900">
                                Bảo mật thanh toán
                            </Text>
                            <Text className="text-sm text-gray-600 mt-1 leading-5">
                                Ứng dụng chỉ tạo phiên thanh toán. Việc nhập thông tin và xác nhận
                                giao dịch được thực hiện trên PayOS.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 5,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    heroCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.24,
                shadowRadius: 18,
            },
            android: {
                elevation: 9,
            },
        }),
    },
    heroGradient: {
        padding: 22,
    },
    sectionCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            },
            android: {
                elevation: 1,
            },
        }),
    },
});
