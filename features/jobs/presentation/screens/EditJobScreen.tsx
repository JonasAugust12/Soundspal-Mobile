import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Save, Trash2 } from 'lucide-react-native';
import {
    useGetJobById,
    useUpdateJob,
    useDeleteJob,
    usePublishJob,
    useReopenJob,
    useCloseJob,
} from '@/features/jobs/presentation/hooks/useJobApi';
import {
    formatPostStatus,
    formatPostVisibility,
    getJobPublishBlockReason,
} from '@/features/jobs/domain/utils/jobFormatters';
import { isApiNotFound } from '@/shared/utils/apiError';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { JobEditCard } from '@/features/jobs/presentation/components/JobEditCard';
import type { UpdateJobRequest } from '@/features/jobs/domain/entities/job.type';
import { buildUpdatePayloadFromJob } from '@/features/jobs/data/repositories/jobRepositoryHelpers';

const JOB_TYPES = [
    { label: 'Venue', value: 'venue' },
    { label: 'Nhà sản xuất', value: 'producer' },
    { label: 'Ca sĩ', value: 'singer' },
];

const RECRUITMENT_TYPES = [
    { label: 'Toàn thời gian', value: 'full_time' },
    { label: 'Bán thời gian', value: 'part_time' },
    { label: 'Hợp đồng', value: 'contract' },
    { label: 'Một lần', value: 'one_time' },
];

const LOCATION_TYPES = [
    { label: 'Từ xa', value: 'remote' },
    { label: 'Tại địa điểm', value: 'onsite' },
    { label: 'Kết hợp', value: 'hybrid' },
];

const PAYMENT_TYPES = [
    { label: 'Theo buổi', value: 'bySession' },
    { label: 'Theo giờ', value: 'byHour' },
    { label: 'Theo dự án', value: 'byProject' },
    { label: 'Theo tháng', value: 'byMonth' },
];

const EXPERIENCE_LEVELS = [
    { label: 'Mới bắt đầu', value: 'beginner' },
    { label: 'Trung cấp', value: 'intermediate' },
    { label: 'Chuyên gia', value: 'expert' },
    { label: 'Không yêu cầu', value: 'any' },
];

const getOptionLabel = (options: Array<{ label: string; value: string }>, value?: string) =>
    options.find((option) => option.value === value)?.label ?? value ?? 'Chưa điền';

