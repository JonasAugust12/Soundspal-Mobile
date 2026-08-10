import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Linking,
} from 'react-native';
import { showAppDialog } from '@/shared/presentation/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    Mail,
    Phone,
    Link as LinkIcon,
    Users,
    CheckSquare,
    Square,
    MessageCircle,
    Handshake,
} from 'lucide-react-native';
import {
    useGetJobSubmissions,
    useGetJobById,
    useReviewSubmission,
    useBulkReviewSubmissions,
} from '@/features/jobs/presentation/hooks/useJobApi';
import { useGetOrCreateConversation } from '@/features/messaging/presentation/hooks/useMessagingApi';
import { useMessagingStore } from '@/features/messaging/presentation/store/messagingStore';
import { CreateCollabRequestModal } from '@/features/collabRequests';
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
    const { mutate: bulkReview, isPending: isBulkReviewing } = useBulkReviewSubmissions(jobId);
    const [reviewingId, setReviewingId] = useState<string | null>(null);

    // Sau khi chấp nhận đơn, chủ tin có thể nhắn ứng viên hoặc gửi đề nghị hợp tác 1-1
    // (xem docs/mobile-team/collaboration-messaging-sync.md, mục 2).
    const { data: job } = useGetJobById(jobId ?? '', { enabled: Boolean(jobId) });
    const setPendingJobRef = useMessagingStore((s) => s.setPendingJobRef);
    const { mutate: getOrCreateConversation, isPending: isOpeningChat } =
        useGetOrCreateConversation();
    const [collabTarget, setCollabTarget] = useState<OpportunitySubmission | null>(null);

    const applicantName = (item: OpportunitySubmission) =>
        item.creator_display_name || item.full_name || item.creator_username || 'Ứng viên';

    const messageApplicant = (item: OpportunitySubmission) => {
        if (!item.creator_id) return;
        getOrCreateConversation(item.creator_id, {
            onSuccess: (conversation) => {
                // Giữ format JOB_REF khi nhắn từ ngữ cảnh job (spec mục 2.2).
                if (job) {
                    const budgetLabel =
                        job.budget_min || job.budget_max
                            ? `${job.budget_min ?? ''}${
                                  job.budget_max ? ` - ${job.budget_max}` : ''
                              } ${job.budget_currency ?? ''}`.trim()
                            : undefined;
                    setPendingJobRef(conversation.id, {
                        jobData: {
                            id: job.id,
                            title: job.title,
                            location: job.location,
                            type: job.post_type,
                            budget: budgetLabel,
                            description: job.description,
                        },
                        defaultText: `Chào ${applicantName(item)}, đơn ứng tuyển "${job.title}" của bạn đã được chấp nhận.`,
                    });
                }
                router.push(
                    `/(messages)/detailMessage?conversationId=${conversation.id}` as `${string}`,
                );
            },
            onError: () => showError('Lỗi', 'Không thể mở cuộc trò chuyện'),
        });
    };

    // Chế độ chọn nhiều để duyệt hàng loạt.
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const submissions = data?.submissions ?? [];
    const reviewableCount = submissions.filter((s) => s.can_be_reviewed).length;

    const toggleSelect = (id: string) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );

    const exitSelection = () => {
        setSelectionMode(false);
        setSelectedIds([]);
    };

    const doBulk = (action: 'accept' | 'reject') => {
        if (selectedIds.length === 0) return;
        const verb = action === 'accept' ? 'Chấp nhận' : 'Từ chối';
        showAppDialog(
            `${verb} ${selectedIds.length} đơn`,
            `Bạn có chắc muốn ${verb.toLowerCase()} ${selectedIds.length} đơn đã chọn?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: verb,
                    style: action === 'reject' ? 'destructive' : 'default',
                    onPress: () =>
                        bulkReview(
                            { submission_ids: selectedIds, action },
                            {
                                onSuccess: (res) => {
                                    showSuccess(
                                        'Thành công',
                                        `Đã ${verb.toLowerCase()} ${res.success_count} đơn` +
                                            (res.failure_count > 0
                                                ? `, ${res.failure_count} lỗi`
                                                : ''),
                                    );
                                    exitSelection();
                                },
                                onError: (err: unknown) => {
                                    const message =
                                        (err as { response?: { data?: { message?: string } } })
                                            ?.response?.data?.message ||
                                        'Không thể duyệt hàng loạt';
                                    showError('Lỗi', message);
                                },
                            },
                        ),
                },
            ],
        );
    };

    const doReview = (submission: OpportunitySubmission, action: 'accept' | 'reject') => {
        const verb = action === 'accept' ? 'Chấp nhận' : 'Từ chối';
        showAppDialog(`${verb} đơn ứng tuyển`, `Bạn có chắc muốn ${verb.toLowerCase()} đơn này?`, [
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
        const selectable = item.can_be_reviewed;
        const selected = selectedIds.includes(item.id);
        // Nhắn tin / gửi hợp tác chỉ mở sau khi đơn được chấp nhận; pending & rejected không có.
        const showAcceptedActions =
            !selectionMode && item.status === 'accepted' && Boolean(item.creator_id);

        return (
            <View
                className={`mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 border p-4 gap-2.5 ${selectionMode && selected ? 'border-purple-500' : 'border-gray-100 dark:border-gray-700'}`}
            >
                <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-row items-center gap-2 flex-1">
                        {selectionMode && selectable && (
                            <TouchableOpacity
                                onPress={() => toggleSelect(item.id)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                {selected ? (
                                    <CheckSquare size={22} color="#7C3BED" />
                                ) : (
                                    <Square size={22} color="#9CA3AF" />
                                )}
                            </TouchableOpacity>
                        )}
                        <Text className="flex-1 text-base font-bold text-gray-900 dark:text-white">
                            {item.full_name || 'Ứng viên'}
                        </Text>
                    </View>
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

                {!selectionMode && item.can_be_reviewed && (
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

                {showAcceptedActions && (
                    <View className="flex-row gap-3 mt-1">
                        <TouchableOpacity
                            onPress={() => messageApplicant(item)}
                            disabled={isOpeningChat}
                            className="flex-1 flex-row items-center justify-center gap-1.5 bg-purple-600 rounded-xl py-2.5"
                            activeOpacity={0.8}
                        >
                            {isOpeningChat ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <MessageCircle size={15} color="#FFFFFF" />
                                    <Text className="text-white font-semibold text-sm">
                                        Nhắn ứng viên
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setCollabTarget(item)}
                            className="flex-1 flex-row items-center justify-center gap-1.5 border border-purple-500 rounded-xl py-2.5"
                            activeOpacity={0.8}
                        >
                            <Handshake size={15} color="#7C3BED" />
                            <Text className="text-purple-600 font-semibold text-sm">
                                Gửi hợp tác
                            </Text>
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
                <Text className="text-xl font-extrabold text-gray-900 dark:text-white flex-1">
                    Đơn ứng tuyển {data?.total ? `(${data.total})` : ''}
                </Text>
                {reviewableCount > 0 && (
                    <TouchableOpacity
                        onPress={() => (selectionMode ? exitSelection() : setSelectionMode(true))}
                        className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20"
                        activeOpacity={0.7}
                    >
                        <Text className="text-purple-600 font-bold text-sm">
                            {selectionMode ? 'Xong' : 'Chọn nhiều'}
                        </Text>
                    </TouchableOpacity>
                )}
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

            {/* Thanh duyệt hàng loạt */}
            {selectionMode && selectedIds.length > 0 && (
                <View className="px-4 pt-3 pb-6 border-t border-gray-100 dark:border-gray-800 flex-row gap-3 bg-white dark:bg-gray-900">
                    <TouchableOpacity
                        onPress={() => doBulk('reject')}
                        disabled={isBulkReviewing}
                        className="flex-1 border-2 border-red-400 rounded-2xl py-3.5 items-center justify-center"
                        activeOpacity={0.8}
                    >
                        <Text className="text-red-500 font-bold">
                            Từ chối ({selectedIds.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => doBulk('accept')}
                        disabled={isBulkReviewing}
                        className="flex-1 bg-green-500 rounded-2xl py-3.5 items-center justify-center"
                        activeOpacity={0.8}
                    >
                        {isBulkReviewing ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white font-bold">
                                Chấp nhận ({selectedIds.length})
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Gửi đề nghị hợp tác 1-1 tới ứng viên đã được chấp nhận (reuse form ở profile) */}
            <CreateCollabRequestModal
                visible={Boolean(collabTarget)}
                onClose={() => setCollabTarget(null)}
                receiverId={collabTarget?.creator_id ?? ''}
                receiverName={collabTarget ? applicantName(collabTarget) : ''}
            />
        </SafeAreaView>
    );
}
