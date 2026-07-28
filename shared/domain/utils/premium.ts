/**
 * Trạng thái Premium của một user — mirror `lib/premium.ts` bên web để badge/CTA
 * hai nền tảng luôn hiểu giống nhau.
 *
 * Nguồn chuẩn là 2 field user-service trả về: `is_premium` + `premium_expired_at`
 * (webhook PayOS set sau khi thanh toán thành công, +30 ngày / +365 ngày).
 * Cờ `is_premium` một mình là chưa đủ: hết hạn thì backend vẫn để true cho tới lần
 * quét kế tiếp, nên mọi chỗ hiển thị phải so hạn với thời điểm hiện tại.
 */

export interface PremiumUserLike {
    is_premium?: boolean;
    premium_expired_at?: string | null;
}

export type PremiumState = 'none' | 'active' | 'expired';

/** Phân loại riêng mốc `premium_expired_at` so với `now` (không xét cờ is_premium). */
export function premiumExpiryState(
    premiumExpiredAt?: string | null,
    now: Date = new Date(),
): PremiumState {
    if (!premiumExpiredAt) return 'none';

    const expiry = new Date(premiumExpiredAt);
    if (Number.isNaN(expiry.getTime())) return 'none';

    return expiry.getTime() > now.getTime() ? 'active' : 'expired';
}

/**
 * Trạng thái gói của user: chưa từng mua (`none`), còn hạn (`active`),
 * hoặc đã quá hạn (`expired` — hiện CTA gia hạn).
 */
export function getPremiumState(
    user?: PremiumUserLike | null,
    now: Date = new Date(),
): PremiumState {
    if (!user?.is_premium) return 'none';
    return premiumExpiryState(user.premium_expired_at, now);
}

/**
 * Như `getPremiumState` nhưng có đường lui về `tier` cho các endpoint chưa trả
 * `is_premium`/`premium_expired_at`. Chỉ dùng fallback khi thiếu hẳn cờ `is_premium`,
 * vì `tier` không mang hạn dùng nên không phân biệt được `active` với `expired`.
 */
export function resolvePremiumState(
    currentUser?: (PremiumUserLike & { tier?: string }) | null,
    fallbackUser?: { tier?: string } | null,
    now: Date = new Date(),
): PremiumState {
    if (currentUser?.is_premium !== undefined) return getPremiumState(currentUser, now);

    const tier = String(currentUser?.tier || fallbackUser?.tier || 'free').toLowerCase();
    return tier === 'premium' ? 'active' : 'none';
}

/** Chỉ true khi user được gắn cờ premium VÀ hạn còn ở tương lai — điều kiện hiện huy hiệu. */
export function isPremiumActive(user?: PremiumUserLike | null, now: Date = new Date()): boolean {
    return getPremiumState(user, now) === 'active';
}
