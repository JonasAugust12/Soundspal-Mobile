import React from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MySubmissionCard } from './MySubmissionCard';
import { JobPostCard } from './JobPostCard';
import { useGetMySubmissions, useGetMyPosts, useWithdrawSubmission } from '@/hooks/useCollabApi';

interface CollabListProps {
    tab: 'sent' | 'received';
    onViewJobDetail?: (jobId: string) => void;
    onViewJobSubmissions?: (jobId: string, jobTitle: string) => void;
}

export const CollabList = ({ tab, onViewJobDetail, onViewJobSubmissions }: CollabListProps) => {
    const {
        data: mySubmissionsData,
        isLoading: mySubmissionsLoading,
        error: mySubmissionsError,
    } = useGetMySubmissions({ page: 1, pageSize: 20 });

    const {
        data: myPostsData,
        isLoading: myPostsLoading,
        error: myPostsError,
    } = useGetMyPosts({ page: 1, pageSize: 20 });

    const { mutate: withdrawSubmission, isPending: isWithdrawing } = useWithdrawSubmission();

    const handleWithdraw = (id: string, reason: string) => {
        withdrawSubmission(
            { id, body: { reason } },
            {
                onSuccess: () => {
                    Alert.alert('Thành công', 'Đã rút đơn ứng tuyển');
                },
                onError: (error: any) => {
                    Alert.alert('Lỗi', error?.message || 'Không thể rút đơn');
                },
            },
        );
    };

    if (tab === 'sent') {
        if (mySubmissionsLoading) {
            return (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7C3BED" />
                    <Text className="text-gray-600 dark:text-gray-400 mt-2">Đang tải...</Text>
                </View>
            );
        }

        if (mySubmissionsError) {
            return (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-600 dark:text-red-400 text-center">
                        Không thể tải ứng tuyển của bạn
                    </Text>
                </View>
            );
        }

        const submissions = mySubmissionsData?.submissions || [];

        if (submissions.length === 0) {
            return (
                <View className="flex-1 items-center justify-center py-10">
                    <Text className="text-gray-500 dark:text-gray-400 text-center">
                        Bạn chưa ứng tuyển vị trí nào
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="gap-3 pb-10 px-4">
                    {submissions.map((submission) => (
                        <MySubmissionCard
                            key={submission.id}
                            item={submission}
                            onWithdraw={handleWithdraw}
                            onViewDetail={onViewJobDetail}
                        />
                    ))}
                </View>
            </ScrollView>
        );
    }

    // 'received' tab - Show my posted jobs
    if (tab === 'received') {
        if (myPostsLoading) {
            return (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7C3BED" />
                    <Text className="text-gray-600 dark:text-gray-400 mt-2">Đang tải...</Text>
                </View>
            );
        }

        if (myPostsError) {
            return (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-600 dark:text-red-400 text-center px-4">
                        Không thể tải danh sách công việc
                    </Text>
                </View>
            );
        }

        const posts = myPostsData?.posts || [];

        if (posts.length === 0) {
            return (
                <View className="flex-1 items-center justify-center py-10">
                    <Text className="text-gray-500 dark:text-gray-400 text-center px-4">
                        Bạn chưa đăng công việc nào
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="gap-3 pb-10 px-4">
                    {posts.map((post) => (
                        <JobPostCard
                            key={post.id}
                            job={{
                                id: post.id,
                                title: post.title,
                                post_type: post.post_type || post.type,
                                created_at: post.created_at,
                                submission_deadline: post.deadline,
                                total_submissions: post.applications_count || 0,
                            }}
                            onPress={() => onViewJobSubmissions?.(post.id, post.title)}
                        />
                    ))}
                </View>
            </ScrollView>
        );
    }
};
