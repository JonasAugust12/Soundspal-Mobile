import { queryClient } from '@/shared/infrastructure/api/queryClient';
import { useBlogBookmarkStore } from '@/features/blog/presentation/store/blogBookmarkStore';
import { useJobBookmarkStore } from '@/features/jobs/presentation/store/jobBookmarkStore';
import { clearSyncedFcmToken } from '@/features/notifications/data/deviceInfo';

export function clearUserScopedData(): void {
    // Bookmark lưu nguyên object bài viết/công việc và persist xuống MMKV.
    useBlogBookmarkStore.setState({ savedPosts: [] });
    useJobBookmarkStore.setState({ savedJobs: [] });

    // Backend deactivate thiết bị khi logout — giữ cache token cũ sẽ khiến
    // usePushTokenSync tưởng đã đồng bộ và bỏ qua việc đăng ký lại, push chết im lặng.
    clearSyncedFcmToken();

    // Query key trong repo không chứa user id (vd: ['my-beats']), nên cache của người
    // trước sẽ được phục vụ nguyên vẹn cho người sau nếu không xoá.
    queryClient.clear();
}
