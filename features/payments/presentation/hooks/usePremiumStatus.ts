import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useGetCurrentUser } from '@/features/profiles/presentation/hooks/useUserApi';
import { resolvePremiumState } from '@/shared/domain/utils/premium';
import { formatPaymentDate } from '@/features/payments/domain/utils/payment';

/**
 * Trạng thái Premium hiển thị trên màn thanh toán. Nguồn chuẩn là hồ sơ
 * (is_premium + premium_expired_at), `tier` chỉ là đường lui khi backend chưa trả 2 field đó.
 */
export function usePremiumStatus() {
    const { user } = useAuthStore();
    const {
        data: currentUser,
        refetch: refetchCurrentUser,
        isRefetching: isRefetchingUser,
    } = useGetCurrentUser();

    const premiumState = resolvePremiumState(currentUser, user);

    return {
        userId: user?.id,
        role: user?.role,
        isPremium: premiumState === 'active',
        // is_premium=true nhưng đã quá hạn → hết hạn, hiện CTA gia hạn.
        isPremiumExpired: premiumState === 'expired',
        expiresAt: formatPaymentDate(
            currentUser?.premium_expired_at ||
                currentUser?.subscription_expires_at ||
                currentUser?.expires_at ||
                null,
        ),
        refetchCurrentUser,
        isRefetchingUser,
    };
}
