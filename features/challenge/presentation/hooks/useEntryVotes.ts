import { useState } from 'react';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToggleEntryVote } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { isEntryLiked } from '@/features/challenge/domain/utils/challenge';
import type { BeatEntry } from '@/features/challenge/domain/entities/challenge.type';

/**
 * Quản lý trạng thái like/unlike của các entry bảng xếp hạng — dùng chung cho Podium
 * và RankList để tránh lặp logic. Trạng thái ban đầu đọc từ cờ `is_liked` của server
 * (giống web); toggle gọi API TRƯỚC, thành công mới cập nhật local + đồng bộ vote_count.
 * Chưa đăng nhập → điều hướng sang màn login (không tự ý vote).
 */
export function useEntryVotes() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { mutateAsync } = useToggleEntryVote();
    const [overrides, setOverrides] = useState<Record<string, { liked: boolean; count: number }>>(
        {},
    );

    const isLiked = (entry: Pick<BeatEntry, 'id' | 'is_liked'>): boolean =>
        overrides[entry.id]?.liked ?? isEntryLiked(entry);

    const voteCount = (entry: Pick<BeatEntry, 'id' | 'vote_count'>): number =>
        overrides[entry.id]?.count ?? entry.vote_count;

    const toggle = async (entry: Pick<BeatEntry, 'id' | 'is_liked' | 'vote_count'>) => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }

        const liked = isLiked(entry);
        const currentCount = voteCount(entry);
        try {
            await mutateAsync({ entryId: entry.id, isLiked: liked });
            setOverrides((prev) => ({
                ...prev,
                [entry.id]: {
                    liked: !liked,
                    count: Math.max(0, currentCount + (liked ? -1 : 1)),
                },
            }));
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể bình chọn.' });
        }
    };

    return { isLiked, voteCount, toggle };
}
