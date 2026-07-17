import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { showAppDialog } from '@/shared/presentation/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, FileText } from 'lucide-react-native';
import {
    useGetMySubmissions,
    useWithdrawSubmission,
} from '@/features/jobs/presentation/hooks/useJobApi';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { getSubmissionStatusMeta } from '@/features/jobs/domain/utils/submissionStatus';
import { formatDate } from '@/features/jobs/domain/utils/jobFormatters';
import type { MySubmission } from '@/features/jobs/domain/entities/job.type';

export default function MyApplicationsScreen() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const { data, isLoading, error, refetch, isRefetching } = useGetMySubmissions({ pageSize: 50 });
    const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawSubmission();
    const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

    const submissions = data?.submissions ?? [];

    const handleWithdraw = (submission: MySubmission) => {
        showAppDialog(
            'Rút đơn ứng tuyển',
            'Bạn có chắc muốn rút đơn? Hành động này không thể hoàn tác và bạn không thể ứng tuyển lại công việc này.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Rút đơn',
                    style: 'destructive',
                    onPress: () => {
                        setWithdrawingId(submission.id);
                        withdraw(
                            { submissionId: submission.id, body: { reason: '' } },
                            {
                                onSuccess: () => showSuccess('Thành công', 'Đã rút đơn ứng tuyển'),
                                onError: (err: unknown) => {
                                    const message =
                                        (err as { response?: { data?: { message?: string } } })
                                            ?.response?.data?.message || 'Không thể rút đơn';
                                    showError('Lỗi', message);
                                },
                                onSettled: () => setWithdrawingId(null),
                            },
                        );
                    },
                },
            ],
        );
    };

    const renderItem = ({ item }: { item: MySubmission }) => {
        const meta = getSubmissionStatusMeta(item.status);
        const isThisWithdrawing = isWithdrawing && withdrawingId === item.id;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(`/(jobs)/detail?id=${item.job.id}` as `${string}`)}
                className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
                <View className="flex-row">
                    <View style={{ width: 4, backgroundColor: meta.accent }} />
                    <View className="flex-1 p-4 gap-2">
                        <View className="flex-row items-start justify-between gap-2">
                            <Text
                                className="flex-1 text-base font-bold text-gray-900 dark:text-white"
                                numberOfLines={2}
                            >
                                {item.job.title}
                            </Text>
                            <View className={`px-2.5 py-1 rounded-full ${meta.bgClass}`}>
                                <Text className={`text-xs font-semibold ${meta.textClass}`}>
                                    {meta.label}
                                </Text>
                            </View>
                        </View>

                        {item.created_at && (
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                Nộp ngày {formatDate(item.created_at)}
                            </Text>
                        )}

                        {item.status === 'rejected' && item.rejection_reason ? (
                            <Text className="text-xs text-red-600 dark:text-red-400">
                                Lý do: {item.rejection_reason}
                            </Text>
                        ) : null}

                        {item.can_withdraw && (
                            <TouchableOpacity
                                onPress={() => handleWithdraw(item)}
                                disabled={isThisWithdrawing}
                                className="mt-1 self-start border border-red-400 dark:border-red-500 rounded-xl px-4 py-2"
                                activeOpacity={0.7}
                            >
                                {isThisWithdrawing ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                ) : (
                                    <Text className="text-sm font-semibold text-red-500">
                                        Rút đơn
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top', 'left', 'right']}>
            <View className="px-4 py-4 flex-row items-center gap-2">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center gap-1"
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={24} color="#7C3BED" />
                </TouchableOpacity>
                <Text className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Đơn ứng tuyển của tôi
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
                            <FileText size={48} color="#9CA3AF" />
                            <Text className="mt-4 text-center text-gray-500 dark:text-gray-400">
                                Bạn chưa ứng tuyển công việc nào
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
