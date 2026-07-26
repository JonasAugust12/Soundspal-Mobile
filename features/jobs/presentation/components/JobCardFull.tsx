import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Bookmark,
    Briefcase,
    Calendar,
    DollarSign,
    MapPin,
    Crown,
    Building2,
    Users,
    BarChart3,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Job } from '@/features/jobs/domain/entities/job.type';
import {
    formatBudget,
    formatDate,
    formatJobType,
    formatPostStatus,
    formatRecruitmentType,
    formatExperienceLevel,
    isJobAcceptingApplications,
} from '@/features/jobs/domain/utils/jobFormatters';
import { cardShadow } from '@/shared/presentation/ui/shadows';
import { Shimmer, InitialsAvatar, BRAND_GRADIENT } from '@/shared/presentation/ui';
import { useJobBookmarkStore } from '@/features/jobs/presentation/store/jobBookmarkStore';

import { JobApplyModal } from './JobApplyModal';

interface JobCardFullProps {
    job: Job;
    isOwned?: boolean;
    onEdit?: () => void;
}

/** Gradient nền cho thumbnail khi ảnh chưa tải xong / lỗi, phối theo loại job. */
const TYPE_GRADIENT: Record<string, readonly [string, string]> = {
    singer: ['#F472B6', '#DB2777'],
    producer: ['#60A5FA', '#4F46E5'],
    venue: ['#FBBF24', '#F97316'],
};
const FALLBACK_GRADIENT: readonly [string, string] = ['#8B5CF6', '#7C3BED'];

