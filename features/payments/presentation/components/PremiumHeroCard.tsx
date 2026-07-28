import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, ExternalLink } from 'lucide-react-native';
import { PremiumBadge } from '@/shared/presentation/ui';
import { PREMIUM_PLANS } from '@/features/payments/domain/constants/payment';
import { formatVnd } from '@/features/payments/domain/utils/payment';
import type { BillingPeriod } from '@/features/payments/domain/entities/payment.type';
import { premiumStyles } from './premiumStyles';

interface PremiumHeroCardProps {
    isPremium: boolean;
    isPremiumExpired: boolean;
    billingPeriod: BillingPeriod;
    onSelectBillingPeriod: (period: BillingPeriod) => void;
    expiresAt: string | null;
    hasActiveCheckout: boolean;
    primaryButtonLabel: string;
    canUsePrimaryButton: boolean;
    isBusy: boolean;
    onPrimaryPress: () => void;
}

export function PremiumHeroCard({
    isPremium,
    isPremiumExpired,
    billingPeriod,
    onSelectBillingPeriod,
    expiresAt,
    hasActiveCheckout,
    primaryButtonLabel,
    canUsePrimaryButton,
    isBusy,
    onPrimaryPress,
}: PremiumHeroCardProps) {
    const selectedPlan = PREMIUM_PLANS[billingPeriod];

    return (
        <View className="mx-5 rounded-3xl overflow-hidden" style={premiumStyles.heroCard}>
            <LinearGradient
                colors={['#111827', '#7C3BED', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={premiumStyles.heroGradient}
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
                    <Text className="text-white/80 text-sm">{selectedPlan.durationDays} ngày</Text>
                </View>

                {/* Toggle tháng / năm — gói năm được đề xuất (2 tháng miễn phí) */}
                <View className="flex-row gap-2 mt-6">
                    {(['yearly', 'monthly'] as BillingPeriod[]).map((period) => {
                        const plan = PREMIUM_PLANS[period];
                        const isSelected = billingPeriod === period;
                        return (
                            <TouchableOpacity
                                key={period}
                                onPress={() => onSelectBillingPeriod(period)}
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
                    onPress={onPrimaryPress}
                    disabled={!canUsePrimaryButton}
                    activeOpacity={0.85}
                    className="bg-white rounded-2xl mt-8 py-4 items-center justify-center flex-row gap-2"
                >
                    {isBusy ? (
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
    );
}
