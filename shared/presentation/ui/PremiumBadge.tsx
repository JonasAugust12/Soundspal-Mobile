import React from 'react';
import { View, Text } from 'react-native';
import { Crown } from 'lucide-react-native';

/** amber-700 — cùng tông với PremiumBadge của web (viền amber-300, nền amber-50). */
const CROWN_COLOR = '#B45309';

type Props = {
    /** `sm` cho thẻ trong danh sách (chỉ icon), `md` cho hồ sơ / màn Premium. */
    size?: 'sm' | 'md';
    showLabel?: boolean;
    className?: string;
};

/**
 * Huy hiệu Premium — quyền lợi đầu tiên user nhận được ngay sau khi thanh toán
 * thành công. Chỉ render khi `isPremiumActive` (xem shared/domain/utils/premium):
 * gói hết hạn thì huy hiệu phải tắt.
 */
export function PremiumBadge({ size = 'md', showLabel = true, className = '' }: Props) {
    const iconSize = size === 'sm' ? 12 : 14;

    return (
        <View
            accessibilityRole="image"
            accessibilityLabel="Premium"
            className={`flex-row items-center gap-1 rounded-full border border-amber-300 bg-amber-50 ${
                size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5'
            } ${className}`}
        >
            <Crown size={iconSize} color={CROWN_COLOR} strokeWidth={2.4} />
            {showLabel && (
                <Text
                    className={`font-semibold text-amber-700 ${
                        size === 'sm' ? 'text-[10px]' : 'text-[11px]'
                    }`}
                >
                    Premium
                </Text>
            )}
        </View>
    );
}