export const JobCardFull = React.memo(function JobCardFull({
    job,
    isOwned,
    onEdit,
}: JobCardFullProps) {
    const router = useRouter();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [imgFailed, setImgFailed] = useState(false);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const isBookmarked = useJobBookmarkStore((s) => s.isBookmarked(job.id));
    const toggleBookmark = useJobBookmarkStore((s) => s.toggleBookmark);

    // Thumbnail = avatar của tài khoản đăng tin; không có thì dùng ảnh user mặc định.
    const avatarUri = job.creator_avatar_url?.trim() || job.creator_avatar?.trim();
    const showRemoteAvatar = !!avatarUri && !imgFailed;
    const thumbGradient = TYPE_GRADIENT[job.type] ?? FALLBACK_GRADIENT;

    const formattedBudget = formatBudget(job.budget_min, job.budget_max, job.budget_currency);
    const datePosted = formatDate(job.created_at);
    const jobTypeDisplay = formatJobType(job.type);
    const recruitmentDisplay = formatRecruitmentType(job.recruitment_type);
    const experienceDisplay = formatExperienceLevel(job.experience_level);
    const canApply = !isOwned && isJobAcceptingApplications(job.status);
    const statusLabel = formatPostStatus(job.status);
    const showStatusBadge = isOwned || job.status !== 'published';
    const creatorName = job.creator_display_name?.trim();
    const CreatorIcon = job.creator_role === 'venue' ? Building2 : Users;
    const applicants = job.applications_count;

    const handleViewDetails = () => {
        router.push(`/(jobs)/detail?id=${job.id}` as `${string}`);
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else {
            router.push(`/(jobs)/edit-job?id=${job.id}` as `${string}`);
        }
    };

    const cardBody = (
        <TouchableOpacity
            onPress={handleViewDetails}
            activeOpacity={0.95}
            className={`gap-4 p-4 rounded-3xl bg-white dark:bg-gray-800 ${
                isBookmarked ? '' : 'border border-gray-100 dark:border-gray-700'
            }`}
            style={styles.card}
        >
            {/* Header: thumbnail + title + meta */}
            <View className="flex-row gap-3.5 items-start">
                <View style={styles.thumb} className="rounded-2xl overflow-hidden">
                    <LinearGradient
                        colors={thumbGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    {showRemoteAvatar ? (
                        <Image
                            source={{ uri: avatarUri }}
                            onLoadStart={() => setAvatarLoaded(false)}
                            onLoad={() => setAvatarLoaded(true)}
                            onError={() => setImgFailed(true)}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                        />
                    ) : (
                        <InitialsAvatar
                            fill
                            name={job.creator_display_name || job.creator_username}
                            fontSize={28}
                        />
                    )}
                    {/* Skeleton khi avatar người đăng đang tải */}
                    {showRemoteAvatar && !avatarLoaded && (
                        <Shimmer style={StyleSheet.absoluteFill} />
                    )}
                    {/* Lớp tối nhẹ ở đáy để ảnh sáng không chói. */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.28)']}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                    />
                </View>

                <View className="flex-1 gap-1.5">
                    <View className="flex-row justify-between items-start">
                        <Text
                            className="text-base font-bold text-gray-900 dark:text-white flex-1 pr-2 leading-snug"
                            numberOfLines={2}
                        >
                            {job.title}
                        </Text>
                        <TouchableOpacity
                            className="w-8 h-8 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20"
                            onPress={() => toggleBookmark(job)}
                            accessibilityRole="button"
                            accessibilityLabel={isBookmarked ? 'Bỏ lưu công việc' : 'Lưu công việc'}
                        >
                            <Bookmark
                                size={16}
                                color="#7C3BED"
                                fill={isBookmarked ? '#7C3BED' : 'transparent'}
                            />
                        </TouchableOpacity>
                    </View>

                    {creatorName ? (
                        <View className="flex-row items-center gap-1">
                            <CreatorIcon size={12} color="#9CA3AF" />
                            <Text
                                className="text-xs text-gray-500 dark:text-gray-400 flex-1"
                                numberOfLines={1}
                            >
                                {creatorName}
                            </Text>
                        </View>
                    ) : null}

                    <View className="flex-row items-center gap-1.5 flex-wrap">
                        <View className="bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-md">
                            <Text className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-tight">
                                {jobTypeDisplay}
                            </Text>
                        </View>
                        {experienceDisplay ? (
                            <View className="flex-row items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                                <BarChart3 size={10} color="#6B7280" />
                                <Text className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                    {experienceDisplay}
                                </Text>
                            </View>
                        ) : null}
                        {showStatusBadge && (
                            <View className="bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                                <Text className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                                    {statusLabel}
                                </Text>
                            </View>
                        )}
                        {isOwned && (
                            <View className="flex-row items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/50">
                                <Crown size={10} color="#F59E0B" />
                                <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                                    Của tôi
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Info grid */}
            <View className="flex-row flex-wrap gap-2">
                <InfoChip
                    icon={<Briefcase size={14} color="#7C3BED" />}
                    tintClass="bg-purple-50 dark:bg-purple-900/30"
                    label="Hình thức"
                    value={recruitmentDisplay}
                />
                <InfoChip
                    icon={<DollarSign size={14} color="#059669" />}
                    tintClass="bg-emerald-50 dark:bg-emerald-900/30"
                    label="Ngân sách"
                    value={formattedBudget}
                />
                <InfoChip
                    icon={<MapPin size={14} color="#E11D48" />}
                    tintClass="bg-rose-50 dark:bg-rose-900/30"
                    label="Địa điểm"
                    value={job.location || 'Toàn quốc'}
                />
                <InfoChip
                    icon={<Calendar size={14} color="#2563EB" />}
                    tintClass="bg-blue-50 dark:bg-blue-900/30"
                    label="Ngày đăng"
                    value={datePosted}
                />
            </View>

            {/* Footer: applicants + actions */}
            <View className="flex-row items-center gap-3">
                {applicants > 0 ? (
                    <View className="flex-row items-center gap-1">
                        <Users size={13} color="#9CA3AF" />
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            <Text className="font-bold text-gray-700 dark:text-gray-200">
                                {applicants}
                            </Text>{' '}
                            ứng tuyển
                        </Text>
                    </View>
                ) : null}

                <View className="flex-row gap-2.5 flex-1 justify-end">
                    <TouchableOpacity
                        onPress={handleViewDetails}
                        activeOpacity={0.8}
                        className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 items-center justify-center"
                    >
                        <Text className="text-gray-700 dark:text-gray-200 font-bold text-sm">
                            Chi tiết
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={
                            isOwned
                                ? handleEdit
                                : canApply
                                  ? () => setShowApplyModal(true)
                                  : handleViewDetails
                        }
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#7C3BED', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryButton}
                        >
                            <Text className="text-white font-bold text-sm">
                                {isOwned
                                    ? 'Chỉnh sửa'
                                    : canApply
                                      ? 'Ứng tuyển ngay'
                                      : 'Không nhận ứng tuyển'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="w-full">
            {isBookmarked ? (
                <LinearGradient
                    colors={BRAND_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.savedBorder}
                >
                    {cardBody}
                </LinearGradient>
            ) : (
                cardBody
            )}

            {/* Apply Modal */}
            <JobApplyModal
                visible={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                jobId={job.id}
            />
        </View>
    );
});

interface InfoChipProps {
    icon: React.ReactNode;
    tintClass: string;
    label: string;
    value: string;
}

function InfoChip({ icon, tintClass, label, value }: InfoChipProps) {
    return (
        <View className="flex-row items-center gap-2 bg-gray-50 dark:bg-gray-700/30 px-3 py-2.5 rounded-2xl flex-1 min-w-[47%]">
            <View className={`w-8 h-8 rounded-xl items-center justify-center ${tintClass}`}>
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    {label}
                </Text>
                <Text
                    className="text-xs font-bold text-gray-800 dark:text-gray-100"
                    numberOfLines={1}
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: cardShadow,
    // Vòng viền gradient cho thẻ đã lưu (bookmark).
    savedBorder: {
        borderRadius: 26,
        padding: 2.5,
    },
    thumb: {
        width: 76,
        height: 76,
    },
    primaryButton: {
        paddingHorizontal: 22,
        paddingVertical: 13,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
