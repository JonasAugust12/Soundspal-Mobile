import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToggleBeatBookmark } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { isBeatBookmarked } from '@/features/challenge/domain/utils/challenge';
import type { Beat } from '@/features/challenge/domain/entities/challenge.type';

interface BeatBookmarkButtonProps {
    beat: Pick<Beat, 'id' | 'is_bookmarked'>;
    /** `icon` = chỉ nút tim (thẻ list); `full` = nút có nhãn "Lưu"/"Đã lưu" (detail). */
    variant?: 'icon' | 'full';
    /** Cập nhật lạc quan phía cha sau khi API thành công (không optimistic trước API). */
    onBookmarkChange?: (beatId: string, isBookmarked: boolean) => void;
}

/**
 * Nút lưu/bỏ lưu một beat (challenge). Recipe của web: gọi API trước → thành công mới
 * đổi trạng thái + toast. Chưa đăng nhập → điều hướng sang màn login (không giả định
 * is_bookmarked=false khi field thiếu).
 */
export function BeatBookmarkButton({
    beat,
    variant = 'icon',
    onBookmarkChange,
}: BeatBookmarkButtonProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const { mutateAsync, isPending } = useToggleBeatBookmark();
    // Trạng thái hiển thị: ưu tiên prop từ server, cập nhật local sau khi toggle.
    const [bookmarked, setBookmarked] = useState<boolean>(isBeatBookmarked(beat));

    // Đồng bộ khi beat (server) đổi — vd sau khi invalidate query.
    React.useEffect(() => {
        setBookmarked(isBeatBookmarked(beat));
    }, [beat]);

    const handleToggle = async () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        if (isPending) return;

        try {
            await mutateAsync({ id: beat.id, isBookmarked: bookmarked });
            const next = !bookmarked;
            setBookmarked(next);
            onBookmarkChange?.(beat.id, next);
            Toast.show({
                type: 'success',
                text1: next ? 'Đã lưu thử thách.' : 'Đã bỏ khỏi thử thách đã lưu.',
            });
        } catch {
            Toast.show({
                type: 'error',
                text1: bookmarked
                    ? 'Không thể bỏ lưu thử thách này.'
                    : 'Không thể lưu thử thách này.',
            });
        }
    };

    if (variant === 'full') {
        return (
            <TouchableOpacity
                onPress={handleToggle}
                disabled={isPending}
                activeOpacity={0.7}
                className={`flex-row items-center justify-center gap-2 h-12 rounded-full border ${
                    bookmarked ? 'bg-primary/10 border-primary/30' : 'bg-white border-gray-200'
                }`}
            >
                {isPending ? (
                    <ActivityIndicator size="small" color="#7d3bed" />
                ) : (
                    <Bookmark
                        size={18}
                        color={bookmarked ? '#7d3bed' : '#6b7280'}
                        fill={bookmarked ? '#7d3bed' : 'transparent'}
                    />
                )}
                <Text
                    className={`font-heading font-bold text-sm ${
                        bookmarked ? 'text-primary' : 'text-gray-700'
                    }`}
                >
                    {bookmarked ? 'Đã lưu' : 'Lưu thử thách'}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={(e) => {
                e.stopPropagation?.();
                handleToggle();
            }}
            disabled={isPending}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-9 h-9 rounded-full bg-white/90 items-center justify-center border border-gray-100"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2,
            }}
        >
            {isPending ? (
                <ActivityIndicator size="small" color="#7d3bed" />
            ) : (
                <Bookmark
                    size={17}
                    color={bookmarked ? '#7d3bed' : '#6b7280'}
                    fill={bookmarked ? '#7d3bed' : 'transparent'}
                />
            )}
        </TouchableOpacity>
    );
}

/** Nút chỉ hiển thị (không bấm) — dùng trong thẻ overlay có sẵn wrapper riêng. */
export function BeatBookmarkBadge({ active }: { active: boolean }) {
    return (
        <View className="w-9 h-9 rounded-full bg-white/90 items-center justify-center">
            <Bookmark
                size={17}
                color={active ? '#7d3bed' : '#6b7280'}
                fill={active ? '#7d3bed' : 'transparent'}
            />
        </View>
    );
}
