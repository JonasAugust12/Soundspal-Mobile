import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    PaymentHistoryCard,
    PaymentSecurityCard,
    PaymentStatusCard,
    PremiumBenefitsCard,
    PremiumHeader,
    PremiumHeroCard,
} from '@/features/payments/presentation/components';
import { usePaymentHistoryItems } from '@/features/payments/presentation/hooks/usePaymentApi';
import { usePremiumCheckout } from '@/features/payments/presentation/hooks/usePremiumCheckout';
import { usePremiumStatus } from '@/features/payments/presentation/hooks/usePremiumStatus';

export default function PremiumPaymentScreen() {
    const router = useRouter();
    const premium = usePremiumStatus();
    const checkout = usePremiumCheckout({
        userId: premium.userId,
        isPremium: premium.isPremium,
        refetchCurrentUser: premium.refetchCurrentUser,
    });
    const history = usePaymentHistoryItems({ limit: 20, offset: 0 });

    const ctaLabel =
        premium.isPremium || premium.isPremiumExpired ? 'Gia hạn Premium' : 'Nâng cấp Premium';

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={premium.isRefetchingUser || checkout.isRefetchingStatus}
                        onRefresh={checkout.handleRefresh}
                        tintColor="#7C3BED"
                    />
                }
            >
                <PremiumHeader onBack={() => router.back()} />

                <PremiumHeroCard
                    isPremium={premium.isPremium}
                    isPremiumExpired={premium.isPremiumExpired}
                    billingPeriod={checkout.billingPeriod}
                    onSelectBillingPeriod={checkout.setBillingPeriod}
                    expiresAt={premium.expiresAt}
                    hasActiveCheckout={checkout.hasActiveCheckout}
                    primaryButtonLabel={
                        checkout.hasActiveCheckout ? 'Tiếp tục thanh toán' : ctaLabel
                    }
                    canUsePrimaryButton={checkout.canUsePrimaryButton}
                    isBusy={checkout.isCreatingCheckout || checkout.isOpeningCheckout}
                    onPrimaryPress={
                        checkout.hasActiveCheckout
                            ? checkout.handleOpenExistingCheckout
                            : checkout.handleCreateCheckout
                    }
                />

                <PremiumBenefitsCard
                    role={premium.role}
                    isPremium={premium.isPremium}
                    isPremiumExpired={premium.isPremiumExpired}
                />

                {checkout.hasCheckout && (
                    <PaymentStatusCard
                        paymentStatus={checkout.paymentStatus}
                        orderCode={checkout.orderCode}
                        rawStatus={checkout.rawStatus}
                        statusError={checkout.statusError}
                        pollBudgetExhausted={checkout.pollBudgetExhausted}
                        isTerminalStatus={checkout.isTerminalStatus}
                        canRefreshStatus={checkout.canRefreshStatus}
                        isFetchingStatus={checkout.isFetchingStatus}
                        isOpeningCheckout={checkout.isOpeningCheckout}
                        canCreateCheckout={checkout.canCreateCheckout}
                        onOpenCheckout={checkout.handleOpenExistingCheckout}
                        onRefreshStatus={checkout.handleRefreshStatus}
                        onCreateCheckout={checkout.handleCreateCheckout}
                    />
                )}

                <PaymentHistoryCard items={history.items} isLoading={history.isLoading} />

                <PaymentSecurityCard />
            </ScrollView>
        </SafeAreaView>
    );
}
