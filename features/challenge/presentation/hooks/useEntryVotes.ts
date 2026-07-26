import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { challengeApi } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { applyEntryLikeToggle, isEntryLiked } from '@/features/challenge/domain/utils/challenge';
import type {
    BeatEntry,
    GetLeaderboardResponse,
} from '@/features/challenge/domain/entities/challenge.type';

/**
 * Quản lý like/unlike của entry bảng xếp hạng — dùng chung cho Podium và RankList.
 *
 * Trạng thái like đọc thẳng từ cache React Query (cờ `is_liked` + `vote_count` server trả).
 * Khi toggle, ta cập nhật LẠC QUAN ngay vào cache `['beat-leaderboard', ...]` rồi mới gọi
 * API; lỗi thì rollback. Nhờ ghi vào cache (không phải state cục bộ), trạng thái like:
 *   - còn nguyên khi rời màn rồi quay lại (trước đây mất vì state cục bộ bị huỷ khi unmount
 *     và cache cũ trong 30s staleTime vẫn là dữ liệu trước khi like);
 *   - khớp với is_liked server trả về khi mở lại màn (không bị "quên" đã like).
 * Chưa đăng nhập → điều hướng sang màn login (không tự ý vote).
 */
export function useEntryVotes() {
    const router = useRouter();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

    /** Ghi trạng thái like mới vào MỌI cache leaderboard đang có (mọi limit/offset). */
    const patchLeaderboardCache = (entryId: string, liked: boolean) => {
        queryClient.setQueriesData<GetLeaderboardResponse>(
            {
                predicate: (query) =>
                    Array.isArray(query.queryKey) && query.queryKey[0] === 'beat-leaderboard',
            },
            (old) => {
                if (!old || !Array.isArray(old.entries)) return old;
                return { ...old, entries: applyEntryLikeToggle(old.entries, entryId, liked) };
            },
        );
    };

    const isLiked = (entry: Pick<BeatEntry, 'is_liked'>): boolean => isEntryLiked(entry);
    const voteCount = (entry: Pick<BeatEntry, 'vote_count'>): number => entry.vote_count;
    const isPending = (entry: Pick<BeatEntry, 'id'>): boolean => pendingIds.has(entry.id);

    const toggle = async (entry: Pick<BeatEntry, 'id' | 'is_liked' | 'vote_count'>) => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        if (pendingIds.has(entry.id)) return;

        const liked = isEntryLiked(entry);
        setPendingIds((prev) => new Set(prev).add(entry.id));
        patchLeaderboardCache(entry.id, !liked); // cập nhật lạc quan

        try {
            if (liked) {
                await challengeApi.removeVote(entry.id);
            } else {
                await challengeApi.voteEntry(entry.id, 'up');
            }
        } catch {
            patchLeaderboardCache(entry.id, liked); // rollback về trạng thái cũ
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể bình chọn.' });
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(entry.id);
                return next;
            });
        }
    };

    return { isLiked, voteCount, toggle, isPending };
}
