import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLinking from 'expo-linking';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
    paymentKeys,
    resolvePaymentOrderCodeFromHistory,
    useCreatePaymentCheckout,
    useGetPaymentHistory,
    useGetPaymentStatus,
} from '@/features/payments/presentation/hooks/usePaymentApi';
import { useGetCurrentUser, userKeys } from '@/features/profiles/presentation/hooks/useUserApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { PremiumBadge } from '@/shared/presentation/ui';
import { getPremiumState } from '@/shared/domain/utils/premium';
import {
    DEFAULT_BILLING_PERIOD,
    PAYMENT_STATUS_MAX_POLLS,
    PAYMENT_STATUS_POLL_INTERVAL_MS,
    PREMIUM_PLANS,
} from '@/features/payments/domain/constants/payment';
import {
    formatVnd,
    getPaymentErrorMessage,
    getPaymentStatusDescription,
    getPaymentStatusLabel,
    isPaymentTerminal,
    normalizePaymentStatus,
    normalizePayOSOrderCode,
    parsePaymentHistoryItems,
    parsePayOSReturnUrl,
} from '@/features/payments/domain/utils/payment';
import type {
    BillingPeriod,
    NormalizedPaymentStatus,
    PaymentCheckoutResult,
} from '@/features/payments/domain/entities/payment.type';

// Quyền lợi theo doc Premium Upgrade: badge Crown + ưu tiên Khám phá cho mọi role;
// venue có thêm quota đăng tin 5 → 100 bài/tháng.
function getPremiumBenefits(role?: string) {
    const benefits = [
        {
            title: 'Huy hiệu uy tín (Crown)',
            description: 'Huy hiệu Premium hiển thị trên hồ sơ và mọi thẻ của bạn.',
            icon: Crown,
        },
        {
            title: 'Ưu tiên đầu trang Khám phá',
            description: 'Hồ sơ của bạn được xếp trên cùng trong mục Khám phá.',
            icon: Sparkles,
        },
    ];

    if (role === 'venue') {
        benefits.push({
            title: 'Đăng 100 tin tuyển dụng/tháng',
            description: 'Nâng hạn mức đăng tin tuyển dụng từ 5 lên 100 bài mỗi tháng.',
            icon: ShieldCheck,
        });
    }

    return benefits;
}

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

function resolveSearchParam(value?: string | string[]): string | null {
    if (!value) return null;

    const raw = Array.isArray(value) ? value[0] : value;
    return normalizePayOSOrderCode(raw);
}

