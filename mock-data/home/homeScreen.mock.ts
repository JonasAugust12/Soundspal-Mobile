import type { ArtistItem, JobItem } from '@/features/home/presentation/components';
import type { BlogPost } from '@/features/blog/domain/entities/blog.type';
import type {
    FeaturedJob,
    FeaturedUser,
    FeaturedUsersData,
    FeaturedJobsData,
} from '@/features/explore/domain/entities/search.type';

import { MOCK_HOME_BLOG_POSTS } from './blogPosts.mock';
import {
    MOCK_FEATURED_JOBS,
    MOCK_FEATURED_JOBS_RESPONSE,
    MOCK_HOME_JOB_ITEMS,
} from './featuredJobs.mock';
import {
    MOCK_FEATURED_USERS,
    MOCK_FEATURED_USERS_RESPONSE,
    MOCK_HOME_ARTIST_ITEMS,
} from './featuredUsers.mock';
import { MOCK_HOME_HEADER, MOCK_HOME_SECTIONS } from './homeSections.mock';
import { MOCK_HOME_HERO } from './homeHero.mock';
import { MOCK_HOME_SEARCH } from './homeSearch.mock';

export const MOCK_HOME_SCREEN = {
    header: MOCK_HOME_HEADER,
    search: MOCK_HOME_SEARCH,
    hero: MOCK_HOME_HERO,
    sections: MOCK_HOME_SECTIONS,
    blogPosts: MOCK_HOME_BLOG_POSTS,
    featuredUsers: MOCK_FEATURED_USERS,
    featuredUsersResponse: MOCK_FEATURED_USERS_RESPONSE,
    featuredJobsResponse: MOCK_FEATURED_JOBS_RESPONSE,
    artistItems: MOCK_HOME_ARTIST_ITEMS,
    jobItems: MOCK_HOME_JOB_ITEMS,
} as const;

export function mapFeaturedUsersToArtistItems(
    featuredUsersData: { data: FeaturedUsersData } | undefined,
): ArtistItem[] {
    const users = featuredUsersData?.data?.users?.users;
    if (!users || !Array.isArray(users)) {
        return [];
    }

    return users.map((user: FeaturedUser) => ({
        id: user.id,
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

export type HomeScreenMockData = typeof MOCK_HOME_SCREEN;

export {
    MOCK_HOME_BLOG_POSTS,
    MOCK_FEATURED_USERS,
    MOCK_FEATURED_USERS_RESPONSE,
    MOCK_HOME_ARTIST_ITEMS,
    MOCK_FEATURED_JOBS,
    MOCK_FEATURED_JOBS_RESPONSE,
    MOCK_HOME_JOB_ITEMS,
    MOCK_HOME_HEADER,
    MOCK_HOME_SECTIONS,
    MOCK_HOME_HERO,
    MOCK_HOME_SEARCH,
};
