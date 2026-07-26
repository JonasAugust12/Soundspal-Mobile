import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/shared/infrastructure/storage/mmkvStorage';
import type { BlogPost } from '@/features/blog/domain/entities/blog.type';

/**
 * Bài viết đã lưu — lưu nguyên object (persist qua MMKV) để tab "Đã lưu" hiển thị được
 * ngay cả khi rời màn rồi quay lại / khởi động lại app.
 *
 * Vẫn ĐỒNG BỘ với backend: mỗi lần bấm gọi POST/DELETE /blogs/{id}/bookmark, và
 * `mergeServer` gộp danh sách từ GET /bookmarks vào store (không ghi đè bằng rỗng để
 * tránh mất bài vừa lưu khi API trả chậm/thiếu).
 */
interface BlogBookmarkState {
    savedPosts: BlogPost[];
    isBookmarked: (postId: string) => boolean;
    addBookmark: (post: BlogPost) => void;
    removeBookmark: (postId: string) => void;
    mergeServer: (serverPosts: BlogPost[]) => void;
}

export const useBlogBookmarkStore = create<BlogBookmarkState>()(
    persist(
        (set, get) => ({
            savedPosts: [],
            isBookmarked: (postId: string) => get().savedPosts.some((p) => p.id === postId),
            addBookmark: (post: BlogPost) =>
                set((state) =>
                    state.savedPosts.some((p) => p.id === post.id)
                        ? state
                        : { savedPosts: [post, ...state.savedPosts] },
                ),
            removeBookmark: (postId: string) =>
                set((state) => ({ savedPosts: state.savedPosts.filter((p) => p.id !== postId) })),
            mergeServer: (serverPosts: BlogPost[]) =>
                set((state) => {
                    if (!serverPosts.length) return state; // đừng ghi đè bằng rỗng
                    const byId = new Map(state.savedPosts.map((p) => [p.id, p]));
                    for (const p of serverPosts) byId.set(p.id, p); // server làm mới nội dung
                    return { savedPosts: [...byId.values()] };
                }),
        }),
        {
            name: 'blog-bookmarks-v1',
            storage: createJSONStorage(() => mmkvStorage),
        },
    ),
);
