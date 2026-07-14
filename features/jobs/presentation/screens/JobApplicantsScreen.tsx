import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Mail, Phone, Link as LinkIcon, Users } from 'lucide-react-native';
import {
    useGetJobSubmissions,
    useReviewSubmission,
} from '@/features/jobs/presentation/hooks/useJobApi';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { getSubmissionStatusMeta } from '@/features/jobs/domain/utils/submissionStatus';
import { formatDate } from '@/features/jobs/domain/utils/jobFormatters';
import type { OpportunitySubmission } from '@/features/jobs/domain/entities/job.type';

export default function JobApplicantsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const jobId = Array.isArray(params.id) ? params.id[0] : params.id;
    const { showSuccess, showError } = useToast();

    const { data, isLoading, error, refetch, isRefetching } = useGetJobSubmissions(jobId ?? '', {
        pageSize: 50,
    });
    const { mutate: review, isPending: isReviewing } = useReviewSubmission(jobId);
    const [reviewingId, setReviewingId] = useState<string | null>(null);

    const submissions = data?.submissions ?? [];

    const doReview = (submission: OpportunitySubmission, action: 'accept' | 'reject') => {
        const verb = action === 'accept' ? 'Chấp nhận' : 'Từ chối';
        Alert.alert(`${verb} đơn ứng tuyển`, `Bạn có chắc muốn ${verb.toLowerCase()} đơn này?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: verb,
                style: action === 'reject' ? 'destructive' : 'default',
                onPress: () => {
                    setReviewingId(submission.id);
                    review(
                        { submissionId: submission.id, body: { action } },
                        {
                            onSuccess: () =>
                                showSuccess('Thành công', `Đã ${verb.toLowerCase()} đơn ứng tuyển`),
                            onError: (err: unknown) => {
                                const message =
                                    (err as { response?: { data?: { message?: string } } })
                                        ?.response?.data?.message || 'Không thể duyệt đơn';
                                showError('Lỗi', message);
                            },
                            onSettled: () => setReviewingId(null),
                        },
                    );
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: OpportunitySubmission }) => {
        const meta = getSubmissionStatusMeta(item.status);
        const isThisReviewing = isReviewing && reviewingId === item.id;

        return (
            <View className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 gap-2.5">
                <View className="flex-row items-start justify-between gap-2">
                    <Text className="flex-1 text-base font-bold text-gray-900 dark:text-white">
                        {item.full_name || 'Ứng viên'}
                    </Text>
                    <View className={`px-2.5 py-1 rounded-full ${meta.bgClass}`}>
                        <Text className={`text-xs font-semibold ${meta.textClass}`}>
                            {meta.label}
                        </Text>
                    </View>
                </View>

                {item.email ? (
                    <View className="flex-row items-center gap-2">
                        <Mail size={14} color="#9CA3AF" />
                        <Text className="text-sm text-gray-600 dark:text-gray-300">
                            {item.email}
                        </Text>
                    </View>
                ) : null}

                {item.phone_number ? (
                    <View className="flex-row items-center gap-2">
                        <Phone size={14} color="#9CA3AF" />
                        <Text className="text-sm text-gray-600 dark:text-gray-300">
                            {item.phone_number}
                        </Text>
                    </View>
                ) : null}

                {item.cover_letter ? (
                    <Text className="text-sm text-gray-700 dark:text-gray-300" numberOfLines={4}>
                        {item.cover_letter}
                    </Text>
                ) : null}

                {item.portfolio_links?.map((link) => (
                    <TouchableOpacity
                        key={link}
                        onPress={() => Linking.openURL(link)}
                        className="flex-row items-center gap-2"
                        activeOpacity={0.7}
                    >
                        <LinkIcon size={14} color="#7C3BED" />
                        <Text
                            className="text-sm text-purple-600 dark:text-purple-400 underline"
                            numberOfLines={1}
                        >
                            {link}
                        </Text>
                    </TouchableOpacity>
                ))}

                {item.created_at ? (
                    <Text className="text-xs text-gray-400">
                        Nộp ngày {formatDate(item.created_at)}
                    </Text>
                ) : null}

                {item.can_be_reviewed && (
                    <View className="flex-row gap-3 mt-1">
                        <TouchableOpacity
                            onPress={() => doReview(item, 'accept')}
                            disabled={isThisReviewing}
                            className="flex-1 bg-green-500 rounded-xl py-2.5 items-center justify-center"
                            activeOpacity={0.8}
                        >
                            {isThisReviewing ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-semibold text-sm">Chấp nhận</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => doReview(item, 'reject')}
                            disabled={isThisReviewing}
                            className="flex-1 border border-red-400 dark:border-red-500 rounded-xl py-2.5 items-center justify-center"
                            activeOpacity={0.8}
                        >
                            <Text className="text-red-500 font-semibold text-sm">Từ chối</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top', 'left', 'right']}>
            <View className="px-4 py-4 flex-row items-center gap-2">
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <ChevronLeft size={24} color="#7C3BED" />
                </TouchableOpacity>
                <Text className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Đơn ứng tuyển {data?.total ? `(${data.total})` : ''}
                </Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7C3BED" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-center text-red-600 dark:text-red-400 font-semibold">
                        Không thể tải danh sách đơn ứng tuyển
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-semibold">Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={submissions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center px-6 pt-20">
                            <Users size={48} color="#9CA3AF" />
                            <Text className="mt-4 text-center text-gray-500 dark:text-gray-400">
                                Chưa có ai ứng tuyển công việc này
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
