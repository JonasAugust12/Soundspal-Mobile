import React from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TabScreenWrapper } from '@/components/navigation/TabScreenWrapper';
import { OpportunitySubmissionCard } from '@/components/collab';
import { useGetOpportunitySubmissions, useReviewSubmission } from '@/hooks/useCollabApi';

export default function JobSubmissionsScreen() {
    const router = useRouter();
    const { jobId, jobTitle } = useLocalSearchParams<{
        jobId: string;
        jobTitle: string;
    }>();

    const {
        data: submissionsData,
        isLoading,
        error,
    } = useGetOpportunitySubmissions(jobId || '', {
        page: 1,
        pageSize: 20,
    });

    const { mutate: reviewSubmission, isPending: isReviewing } = useReviewSubmission();

    if (isLoading) {
        return (
            <TabScreenWrapper>
                <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#7C3BED" />
                        <Text className="text-gray-600 dark:text-gray-400 mt-2">
                            Đang tải ứng tuyển...
                        </Text>
                    </View>
                </SafeAreaView>
            </TabScreenWrapper>
        );
    }

    if (error) {
        return (
            <TabScreenWrapper>
                <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-red-600 dark:text-red-400 text-center px-4">
                            Không thể tải danh sách ứng tuyển
                        </Text>
                    </View>
                </SafeAreaView>
            </TabScreenWrapper>
        );
    }

    const submissions = submissionsData?.submissions || [];

    return (
        <TabScreenWrapper>
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <View className="flex-row items-center gap-3 px-4 py-4">
                        <ChevronLeft size={24} color="#7C3BED" onPress={() => router.back()} />
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                Ứng tuyển
                            </Text>
                            <Text
                                className="text-sm text-gray-600 dark:text-gray-400"
                                numberOfLines={1}
                            >
                                {jobTitle}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Content */}
                {submissions.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-10">
                        <Text className="text-gray-500 dark:text-gray-400 text-center px-4">
                            Chưa có ứng tuyển nào cho công việc này
                        </Text>
                    </View>
                ) : (
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <View className="gap-3 pb-10 px-4 mt-4">
                            {submissions.map((submission) => (
                                <OpportunitySubmissionCard
                                    key={submission.id}
                                    item={submission}
                                    onReview={(id, action, notes) => {
                                        reviewSubmission(
                                            { id, body: { action, review_notes: notes } },
                                            {
                                                onSuccess: () => {
                                                    const actionText =
                                                        action === 'accept'
                                                            ? 'chấp nhận'
                                                            : action === 'reject'
                                                              ? 'từ chối'
                                                              : 'bỏ qua';
                                                    Alert.alert(
                                                        'Thành công',
                                                        `Đã ${actionText} ứng tuyển`,
                                                    );
                                                },
                                                onError: (error: any) => {
                                                    Alert.alert(
                                                        'Lỗi',
                                                        error?.message ||
                                                            'Không thể xử lý ứng tuyển',
                                                    );
                                                },
                                            },
                                        );
                                    }}
                                    isReviewing={isReviewing}
                                />
                            ))}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </TabScreenWrapper>
    );
}
