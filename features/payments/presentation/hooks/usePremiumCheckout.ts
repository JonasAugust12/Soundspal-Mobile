import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { userKeys } from '@/features/profiles/presentation/hooks/useUserApi';
import {
    DEFAULT_BILLING_PERIOD,
    PAYMENT_STATUS_MAX_POLLS,
    PAYMENT_STATUS_POLL_INTERVAL_MS,
    PREMIUM_PLANS,
} from '@/features/payments/domain/constants/payment';
import {
    buildPayOSReturnUrl,
    buildPremiumUpgradeCheckoutRequest,
    getPaymentErrorMessage,
    isPaymentTerminal,
    parsePayOSReturnUrl,
    resolvePayOSSearchParam,
} from '@/features/payments/domain/utils/payment';
import type {
    BillingPeriod,
    NormalizedPaymentStatus,
    PaymentCheckoutResult,
} from '@/features/payments/domain/entities/payment.type';
import {
    paymentKeys,
    resolvePaymentOrderCodeFromHistory,
    useCreatePaymentCheckout,
    useGetPaymentStatus,
} from '@/features/payments/presentation/hooks/usePaymentApi';

interface UsePremiumCheckoutParams {
    userId?: string;
    /** Đã kích hoạt Premium chưa — dùng để dừng vòng poll hồ sơ sau khi PayOS báo thành công. */
    isPremium: boolean;
    refetchCurrentUser: () => Promise<unknown>;
}

/**
 * Máy trạng thái của một phiên thanh toán PayOS: tạo phiên → mở trình duyệt → nhận
 * deep link quay lại → poll trạng thái → thông báo kết quả.
 */
export function usePremiumCheckout({
    userId,
    isPremium,
    refetchCurrentUser,
}: UsePremiumCheckoutParams) {
    const searchParams = useLocalSearchParams<{
        orderCode?: string | string[];
        order_code?: string | string[];
        status?: string | string[];
    }>();
    const queryClient = useQueryClient();
    const { showSuccess, showError, showInfo } = useToast();
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
    const isTerminalStatus = isPaymentTerminal(paymentStatus);

    const selectedPlan = PREMIUM_PLANS[billingPeriod];
    const paymentReturnUrl = useMemo(() => ExpoLinking.createURL('/(payments)/premium'), []);

    const canCreateCheckout = !isCreatingCheckout && !isOpeningCheckout && selectedPlan.amount > 0;
    const hasActiveCheckout = !!checkout && !isTerminalStatus;

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
        if (!userId) {
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
                buildPremiumUpgradeCheckoutRequest(userId, billingPeriod, {
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

    const handleRefreshStatus = useCallback(() => {
        void refetchPaymentStatus();
    }, [refetchPaymentStatus]);

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
            resolvePayOSSearchParam(searchParams.orderCode) ||
            resolvePayOSSearchParam(searchParams.order_code);

        if (!orderCodeFromParams && !searchParams.status) return;

        const statusFromParams = Array.isArray(searchParams.status)
            ? searchParams.status[0]
            : searchParams.status;

        void applyPayOSReturn(
            buildPayOSReturnUrl(paymentReturnUrl, orderCodeFromParams, statusFromParams),
        );
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

    return {
        billingPeriod,
        setBillingPeriod,
        hasCheckout: !!checkout,
        orderCode,
        paymentStatus,
        isTerminalStatus,
        rawStatus: statusQuery.data?.rawStatus,
        // PayOS đã báo thành công thì lỗi đọc trạng thái không còn đáng hiển thị.
        statusError: payosReturnStatus === 'success' ? null : statusQuery.error,
        pollBudgetExhausted,
        canRefreshStatus: shouldSyncPaymentStatus,
        isFetchingStatus: statusQuery.isFetching,
        isRefetchingStatus: statusQuery.isRefetching,
        isCreatingCheckout,
        isOpeningCheckout,
        hasActiveCheckout,
        canCreateCheckout,
        canUsePrimaryButton: hasActiveCheckout ? !isOpeningCheckout : canCreateCheckout,
        handleCreateCheckout,
        handleOpenExistingCheckout,
        handleRefreshStatus,
        handleRefresh,
    };
}
