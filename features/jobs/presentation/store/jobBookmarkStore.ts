import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/shared/infrastructure/storage/mmkvStorage';
import type { Job } from '@/features/jobs/domain/entities/job.type';

/**
 * Lưu công việc phía client (persist qua MMKV).
 *
 * Trước đây chỉ lưu danh sách id, nên tab "Đã lưu" phải lọc từ các job đã tải sẵn ở
 * tab khác — job lưu từ trang chủ / màn chi tiết (không nằm trong danh sách đã tải) sẽ
 * KHÔNG hiện ra dù badge vẫn +1. Giờ lưu nguyên object Job để tab "Đã lưu" hiển thị
 * trực tiếp, không phụ thuộc danh sách nào khác.
 */
interface JobBookmarkState {
    savedJobs: Job[];
    isBookmarked: (jobId: string) => boolean;
    toggleBookmark: (job: Job) => void;
}

export const useJobBookmarkStore = create<JobBookmarkState>()(
    persist(
        (set, get) => ({
            savedJobs: [],
            isBookmarked: (jobId: string) => get().savedJobs.some((j) => j.id === jobId),
            toggleBookmark: (job: Job) => {
                set((state) => {
                    const exists = state.savedJobs.some((j) => j.id === job.id);
                    return {
                        savedJobs: exists
                            ? state.savedJobs.filter((j) => j.id !== job.id)
                            : [job, ...state.savedJobs],
                    };
                });
            },
        }),
        {
            // v2: đổi từ lưu id sang lưu nguyên Job — key mới để không kẹt dữ liệu cũ.
            name: 'job-bookmarks-v2',
            storage: createJSONStorage(() => mmkvStorage),
        },
    ),
);