export default function PremiumPaymentScreen() {
    const router = useRouter();
    const searchParams = useLocalSearchParams<{
        orderCode?: string | string[];
        order_code?: string | string[];
        status?: string | string[];
    }>();
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
    const [payosReturnStatus, setPayosReturnStatus] = useState<NormalizedPaymentStatus | null>(
        null,
    );
    const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
    // Gói năm là mặc định được đề xuất (2 tháng miễn phí) — giống web /pricing.
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(DEFAULT_BILLING_PERIOD);
    // Poll ngân sách: 2s × 10 lần (~20s); hết ngân sách mà vẫn pending → màn "đang xử lý"
    // (premium vẫn có thể kích hoạt qua webhook ngay sau đó).
    const [pollBudgetExhausted, setPollBudgetExhausted] = useState(false);
    const pollCount = useRef(0);
    const handledTerminalStatus = useRef<NormalizedPaymentStatus | null>(null);
    const appState = useRef(AppState.currentState);

    const orderCode = checkout?.orderCode || null;
    const shouldSyncPaymentStatus =
        !!orderCode && !isPaymentTerminal(payosReturnStatus ?? undefined);
    const statusQuery = useGetPaymentStatus(orderCode, {
        enabled: shouldSyncPaymentStatus,
    });
    const paymentStatus = payosReturnStatus || statusQuery.data?.status;
    const refetchPaymentStatus = statusQuery.refetch;
    const statusTone = useMemo(() => getStatusTone(paymentStatus), [paymentStatus]);
    const isTerminalStatus = isPaymentTerminal(paymentStatus);

    const selectedPlan = PREMIUM_PLANS[billingPeriod];
    const premiumBenefits = useMemo(() => getPremiumBenefits(user?.role), [user?.role]);

    // Trạng thái Premium đọc từ profile (is_premium + premium_expired_at — nguồn chuẩn
    // theo doc). Fallback về tier cũ khi backend chưa trả 2 field mới.
    const tier = String(currentUser?.tier || user?.tier || 'free').toLowerCase();
    const hasPremiumFlags = currentUser?.is_premium !== undefined;
    const premiumState = hasPremiumFlags
        ? getPremiumState(currentUser)
        : tier === 'premium'
          ? 'active'
          : 'none';
    const isPremium = premiumState === 'active';
    // is_premium=true nhưng đã quá hạn → hết hạn, hiện CTA gia hạn.
    const isPremiumExpired = premiumState === 'expired';
    const expiresAt = formatDate(
        currentUser?.premium_expired_at ||
            currentUser?.subscription_expires_at ||
            currentUser?.expires_at ||
            null,
    );
    const paymentReturnUrl = useMemo(() => ExpoLinking.createURL('/(payments)/premium'), []);
    const ctaLabel = isPremium || isPremiumExpired ? 'Gia hạn Premium' : 'Nâng cấp Premium';

    const historyQuery = useGetPaymentHistory({ limit: 20, offset: 0 });
    const historyItems = useMemo(
        () => parsePaymentHistoryItems(historyQuery.data?.data),
        [historyQuery.data],
    );

    const canCreateCheckout = !isCreatingCheckout && !isOpeningCheckout && selectedPlan.amount > 0;
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

        if (selectedPlan.amount <= 0) {
            showError('Chưa cấu hình giá', 'Giá Premium chưa hợp lệ. Vui lòng kiểm tra cấu hình.');
            return;
        }

        try {
            // PayOS đính orderCode/id vào redirect_url, và cancel=1 vào cancel_url.
            const result = await createCheckout(
                buildPremiumUpgradeCheckoutRequest(user.id, billingPeriod, {
                    redirect_url: paymentReturnUrl,
                    cancel_url: `${paymentReturnUrl}?cancel=1`,
                }),
            );
            handledTerminalStatus.current = null;
            pollCount.current = 0;
            setPollBudgetExhausted(false);
            setPayosReturnStatus(null);
            setCheckout(result);

            await openCheckoutUrl(result.checkoutUrl);
        } catch (error) {
            showError('Không thể tạo thanh toán', getPaymentErrorMessage(error));
        }
    };

    const handleOpenExistingCheckout = async () => {
        if (!checkout?.checkoutUrl) return;
        await openCheckoutUrl(checkout.checkoutUrl);
    };

    const handleRefresh = useCallback(async () => {
        await refetchCurrentUser();
        if (shouldSyncPaymentStatus) {
            await refetchPaymentStatus();
        }
    }, [refetchCurrentUser, refetchPaymentStatus, shouldSyncPaymentStatus]);

    const applyPayOSReturn = useCallback(
        async (url?: string | null) => {
            if (!url) return;

            const payosReturn = parsePayOSReturnUrl(url);
            if (payosReturn.normalizedStatus !== 'unknown') {
                setPayosReturnStatus(payosReturn.normalizedStatus);
            }

            let resolvedOrderCode = payosReturn.orderCode;
            if (!resolvedOrderCode) {
                resolvedOrderCode = await resolvePaymentOrderCodeFromHistory(orderCode);
            }

            if (resolvedOrderCode) {
                setCheckout((previousCheckout) => ({
                    checkoutUrl: previousCheckout?.checkoutUrl || '',
                    orderCode: resolvedOrderCode,
                    message: previousCheckout?.message,
                }));
            }

            void refetchCurrentUser();

            if (!resolvedOrderCode && orderCode) {
                void refetchPaymentStatus();
            }
        },
        [orderCode, refetchCurrentUser, refetchPaymentStatus],
    );

    const handlePaymentReturnUrl = useCallback(
        (url?: string | null) => {
            void applyPayOSReturn(url);
        },
        [applyPayOSReturn],
    );

    useEffect(() => {
        const orderCodeFromParams =
            resolveSearchParam(searchParams.orderCode) ||
            resolveSearchParam(searchParams.order_code);

        if (!orderCodeFromParams && !searchParams.status) return;

        const statusFromParams = Array.isArray(searchParams.status)
            ? searchParams.status[0]
            : searchParams.status;
        const syntheticReturnUrl = statusFromParams
            ? `${paymentReturnUrl}?orderCode=${orderCodeFromParams || ''}&status=${encodeURIComponent(statusFromParams)}`
            : orderCodeFromParams
              ? `${paymentReturnUrl}?orderCode=${orderCodeFromParams}`
              : null;

        void applyPayOSReturn(syntheticReturnUrl);
    }, [
        applyPayOSReturn,
        paymentReturnUrl,
        searchParams.orderCode,
        searchParams.order_code,
        searchParams.status,
    ]);

    useEffect(() => {
        void Linking.getInitialURL().then(handlePaymentReturnUrl);

        const subscription = Linking.addEventListener('url', ({ url }) => {
            handlePaymentReturnUrl(url);
        });

        return () => subscription.remove();
    }, [handlePaymentReturnUrl]);

    useEffect(() => {
        handledTerminalStatus.current = null;
        pollCount.current = 0;
        setPollBudgetExhausted(false);
    }, [orderCode]);

    useEffect(() => {
        if (payosReturnStatus !== 'success' || isPremium) return;

        const intervalId = setInterval(() => {
            void refetchCurrentUser();
        }, PAYMENT_STATUS_POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [isPremium, payosReturnStatus, refetchCurrentUser]);

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
        if (!orderCode || isTerminalStatus || pollBudgetExhausted) return;

        // Recipe của web: poll mỗi 2s, tối đa 10 lần (~20s). Hết ngân sách mà vẫn
        // PENDING → dừng poll, hiện "đang xử lý" (webhook có thể kích hoạt trễ hơn).
        const intervalId = setInterval(() => {
            pollCount.current += 1;
            if (pollCount.current > PAYMENT_STATUS_MAX_POLLS) {
                setPollBudgetExhausted(true);
                return;
            }
            void refetchPaymentStatus();
        }, PAYMENT_STATUS_POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [isTerminalStatus, orderCode, pollBudgetExhausted, refetchPaymentStatus]);

    useEffect(() => {
        if (!paymentStatus || !isPaymentTerminal(paymentStatus)) return;
        if (handledTerminalStatus.current === paymentStatus) return;

        handledTerminalStatus.current = paymentStatus;

        if (paymentStatus === 'success') {
            showSuccess(
                'Thanh toán thành công',
                'Hệ thống đang kích hoạt Premium cho tài khoản của bạn.',
            );
            // Re-fetch profile để nhận is_premium/premium_expired_at mới (webhook set
            // bất đồng bộ) + làm mới lịch sử giao dịch. Invalidate cả nhánh `users` vì
            // huy hiệu Premium còn đọc từ cache hồ sơ theo username, không chỉ /users/me.
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
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
                            <View className="flex-row items-center gap-2">
                                <View className="bg-white/15 px-3 py-1.5 rounded-full">
                                    <Text className="text-white text-xs font-bold">
                                        {isPremium
                                            ? 'PREMIUM ACTIVE'
                                            : isPremiumExpired
                                              ? 'PREMIUM HẾT HẠN'
                                              : 'FREE PLAN'}
                                    </Text>
                                </View>
                                {/* Huy hiệu thật — đúng thứ sẽ hiện trên hồ sơ và thẻ tìm kiếm. */}
                                {isPremium && <PremiumBadge size="sm" />}
                            </View>
                            <Text className="text-white/80 text-sm">
                                {selectedPlan.durationDays} ngày
                            </Text>
                        </View>

                        {/* Toggle tháng / năm — gói năm được đề xuất (2 tháng miễn phí) */}
                        <View className="flex-row gap-2 mt-6">
                            {(['yearly', 'monthly'] as BillingPeriod[]).map((period) => {
                                const plan = PREMIUM_PLANS[period];
                                const isSelected = billingPeriod === period;
                                return (
                                    <TouchableOpacity
                                        key={period}
                                        onPress={() => setBillingPeriod(period)}
                                        activeOpacity={0.85}
                                        className={`flex-1 rounded-2xl px-3 py-3 border ${
                                            isSelected
                                                ? 'bg-white border-white'
                                                : 'bg-white/10 border-white/25'
                                        }`}
                                    >
                                        <Text
                                            className={`text-sm font-black ${
                                                isSelected ? 'text-purple-700' : 'text-white'
                                            }`}
                                        >
                                            {plan.label}
                                        </Text>
                                        <Text
                                            className={`text-xs mt-0.5 font-semibold ${
                                                isSelected ? 'text-gray-600' : 'text-white/75'
                                            }`}
                                        >
                                            {formatVnd(plan.amount)}
                                        </Text>
                                        {plan.promo && (
                                            <View
                                                className={`self-start mt-1.5 px-2 py-0.5 rounded-full ${
                                                    isSelected ? 'bg-amber-100' : 'bg-white/20'
                                                }`}
                                            >
                                                <Text
                                                    className={`text-[10px] font-bold ${
                                                        isSelected ? 'text-amber-700' : 'text-white'
                                                    }`}
                                                >
                                                    {plan.promo}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View className="mt-6">
                            <Text className="text-white/75 text-sm font-semibold">
                                Soundspal Premium · {selectedPlan.label.toLowerCase()}
                            </Text>
                            <Text className="text-white text-4xl font-black mt-1">
                                {formatVnd(selectedPlan.amount)}
                            </Text>
                            {expiresAt && (
                                <Text className="text-white/70 mt-2">
                                    {isPremiumExpired
                                        ? `Premium đã hết hạn ngày ${expiresAt} — gia hạn để tiếp tục quyền lợi`
                                        : `Premium hiện tại hết hạn ngày ${expiresAt}`}
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
                    {isPremiumExpired && (
                        <Text className="text-sm text-amber-700 mt-1 leading-5">
                            Gói đã hết hạn nên các quyền lợi dưới đây đang tắt — gia hạn để bật lại.
                        </Text>
                    )}
                    <View className="mt-4 gap-4">
                        {premiumBenefits.map((benefit) => {
                            const Icon = benefit.icon;
                            return (
                                <View key={benefit.title} className="flex-row gap-3">
                                    <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
                                        <Icon size={20} color="#7C3BED" />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-2 flex-wrap">
                                            <Text className="text-base font-bold text-gray-900">
                                                {benefit.title}
                                            </Text>
                                            {/* Gói còn hạn → quyền lợi đã bật thật, giống thẻ /billing của web. */}
                                            {isPremium && (
                                                <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 size={12} color="#059669" />
                                                    <Text className="text-[10px] font-bold text-emerald-700">
                                                        Đang bật
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
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
                                {pollBudgetExhausted && !isTerminalStatus && (
                                    <Text className="text-xs text-gray-600 mt-2 leading-4">
                                        Giao dịch đang được xử lý — Premium có thể kích hoạt sau ít
                                        phút. Kéo để làm mới hoặc bấm nút tải lại.
                                    </Text>
                                )}
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
                                {statusQuery.error && payosReturnStatus !== 'success' && (
                                    <Text className="text-xs text-red-600 mt-3">
                                        {getPaymentErrorMessage(statusQuery.error)}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View className="flex-row gap-3 mt-5">
                            {!isTerminalStatus && (
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
                            )}
                            {shouldSyncPaymentStatus && (
                                <TouchableOpacity
                                    onPress={() => statusQuery.refetch()}
                                    disabled={statusQuery.isFetching}
                                    className={`${isTerminalStatus ? 'flex-1' : 'w-14'} bg-white rounded-xl items-center justify-center border border-gray-200 py-3`}
                                >
                                    {statusQuery.isFetching ? (
                                        <ActivityIndicator color="#7C3BED" size="small" />
                                    ) : (
                                        <RefreshCw size={18} color="#7C3BED" />
                                    )}
                                </TouchableOpacity>
                            )}
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

                {/* Lịch sử thanh toán (billing) — GET /payments/history */}
                <View className="mx-5 mt-5 bg-white rounded-2xl p-5" style={styles.sectionCard}>
                    <Text className="text-lg font-black text-gray-900">Lịch sử thanh toán</Text>
                    {historyQuery.isLoading ? (
                        <View className="py-6 items-center">
                            <ActivityIndicator color="#7C3BED" />
                        </View>
                    ) : historyItems.length === 0 ? (
                        <Text className="text-sm text-gray-500 mt-3">Chưa có giao dịch nào.</Text>
                    ) : (
                        <View className="mt-3">
                            {historyItems.map((item, index) => {
                                const itemTone = getStatusTone(normalizePaymentStatus(item.status));
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
                                                {formatDate(item.created_at) || item.created_at}
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