export default function EditJobScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { showSuccess, showError } = useToast();
    const params = useLocalSearchParams<{ id: string }>();

    const jobId = useMemo(() => (Array.isArray(params.id) ? params.id[0] : params.id), [params.id]);

    const {
        data: job,
        isLoading,
        error,
    } = useGetJobById(jobId ?? '', {
        enabled: !!jobId,
    });

    const { mutate: updateJob, isPending: isUpdating } = useUpdateJob();
    const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob();
    const { mutate: publishJob, isPending: isPublishing } = usePublishJob();
    const { mutate: reopenJob, isPending: isReopening } = useReopenJob();
    const { mutate: closeJob, isPending: isClosing } = useCloseJob();

    const [formData, setFormData] = useState<Partial<UpdateJobRequest>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize form data when job loads (only when job id changes)
    React.useEffect(() => {
        if (!job) {
            return;
        }
        setFormData({
            post_type: job.post_type as UpdateJobRequest['post_type'],
            title: job.title,
            brief_description: job.brief_description,
            description: job.description,
            type: job.type as UpdateJobRequest['type'],
            recruitment_type: job.recruitment_type as UpdateJobRequest['recruitment_type'],
            location_type: job.location_type as UpdateJobRequest['location_type'],
            location: job.location,
            budget_min: job.budget_min,
            budget_max: job.budget_max,
            budget_currency: (job.budget_currency || 'VND') as UpdateJobRequest['budget_currency'],
            payment_type: (job.payment_type || 'bySession') as UpdateJobRequest['payment_type'],
            is_negotiable: job.is_negotiable,
            deadline: job.deadline || undefined,
            work_time: job.work_time,
            experience_level: (job.experience_level ||
                'intermediate') as UpdateJobRequest['experience_level'],
            genres: job.genres ?? [],
            required_skills: job.required_skills ?? [],
            benefits: job.benefits ?? [],
            visibility: job.visibility as UpdateJobRequest['visibility'],
        });
        setHasChanges(false);
    }, [job?.id]);

    const isOwned = useMemo(
        () => !!(job && user && String(job.creator_id).trim() === String(user.id).trim()),
        [job, user],
    );

    //eslint-disable-next-line
    const handleFieldChange = (field: keyof UpdateJobRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const buildPayload = useCallback((): UpdateJobRequest | null => {
        if (!job) {
            return null;
        }
        return buildUpdatePayloadFromJob(job, formData);
    }, [job, formData]);

    const handleSave = () => {
        const payload = buildPayload();
        if (!payload || !jobId) {
            return;
        }

        if (!payload.title?.trim()) {
            showError('Lỗi', 'Tiêu đề công việc không được để trống');
            return;
        }

        if (!payload.brief_description?.trim()) {
            showError('Lỗi', 'Mô tả ngắn không được để trống');
            return;
        }

        if (!payload.description?.trim()) {
            showError('Lỗi', 'Mô tả chi tiết không được để trống');
            return;
        }

        updateJob(
            { id: jobId, body: payload },
            {
                onSuccess: () => {
                    setHasChanges(false);
                    showSuccess('Thành công', 'Bài đăng đã được cập nhật');
                    router.back();
                },
                //eslint-disable-next-line
                onError: (error: any) => {
                    const details = error?.response?.data?.details;
                    const detailMessage =
                        details && typeof details === 'object'
                            ? Object.values(details).join('\n')
                            : undefined;
                    const errorMessage =
                        detailMessage ||
                        error?.response?.data?.message ||
                        error?.message ||
                        'Không thể cập nhật bài đăng';
                    showError('Lỗi', errorMessage);
                },
            },
        );
    };

    const handlePublish = () => {
        if (!jobId || !job) return;
        const payload = buildPayload();
        if (!payload) return;

        const blockReason = getJobPublishBlockReason(payload);
        if (blockReason) {
            showError('Lỗi', blockReason);
            return;
        }

        const publish = () =>
            publishJob(jobId, {
                onSuccess: () => showSuccess('Thành công', 'Bài đăng đã được xuất bản'),
                //eslint-disable-next-line
                onError: (error: any) => {
                    const errorMessage =
                        error?.response?.data?.message ||
                        error?.message ||
                        'Không thể xuất bản bài đăng';
                    showError('Lỗi', errorMessage);
                },
            });

        if (hasChanges) {
            updateJob(
                { id: jobId, body: payload },
                {
                    onSuccess: () => {
                        setHasChanges(false);
                        publish();
                    },
                    //eslint-disable-next-line
                    onError: (error: any) => {
                        const errorMessage =
                            error?.response?.data?.message ||
                            error?.message ||
                            'Không thể lưu thay đổi trước khi xuất bản';
                        showError('Lỗi', errorMessage);
                    },
                },
            );
            return;
        }

        publish();
    };

    const handleReopen = () => {
        if (!jobId || !job) return;
        const payload = buildPayload();
        if (!payload) return;

        const blockReason = getJobPublishBlockReason(payload);
        if (blockReason) {
            showError(
                'Chưa thể mở lại tuyển dụng',
                `${blockReason}. Vui lòng hoàn thiện thông tin bài đăng.`,
            );
            return;
        }

        const reopen = () =>
            reopenJob(jobId, {
                onSuccess: () => showSuccess('Thành công', 'Bài đăng đã được mở lại tuyển dụng'),
                //eslint-disable-next-line
                onError: (error: any) => {
                    const errorMessage =
                        error?.response?.data?.message ||
                        error?.message ||
                        'Không thể mở lại bài đăng';
                    showError('Lỗi', errorMessage);
                },
            });

        if (hasChanges) {
            updateJob(
                { id: jobId, body: payload },
                {
                    onSuccess: () => {
                        setHasChanges(false);
                        reopen();
                    },
                    //eslint-disable-next-line
                    onError: (error: any) => {
                        const errorMessage =
                            error?.response?.data?.message ||
                            error?.message ||
                            'Không thể lưu thay đổi trước khi mở lại';
                        showError('Lỗi', errorMessage);
                    },
                },
            );
            return;
        }

        reopen();
    };

    const handleCloseJob = () => {
        if (!jobId) return;
        Alert.alert('Đóng bài đăng', 'Bạn có chắc muốn đóng bài đăng này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đóng',
                style: 'destructive',
                onPress: () =>
                    closeJob(jobId, {
                        onSuccess: () => showSuccess('Thành công', 'Bài đăng đã được đóng'),
                        //eslint-disable-next-line
                        onError: (error: any) => {
                            const errorMessage =
                                error?.response?.data?.message ||
                                error?.message ||
                                'Không thể đóng bài đăng';
                            showError('Lỗi', errorMessage);
                        },
                    }),
            },
        ]);
    };

    const handleDelete = () => {
        Alert.alert(
            'Xóa bài đăng',
            'Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.',
            [
                { text: 'Hủy', onPress: () => {} },
                {
                    text: 'Xóa',
                    onPress: () => {
                        deleteJob(jobId!, {
                            onSuccess: () => {
                                showSuccess('Thành công', 'Bài đăng đã được xóa');
                                router.back();
                            },
                            //eslint-disable-next-line
                            onError: (error: any) => {
                                const errorMessage =
                                    error?.response?.data?.message ||
                                    error?.message ||
                                    'Không thể xóa bài đăng';
                                showError('Lỗi', errorMessage);
                            },
                        });
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView
                className="flex-1 bg-white dark:bg-gray-900"
                edges={['top', 'left', 'right']}
            >
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7C3BED" />
                    <Text className="text-gray-600 dark:text-gray-400 mt-4">Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isNotFound = isApiNotFound(error);

    // Error or not owned
    if (error || !job || !isOwned) {
        return (
            <SafeAreaView
                className="flex-1 bg-white dark:bg-gray-900"
                edges={['top', 'left', 'right']}
            >
                <View className="px-4 py-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center gap-2"
                        activeOpacity={0.7}
                    >
                        <ChevronLeft size={24} color="#7C3BED" />
                        <Text className="text-base font-semibold text-purple-600">Quay lại</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-lg font-bold text-red-600 dark:text-red-400 text-center">
                        {!isOwned && job
                            ? 'Bạn không có quyền chỉnh sửa bài đăng này'
                            : isNotFound
                              ? 'Bài đăng không còn tồn tại hoặc đã bị xóa'
                              : 'Không thể tải thông tin công việc'}
                    </Text>
                    {isNotFound && (
                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 px-6">
                            Danh sách &quot;Job của tôi&quot; sẽ được làm mới. Nếu bài vẫn hiện, kéo
                            xuống để tải lại.
                        </Text>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#7C3BED" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1 ml-3">
                    Chỉnh sửa bài đăng
                </Text>
            </View>

            <View className="mx-4 mt-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-row justify-between items-center">
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                    Trạng thái:{' '}
                    <Text className="font-bold text-gray-900 dark:text-white">
                        {formatPostStatus(job.status)}
                    </Text>
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                    {formatPostVisibility(job.visibility)}
                </Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingVertical: 20,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Basic Info Section */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Thông tin cơ bản
                    </Text>

                    <JobEditCard
                        title="Tiêu đề"
                        value={formData.title}
                        onSave={(value) => handleFieldChange('title', value)}
                        type="text"
                        placeholder="Tiêu đề công việc"
                    />

                    <JobEditCard
                        title="Mô tả ngắn"
                        value={formData.brief_description}
                        onSave={(value) => handleFieldChange('brief_description', value)}
                        type="multiline"
                        placeholder="Tóm tắt vị trí tuyển dụng"
                    />

                    <JobEditCard
                        title="Mô tả chi tiết"
                        value={formData.description}
                        onSave={(value) => handleFieldChange('description', value)}
                        type="multiline"
                        placeholder="Mô tả đầy đủ về công việc"
                    />
                </View>

                {/* Job Details Section */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Chi tiết công việc
                    </Text>

                    <JobEditCard
                        title="Loại nghệ sĩ"
                        value={formData.type}
                        onSave={(value) => handleFieldChange('type', value)}
                        formatDisplay={(value) => getOptionLabel(JOB_TYPES, String(value ?? ''))}
                    >
                        <View className="gap-2">
                            {JOB_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    onPress={() => {
                                        handleFieldChange('type', type.value);
                                    }}
                                    className={`p-3 rounded-lg border-2 ${
                                        formData.type === type.value
                                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                    }`}
                                >
                                    <Text
                                        className={`font-semibold ${
                                            formData.type === type.value
                                                ? 'text-purple-700 dark:text-purple-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </JobEditCard>

                    <JobEditCard
                        title="Hình thức tuyển dụng"
                        value={formData.recruitment_type}
                        onSave={(value) => handleFieldChange('recruitment_type', value)}
                        formatDisplay={(value) =>
                            getOptionLabel(RECRUITMENT_TYPES, String(value ?? ''))
                        }
                    >
                        <View className="flex-row flex-wrap gap-2">
                            {RECRUITMENT_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    onPress={() => {
                                        handleFieldChange('recruitment_type', type.value);
                                    }}
                                    className={`flex-1 min-w-[45%] p-3 rounded-lg border-2 items-center ${
                                        formData.recruitment_type === type.value
                                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${
                                            formData.recruitment_type === type.value
                                                ? 'text-purple-700 dark:text-purple-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </JobEditCard>

                    <JobEditCard
                        title="Loại địa điểm"
                        value={formData.location_type}
                        onSave={(value) => handleFieldChange('location_type', value)}
                        formatDisplay={(value) =>
                            getOptionLabel(LOCATION_TYPES, String(value ?? ''))
                        }
                    >
                        <View className="flex-row gap-2">
                            {LOCATION_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    onPress={() => {
                                        handleFieldChange('location_type', type.value);
                                    }}
                                    className={`flex-1 p-3 rounded-lg border-2 items-center ${
                                        formData.location_type === type.value
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${
                                            formData.location_type === type.value
                                                ? 'text-blue-700 dark:text-blue-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </JobEditCard>

                    {formData.location_type !== 'remote' && (
                        <JobEditCard
                            title="Địa điểm"
                            value={formData.location}
                            onSave={(value) => handleFieldChange('location', value)}
                            type="text"
                            placeholder="Quận 3, TP. Hồ Chí Minh"
                        />
                    )}

                    <JobEditCard
                        title="Hình thức thanh toán"
                        value={formData.payment_type || undefined}
                        onSave={(value) => handleFieldChange('payment_type', value)}
                        formatDisplay={(value) =>
                            getOptionLabel(PAYMENT_TYPES, String(value ?? ''))
                        }
                    >
                        <View className="flex-row flex-wrap gap-2">
                            {PAYMENT_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    onPress={() => {
                                        handleFieldChange('payment_type', type.value);
                                    }}
                                    className={`flex-1 min-w-[45%] p-3 rounded-lg border-2 items-center ${
                                        formData.payment_type === type.value
                                            ? 'border-green-600 bg-green-50 dark:bg-green-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${
                                            formData.payment_type === type.value
                                                ? 'text-green-700 dark:text-green-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </JobEditCard>

                    <JobEditCard
                        title="Thời gian làm việc"
                        value={formData.work_time}
                        onSave={(value) => handleFieldChange('work_time', value)}
                        type="text"
                        placeholder="Tối T6, T7, CN (19:30 - 21:30)"
                    />

                    <JobEditCard
                        title="Hạn nộp (dd-MM-yyyy)"
                        value={formData.deadline || undefined}
                        onSave={(value) => handleFieldChange('deadline', value)}
                        type="text"
                        placeholder="01-12-2026"
                    />

                    {/* Budget Section */}
                    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-3">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                Ngân sách
                            </Text>
                        </View>

                        <View className="gap-3">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                                    {formData.is_negotiable ? 'Thỏa thuận' : 'Cố định'}
                                </Text>
                                <Switch
                                    value={formData.is_negotiable || false}
                                    onValueChange={(value) =>
                                        handleFieldChange('is_negotiable', value)
                                    }
                                />
                            </View>

                            {!formData.is_negotiable && (
                                <View className="flex-row gap-2">
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Min
                                        </Text>
                                        <TextInput
                                            value={String(formData.budget_min || '')}
                                            onChangeText={(val) =>
                                                handleFieldChange(
                                                    'budget_min',
                                                    val ? parseInt(val) : undefined,
                                                )
                                            }
                                            placeholder="0"
                                            keyboardType="numeric"
                                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Max
                                        </Text>
                                        <TextInput
                                            value={String(formData.budget_max || '')}
                                            onChangeText={(val) =>
                                                handleFieldChange(
                                                    'budget_max',
                                                    val ? parseInt(val) : undefined,
                                                )
                                            }
                                            placeholder="0"
                                            keyboardType="numeric"
                                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Requirements Section */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Yêu cầu & Lợi ích
                    </Text>

                    <JobEditCard
                        title="Thể loại nhạc"
                        value={formData.genres}
                        onSave={(value) => handleFieldChange('genres', value)}
                        type="tags"
                        placeholder="Pop, Rock, Jazz (cách nhau bằng dấu phẩy)"
                    />

                    <JobEditCard
                        title="Kỹ năng yêu cầu"
                        value={formData.required_skills}
                        onSave={(value) => handleFieldChange('required_skills', value)}
                        type="tags"
                        placeholder="Vocal, Guitar, Xử lý âm thanh (cách nhau bằng dấu phẩy)"
                    />

                    <JobEditCard
                        title="Quyền lợi & Phúc lợi"
                        value={formData.benefits}
                        onSave={(value) => handleFieldChange('benefits', value)}
                        type="tags"
                        placeholder="Lương cạnh tranh, Bảo hiểm (cách nhau bằng dấu phẩy)"
                    />

                    <JobEditCard
                        title="Cấp độ kinh nghiệm"
                        value={formData.experience_level || undefined}
                        onSave={(value) => handleFieldChange('experience_level', value)}
                        formatDisplay={(value) =>
                            getOptionLabel(EXPERIENCE_LEVELS, String(value ?? ''))
                        }
                    >
                        <View className="flex-row flex-wrap gap-2">
                            {EXPERIENCE_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level.value}
                                    onPress={() => {
                                        handleFieldChange('experience_level', level.value);
                                    }}
                                    className={`flex-1 min-w-[45%] p-3 rounded-lg border-2 items-center ${
                                        formData.experience_level === level.value
                                            ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${
                                            formData.experience_level === level.value
                                                ? 'text-orange-700 dark:text-orange-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {level.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </JobEditCard>
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View
                className="px-4 pt-4 border-t border-gray-200 dark:border-gray-800 gap-2 bg-white dark:bg-gray-900"
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
                {job.status === 'draft' && (
                    <TouchableOpacity
                        onPress={handlePublish}
                        disabled={isPublishing}
                        className="flex-row items-center justify-center gap-2 py-3 rounded-lg bg-green-600"
                    >
                        {isPublishing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold">Xuất bản bài đăng</Text>
                        )}
                    </TouchableOpacity>
                )}

                {job.status === 'closed' && (
                    <TouchableOpacity
                        onPress={handleReopen}
                        disabled={isReopening}
                        className="flex-row items-center justify-center gap-2 py-3 rounded-lg bg-green-600"
                    >
                        {isReopening ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold">Mở lại tuyển dụng</Text>
                        )}
                    </TouchableOpacity>
                )}

                {job.status === 'published' && (
                    <TouchableOpacity
                        onPress={handleCloseJob}
                        disabled={isClosing}
                        className="flex-row items-center justify-center gap-2 py-3 rounded-lg border-2 border-red-500"
                    >
                        {isClosing ? (
                            <ActivityIndicator color="#EF4444" />
                        ) : (
                            <Text className="text-red-500 font-bold">Đóng bài đăng</Text>
                        )}
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isUpdating || !hasChanges}
                    className={`flex-row items-center justify-center gap-2 py-3 rounded-lg ${
                        hasChanges ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                >
                    {isUpdating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Save size={20} color="white" />
                            <Text className="text-white font-bold">
                                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={isDeleting}
                    className="flex-row items-center justify-center gap-2 py-3 rounded-lg border-2 border-red-500"
                >
                    {isDeleting ? (
                        <ActivityIndicator color="#EF4444" />
                    ) : (
                        <>
                            <Trash2 size={20} color="#EF4444" />
                            <Text className="text-red-500 font-bold">Xóa bài đăng</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
