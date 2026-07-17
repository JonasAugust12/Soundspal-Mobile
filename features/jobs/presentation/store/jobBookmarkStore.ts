import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/shared/infrastructure/storage/mmkvStorage';

interface JobBookmarkState {
    bookmarkedIds: string[];
    isBookmarked: (jobId: string) => boolean;
    toggleBookmark: (jobId: string) => void;
}

export const useJobBookmarkStore = create<JobBookmarkState>()(
    persist(
        (set, get) => ({
            bookmarkedIds: [],
            isBookmarked: (jobId: string) => get().bookmarkedIds.includes(jobId),
            toggleBookmark: (jobId: string) => {
                set((state) => {
                    const exists = state.bookmarkedIds.includes(jobId);
                    return {
                        bookmarkedIds: exists
                            ? state.bookmarkedIds.filter((id) => id !== jobId)
                            : [...state.bookmarkedIds, jobId],
                    };
                });
            },
        }),
        {
            name: 'job-bookmarks',
            storage: createJSONStorage(() => mmkvStorage),
        },
    ),
);
