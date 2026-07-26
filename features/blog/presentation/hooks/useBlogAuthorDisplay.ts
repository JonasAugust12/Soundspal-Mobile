import { useGetUserByUsername } from '@/features/profiles/presentation/hooks/useUserApi';

/** Tên tài khoản hệ thống — bài viết của tài khoản này hiển thị dưới thương hiệu SoundSpal. */
const SYSTEM_ADMIN_NAME = 'System Administrator';

export interface BlogAuthorDisplay {
    /** Tên hiển thị: "SoundSpal" nếu tác giả là tài khoản hệ thống, ngược lại là tên thật. */
    name: string;
    /** Avatar thật của tác giả (chỉ dùng khi KHÔNG phải SoundSpal). */
    avatarUrl?: string;
    /** true → dùng thương hiệu SoundSpal + logo app. */
    isSoundspal: boolean;
}

/**
 * Quy tắc hiển thị tác giả blog:
 * - Tên tài khoản là "System Administrator" (tài khoản hệ thống) → hiện "SoundSpal" + logo app.
 * - Ngược lại → hiện tên + avatar THẬT của tác giả.
 *
 * Bài viết từ API chỉ có `author_id` nên phải gọi GET /users/{id} để lấy tên/avatar. React Query
 * cache theo id (5 phút) → danh sách nhiều bài cùng một tác giả chỉ gọi mạng 1 lần.
 * Khi chưa tải xong (chưa có tên) tạm coi là SoundSpal để tránh nháy "Tác giả".
 */
export function useBlogAuthorDisplay(authorId?: string): BlogAuthorDisplay {
    const { data: user } = useGetUserByUsername(authorId ?? '', { enabled: !!authorId });
    const realName = (user?.display_name || user?.username || '').trim();
    const isSoundspal = realName === '' || realName === SYSTEM_ADMIN_NAME;

    return {
        name: isSoundspal ? 'SoundSpal' : realName,
        avatarUrl: isSoundspal ? undefined : user?.avatar_url,
        isSoundspal,
    };
}
