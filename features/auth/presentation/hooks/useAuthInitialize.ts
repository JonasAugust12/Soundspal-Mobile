import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useAuthHydration } from '@/features/auth/presentation/hooks/useAuthHydration';
import { authRepository } from '@/features/auth/data/repositories/AuthRepositoryImpl';

// Guard mức module: chỉ verify token /users/me MỘT lần cho mỗi lần mở app,
// kể cả khi hook được gọi từ nhiều nơi (giống cờ isInitialized bên web).
let initPromise: Promise<void> | null = null;

async function performInitialize(): Promise<void> {
    const { accessToken } = useAuthStore.getState();

    // Không có token → không cần gọi API.
    if (!accessToken) return;

    try {
        const res = await authRepository.getMe();
        const me = res.data;

        if (me) {
            // Làm mới thông tin user từ server (is_verified, avatar, tier... có thể đã đổi).
            useAuthStore.getState().setUser({
                id: me.id,
                email: me.email,
                role: me.role,
                is_verified: me.is_verified,
                username: me.username,
                avatar_url: me.avatar_url,
                display_name: me.display_name,
                tier: me.tier,
            });
        }
    } catch (error) {
        // Token thật sự hết hạn/không refresh được đã được apiClient interceptor xử lý
        // (tự động logout). Lỗi mạng/khác: giữ nguyên phiên, dùng dữ liệu từ JWT.
        console.warn('Auth initialize: không thể làm mới /users/me', error);
    }
}

/**
 * Sau khi MMKV hydrate xong, xác thực access token bằng cách gọi /users/me và
 * làm mới thông tin user. Nếu token không hợp lệ, interceptor 401 → refresh →
 * (thất bại) → logout sẽ tự xử lý. Trả về `true` khi đã kiểm tra xong.
 */
export function useAuthInitialize(): boolean {
    const authHydrated = useAuthHydration();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!authHydrated) return;

        let cancelled = false;
        if (!initPromise) {
            initPromise = performInitialize();
        }
        initPromise.finally(() => {
            if (!cancelled) setInitialized(true);
        });

        return () => {
            cancelled = true;
        };
    }, [authHydrated]);

    return initialized;
}
