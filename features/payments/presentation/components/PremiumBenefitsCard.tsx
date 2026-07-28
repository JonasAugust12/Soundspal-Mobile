import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { CheckCircle2, Crown, ShieldCheck, Sparkles } from 'lucide-react-native';
import { premiumStyles } from './premiumStyles';

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

interface PremiumBenefitsCardProps {
    role?: string;
    isPremium: boolean;
    isPremiumExpired: boolean;
}

export function PremiumBenefitsCard({
    role,
    isPremium,
    isPremiumExpired,
}: PremiumBenefitsCardProps) {
    const benefits = useMemo(() => getPremiumBenefits(role), [role]);

    return (
        <View className="mx-5 mt-5 bg-white rounded-2xl p-5" style={premiumStyles.sectionCard}>
            <Text className="text-lg font-black text-gray-900">Quyền lợi Premium</Text>
            {isPremiumExpired && (
                <Text className="text-sm text-amber-700 mt-1 leading-5">
                    Gói đã hết hạn nên các quyền lợi dưới đây đang tắt — gia hạn để bật lại.
                </Text>
            )}
            <View className="mt-4 gap-4">
                {benefits.map((benefit) => {
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
    );
}
