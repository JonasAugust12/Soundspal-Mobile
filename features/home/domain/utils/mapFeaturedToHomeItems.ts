import type { ArtistItem, JobItem } from '@/features/home/presentation/components';
import type {
    FeaturedJob,
    FeaturedJobsData,
    FeaturedUser,
    FeaturedUsersData,
} from '@/features/explore/domain/entities/search.type';

/** Chuyển response `/landing/featured-users` sang item hiển thị của ArtistCard. */
export function mapFeaturedUsersToArtistItems(
    featuredUsersData: { data: FeaturedUsersData } | undefined,
): ArtistItem[] {
    const users = featuredUsersData?.data?.users?.users;
    if (!users || !Array.isArray(users)) {
        return [];
    }

    return users.map((user: FeaturedUser) => ({
        id: user.id,
        // Giữ username để điều hướng sang trang cá nhân — nếu không sẽ phải dò ngược
        // sang mảng user gốc theo index (rất dễ lệch khi 2 mảng khác độ dài).
        username: user.username,
        name: user.display_name,
        description: user.brief_bio || `${user.role} chuyên nghiệp`,
        location:
            user.city && user.country
                ? `${user.city}, ${user.country}`
                : user.city || user.country || 'Chưa cập nhật',
        skills: user.genres?.map((g) => g.name).join('/') || 'Chưa cập nhật',
        image: user.avatar_url
            ? { uri: user.avatar_url }
            : require('@/assets/images/user_profile.png'),
        role: user.role,
    }));
}

/** Chuyển response `/landing/featured-jobs` sang item hiển thị của JobCard. */
export function mapFeaturedJobsToJobItems(
    featuredJobsData: { data: FeaturedJobsData } | undefined,
): JobItem[] {
    const jobsList = featuredJobsData?.data?.jobs;
    if (!jobsList || !Array.isArray(jobsList)) {
        return [];
    }

    return jobsList.map((job: FeaturedJob) => ({
        id: job.id,
        title: job.title,
        briefDescription: job.brief_description,
        location: job.location,
        workTime: job.work_time,
        budgetMin: job.budget_min,
        budgetMax: job.budget_max,
        budgetCurrency: job.budget_currency,
        genres: job.genres,
        recruitmentType: job.recruitment_type,
        creatorName: job.creator_display_name,
        creatorAvatar: job.creator_avatar_url ? { uri: job.creator_avatar_url } : undefined,
        postType: job.post_type,
    }));
}
