import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BriefcaseBusiness, MapPin, Plus, ChevronRight } from 'lucide-react-native';

import { useGetMyPosts, useGetJobs } from '@/features/jobs/presentation/hooks/useJobApi';
import type { Job } from '@/features/jobs/domain/entities/job.type';

const MAX_JOBS = 3;

function JobRow({ job, onPress }: { job: Job; onPress: () => void }) {
    const isOpen = job.status === 'published';
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="p-4 rounded-2xl border border-border bg-card"
        >
            <View className="flex-row items-start justify-between gap-2">
                <Text className="flex-1 font-bold text-foreground" numberOfLines={2}>
                    {job.title}
                </Text>
                <View
                    className={`px-2.5 py-1 rounded-full ${isOpen ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                    <Text
                        className={`text-xs font-bold ${isOpen ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}
                    >
                        {isOpen ? 'Còn tuyển' : 'Đã đóng'}
                    </Text>
                </View>
            </View>
            {!!job.location && (
                <View className="flex-row items-center gap-1.5 mt-2">
                    <MapPin size={14} color="#6B7280" />
                    <Text className="text-xs text-muted-foreground">{job.location}</Text>
                </View>
            )}
            {(job.genres?.length ?? 0) > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mt-2">
                    {job.genres.slice(0, 3).map((g) => (
                        <View
                            key={g}
                            className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30"
                        >
                            <Text className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                {g}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
}

function OpenJobsSection({
    jobs,
    loading,
    isMe,
}: {
    jobs: Job[];
    loading: boolean;
    isMe: boolean;
}) {
    const router = useRouter();
    const openJob = (id: string) => router.push(`/(jobs)/detail?id=${id}` as `${string}`);

    // Ở profile người khác mà không có tin nào thì ẩn hẳn section.
    if (!isMe && !loading && jobs.length === 0) return null;

    return (
        <View className="gap-3">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                        <BriefcaseBusiness size={18} color="#3B82F6" />
                    </View>
                    <Text className="text-lg font-bold text-foreground">Đang tuyển</Text>
                </View>
                {isMe && (
                    <TouchableOpacity
                        onPress={() => router.push('/(jobs)/recruitment-form' as `${string}`)}
                        className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 active:opacity-80"
                    >
                        <Plus size={14} color="#FFFFFF" />
                        <Text className="text-xs font-bold text-white">Đăng tin</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View className="py-6 items-center">
                    <ActivityIndicator size="small" color="#3B82F6" />
                </View>
            ) : jobs.length === 0 ? (
                <View className="py-8 items-center gap-2 bg-muted/30 rounded-2xl">
                    <BriefcaseBusiness size={28} color="#9CA3AF" />
                    <Text className="text-sm text-muted-foreground">Chưa có tin tuyển nào</Text>
                    {isMe && (
                        <TouchableOpacity
                            onPress={() => router.push('/(jobs)/recruitment-form' as `${string}`)}
                            className="flex-row items-center gap-1 mt-1"
                        >
                            <Text className="text-sm font-semibold text-blue-600">
                                Đăng tin đầu tiên
                            </Text>
                            <ChevronRight size={14} color="#3B82F6" />
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View className="gap-3">
                    {jobs.map((job) => (
                        <JobRow key={job.id} job={job} onPress={() => openJob(job.id)} />
                    ))}
                </View>
            )}
        </View>
    );
}

// Own venue → dùng /posts/me (đáng tin cậy)
function VenueOwnOpenJobs() {
    const { data, isLoading } = useGetMyPosts({ pageSize: 20 });
    const jobs = (data?.posts || []).filter((j) => j.status === 'published').slice(0, MAX_JOBS);
    return <OpenJobsSection jobs={jobs} loading={isLoading} isMe />;
}

// Profile venue khác → lọc danh sách published theo creator_username (best-effort như web)
function VenuePublicOpenJobs({ username }: { username: string }) {
    const { data, isLoading } = useGetJobs({ status: 'published', pageSize: 50 });
    const jobs = (data?.posts || [])
        .filter((j) => j.creator_username === username && j.status === 'published')
        .slice(0, MAX_JOBS);
    return <OpenJobsSection jobs={jobs} loading={isLoading} isMe={false} />;
}

interface VenueOpenJobsProps {
    isMe: boolean;
    username?: string;
}

export function VenueOpenJobs({ isMe, username }: VenueOpenJobsProps) {
    if (isMe) return <VenueOwnOpenJobs />;
    if (!username) return null;
    return <VenuePublicOpenJobs username={username} />;
}
