import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { showAppDialog } from '@/shared/presentation/ui';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    KeyboardAwareScrollView,
    KeyboardController,
    AndroidSoftInputModes,
} from 'react-native-keyboard-controller';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCreateJob } from '@/features/jobs/presentation/hooks/useJobApi';
import {
    AddItemRow,
    ArtistTypePicker,
    BudgetSection,
    DeadlinePickerField,
    EXPERIENCE_LEVEL_OPTIONS,
    FormSectionCard,
    FormTextField,
    GenreTagSection,
    LOCATION_TYPE_OPTIONS,
    LocationInput,
    PAYMENT_TYPE_OPTIONS,
    PRIMARY_GRADIENT,
    RECRUITMENT_FORM_COLORS,
    RECRUITMENT_FORM_SPACING,
    RECRUITMENT_TYPE_OPTIONS,
    TagChipPicker,
    VISIBILITY_OPTIONS,
    WorkTimePickerField,
} from '@/features/jobs/presentation/components/recruitmentForm';
import type { CreateJobRequest, Job, PostStatus } from '@/features/jobs/domain/entities/job.type';

type FormStep = 'basic' | 'details' | 'requirements' | 'review';

export default function RecruitmentFormScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { mutate: createJob, isPending } = useCreateJob();

    // Ép adjustNothing khi ở màn này: edge-to-edge chỉ resize cửa sổ MỘT PHẦN khiến phép tính
    // "chiều cao − bàn phím" của KeyboardAwareScrollView bị sai → cuộn thiếu, ô nhập cuối (Mô tả
    // chi tiết) bị che. Không resize nữa thì KeyboardAwareScrollView tự cuộn đúng. Khôi phục khi rời.
    useEffect(() => {
        KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING);
        return () => KeyboardController.setDefaultMode();
    }, []);

    const [step, setStep] = useState<FormStep>('basic');
    const [skillInput, setSkillInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');
    const [genreInput, setGenreInput] = useState('');

    const [formData, setFormData] = useState<CreateJobRequest>({
        post_type: 'job_offer',
        title: '',
        brief_description: '',
        description: '',
        type: 'producer',
        recruitment_type: 'part_time',
        location_type: 'onsite',
        location: '',
        budget_min: undefined,
        budget_max: undefined,
        budget_currency: 'VND',
        payment_type: 'bySession',
        is_negotiable: false,
        deadline: undefined,
        work_time: '',
        experience_level: 'intermediate',
        genres: [],
        required_skills: [],
        benefits: [],
        status: 'draft',
        visibility: 'public',
    });

    const handleInputChange = (
        field: keyof CreateJobRequest,
        value: string | number | boolean | string[] | undefined,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addSkill = () => {
        if (skillInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                required_skills: [...(prev.required_skills || []), skillInput.trim()],
            }));
            setSkillInput('');
        }
    };

    const removeSkill = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            required_skills: prev.required_skills?.filter((_, i) => i !== index),
        }));
    };

    const addBenefit = () => {
        if (benefitInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                benefits: [...(prev.benefits || []), benefitInput.trim()],
            }));
            setBenefitInput('');
        }
    };

    const removeBenefit = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            benefits: prev.benefits?.filter((_, i) => i !== index),
        }));
    };

    const addGenre = () => {
        const trimmed = genreInput.trim();
        if (!trimmed) {
            return;
        }

        setFormData((prev) => {
            const existing = prev.genres || [];
            if (existing.includes(trimmed)) {
                return prev;
            }
            return {
                ...prev,
                genres: [...existing, trimmed],
            };
        });
        setGenreInput('');
    };

    const removeGenre = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            genres: prev.genres?.filter((_, i) => i !== index),
        }));
    };

    const isBasicValid =
        formData.title?.trim() &&
        formData.brief_description?.trim() &&
        formData.description?.trim();

    const submitJob = (status: PostStatus) => {
        if (!isBasicValid) {
            showAppDialog('Lỗi', 'Vui lòng điền đầy đủ thông tin cơ bản');
            return;
        }

        createJob(
            { ...formData, status },
            {
                onSuccess: (data: Job) => {
                    const successMessage =
                        status === 'draft'
                            ? 'Bài đăng đã được lưu nháp'
                            : (data as { message?: string })?.message ||
                              'Bài đăng đã được đăng thành công';
                    showAppDialog('Thành công', successMessage, [
                        { text: 'OK', onPress: () => router.back() },
                    ]);
                },
                onError: (error: unknown) => {
                    const err = error as {
                        response?: { data?: { message?: string } };
                        message?: string;
                    };
                    const errorMessage =
                        err?.response?.data?.message || err?.message || 'Không thể tạo bài đăng';
                    showAppDialog('Lỗi', errorMessage);
                },
            },
        );
    };

    const renderBasicStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Thông tin cơ bản</Text>

            <FormSectionCard>
                <FormTextField
                    label="Tiêu đề công việc"
                    required
                    placeholder="Ví dụ: Tuyển Nữ Vocal..."
                    value={formData.title}
                    onChangeText={(val) => handleInputChange('title', val)}
                />
                <FormTextField
                    label="Mô tả ngắn"
                    required
                    placeholder="Tóm tắt vị trí tuyển dụng..."
                    value={formData.brief_description}
                    onChangeText={(val) => handleInputChange('brief_description', val)}
                    multiline
                    numberOfLines={3}
                    style={styles.multilineInput}
                />
                <FormTextField
                    label="Mô tả chi tiết"
                    required
                    placeholder="Mô tả đầy đủ về công việc, yêu cầu..."
                    value={formData.description}
                    onChangeText={(val) => handleInputChange('description', val)}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    style={styles.multilineInputLarge}
                />
            </FormSectionCard>
        </View>
    );

    const renderDetailsStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Chi tiết công việc</Text>

            <FormSectionCard title="Tuyển cho loại nghệ sĩ">
                <ArtistTypePicker
                    value={formData.type}
                    onChange={(type) => handleInputChange('type', type)}
                />
            </FormSectionCard>

            <FormSectionCard title="Hình thức tuyển dụng">
                <TagChipPicker
                    options={RECRUITMENT_TYPE_OPTIONS}
                    value={formData.recruitment_type ?? 'part_time'}
                    onChange={(type) => handleInputChange('recruitment_type', type)}
                />
            </FormSectionCard>

            <FormSectionCard title="Loại địa điểm">
                <TagChipPicker
                    options={LOCATION_TYPE_OPTIONS}
                    value={formData.location_type ?? 'onsite'}
                    onChange={(type) => handleInputChange('location_type', type)}
                />
            </FormSectionCard>

            {formData.location_type !== 'remote' && (
                <FormSectionCard title="Địa điểm">
                    <LocationInput
                        value={formData.location ?? ''}
                        onChangeText={(val) => handleInputChange('location', val)}
                    />
                </FormSectionCard>
            )}

            <FormSectionCard>
                <BudgetSection
                    isFixed={!formData.is_negotiable}
                    onToggleFixed={(fixed) => handleInputChange('is_negotiable', !fixed)}
                    budgetMin={formData.budget_min ?? undefined}
                    budgetMax={formData.budget_max ?? undefined}
                    onBudgetMinChange={(val) => handleInputChange('budget_min', val)}
                    onBudgetMaxChange={(val) => handleInputChange('budget_max', val)}
                />
            </FormSectionCard>

            <FormSectionCard title="Hình thức thanh toán">
                <TagChipPicker
                    options={PAYMENT_TYPE_OPTIONS}
                    value={formData.payment_type ?? 'bySession'}
                    onChange={(type) => handleInputChange('payment_type', type)}
                />
            </FormSectionCard>

            <FormSectionCard title="Thời gian làm việc">
                <WorkTimePickerField
                    hideLabel
                    value={formData.work_time}
                    onChange={(val) => handleInputChange('work_time', val)}
                />
            </FormSectionCard>

            <FormSectionCard title="Hạn nộp (dd-MM-yyyy)">
                <DeadlinePickerField
                    hideLabel
                    value={formData.deadline || undefined}
                    onChange={(val) => handleInputChange('deadline', val)}
                />
            </FormSectionCard>
        </View>
    );

    const renderRequirementsStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Yêu cầu & Lợi ích</Text>

            <FormSectionCard title="Thể loại nhạc">
                <GenreTagSection
                    genres={formData.genres || []}
                    inputValue={genreInput}
                    onInputChange={setGenreInput}
                    onAddCustom={addGenre}
                    onTogglePopular={(genres) => handleInputChange('genres', genres)}
                    onRemove={removeGenre}
                />
            </FormSectionCard>

            <FormSectionCard title="Kỹ năng yêu cầu">
                <AddItemRow
                    placeholder="Thêm kỹ năng..."
                    value={skillInput}
                    onChangeText={setSkillInput}
                    onAdd={addSkill}
                />
                <View style={styles.listGap}>
                    {formData.required_skills?.map((skill, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <Text style={styles.listItemText}>{skill}</Text>
                            <TouchableOpacity onPress={() => removeSkill(idx)}>
                                <X size={18} color={RECRUITMENT_FORM_COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </FormSectionCard>

            <FormSectionCard title="Quyền lợi & Phúc lợi">
                <AddItemRow
                    placeholder="Thêm phúc lợi..."
                    value={benefitInput}
                    onChangeText={setBenefitInput}
                    onAdd={addBenefit}
                />
                <View style={styles.listGap}>
                    {formData.benefits?.map((benefit, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <Text style={styles.listItemText}>{benefit}</Text>
                            <TouchableOpacity onPress={() => removeBenefit(idx)}>
                                <X size={18} color={RECRUITMENT_FORM_COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </FormSectionCard>

            <FormSectionCard title="Cấp độ kinh nghiệm">
                <TagChipPicker
                    options={EXPERIENCE_LEVEL_OPTIONS}
                    value={formData.experience_level ?? 'intermediate'}
                    onChange={(level) => handleInputChange('experience_level', level)}
                />
            </FormSectionCard>
        </View>
    );

    const renderReviewStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Xem lại & Xác nhận</Text>

            <FormSectionCard>
                <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Tiêu đề</Text>
                    <Text style={styles.reviewValue}>{formData.title}</Text>
                </View>
                <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Mô tả ngắn</Text>
                    <Text style={styles.reviewValue}>{formData.brief_description}</Text>
                </View>
                <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Tuyển cho loại nghệ sĩ</Text>
                    <Text style={styles.reviewValue}>{formData.type}</Text>
                </View>
                <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Hình thức tuyển dụng</Text>
                    <Text style={styles.reviewValue}>{formData.recruitment_type}</Text>
                </View>
                {formData.location ? (
                    <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Địa điểm</Text>
                        <Text style={styles.reviewValue}>{formData.location}</Text>
                    </View>
                ) : null}
                {(formData.budget_min || formData.budget_max) && (
                    <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Ngân sách</Text>
                        <Text style={styles.reviewValue}>
                            {formData.budget_min && formData.budget_max
                                ? `${formData.budget_min / 1_000_000} - ${formData.budget_max / 1_000_000} triệu VND`
                                : formData.budget_min
                                  ? `Từ ${(formData.budget_min ?? 0) / 1_000_000} triệu VND`
                                  : `Đến ${(formData.budget_max ?? 0) / 1_000_000} triệu VND`}
                        </Text>
                    </View>
                )}
                {formData.deadline ? (
                    <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Hạn nộp</Text>
                        <Text style={styles.reviewValue}>{formData.deadline}</Text>
                    </View>
                ) : null}
                {formData.genres && formData.genres.length > 0 ? (
                    <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Thể loại nhạc</Text>
                        <Text style={styles.reviewValue}>{formData.genres.join(', ')}</Text>
                    </View>
                ) : null}
                {formData.required_skills && formData.required_skills.length > 0 ? (
                    <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Kỹ năng yêu cầu</Text>
                        <Text style={styles.reviewValue}>
                            {formData.required_skills.join(', ')}
                        </Text>
                    </View>
                ) : null}
                {formData.benefits && formData.benefits.length > 0 ? (
                    <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Quyền lợi</Text>
                        <Text style={styles.reviewValue}>{formData.benefits.join(', ')}</Text>
                    </View>
                ) : null}
            </FormSectionCard>

            <FormSectionCard title="Quyền riêng tư">
                <TagChipPicker
                    options={VISIBILITY_OPTIONS}
                    value={formData.visibility ?? 'public'}
                    onChange={(val) => handleInputChange('visibility', val)}
                />
            </FormSectionCard>

            <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                    Bạn có thể lưu nháp để chỉnh sửa sau, hoặc đăng ngay để mọi người thấy bài tuyển
                    dụng.
                </Text>
            </View>
        </View>
    );

    const steps: FormStep[] = ['basic', 'details', 'requirements', 'review'];
    const currentStepIndex = steps.indexOf(step);
    const isReviewStep = step === 'review';
    const hasThreeFooterActions = isReviewStep && currentStepIndex > 0;

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
                    <ChevronLeft size={24} color={RECRUITMENT_FORM_COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo bài đăng công việc</Text>
                <Text style={styles.headerStep}>
                    {currentStepIndex + 1}/{steps.length}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
                <LinearGradient
                    colors={[...PRIMARY_GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        height: '100%',
                        width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                    }}
                />
            </View>

            {/* Content */}
            <KeyboardAwareScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                // Chừa thêm chiều cao thanh điều hướng (edge-to-edge chỉ resize một phần) để ô nhập
                // được cuộn lên đủ cao, không bị bàn phím che.
                bottomOffset={insets.bottom + 32}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {step === 'basic' && renderBasicStep()}
                {step === 'details' && renderDetailsStep()}
                {step === 'requirements' && renderRequirementsStep()}
                {step === 'review' && renderReviewStep()}
            </KeyboardAwareScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                {currentStepIndex > 0 && (
                    <TouchableOpacity
                        onPress={() => setStep(steps[currentStepIndex - 1])}
                        style={[
                            styles.footerSecondaryButton,
                            hasThreeFooterActions && styles.footerButtonCompact,
                            hasThreeFooterActions && styles.footerBackButton,
                        ]}
                    >
                        <Text
                            style={[
                                styles.footerSecondaryText,
                                hasThreeFooterActions && styles.footerTextCompact,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            Quay lại
                        </Text>
                    </TouchableOpacity>
                )}

                {currentStepIndex < steps.length - 1 ? (
                    <TouchableOpacity
                        onPress={() => setStep(steps[currentStepIndex + 1])}
                        disabled={!isBasicValid && step === 'basic'}
                        activeOpacity={0.85}
                        style={[
                            styles.footerPrimaryButton,
                            currentStepIndex === 0 ? styles.footerPrimaryButtonFull : null,
                            !isBasicValid && step === 'basic'
                                ? styles.footerPrimaryButtonDisabled
                                : null,
                        ]}
                    >
                        <LinearGradient
                            colors={
                                !isBasicValid && step === 'basic'
                                    ? ['#D1D5DB', '#9CA3AF']
                                    : [...PRIMARY_GRADIENT]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.footerPrimaryGradient}
                        >
                            <Text style={styles.footerPrimaryText}>Tiếp tục</Text>
                            <ChevronRight size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => submitJob('draft')}
                            disabled={isPending}
                            style={[
                                styles.footerSecondaryButton,
                                styles.footerButtonCompact,
                                styles.footerDraftButton,
                            ]}
                        >
                            {isPending ? (
                                <ActivityIndicator color={RECRUITMENT_FORM_COLORS.primary} />
                            ) : (
                                <Text
                                    style={[styles.footerSecondaryText, styles.footerTextCompact]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.75}
                                >
                                    Lưu nháp
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => submitJob('published')}
                            disabled={isPending}
                            activeOpacity={0.85}
                            style={[
                                styles.footerPrimaryButton,
                                styles.footerButtonCompact,
                                styles.footerPublishButton,
                            ]}
                        >
                            <LinearGradient
                                colors={[...PRIMARY_GRADIENT]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.footerPrimaryGradient}
                            >
                                {isPending ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text
                                        style={[styles.footerPrimaryText, styles.footerTextCompact]}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        minimumFontScale={0.75}
                                    >
                                        Đăng bài
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: RECRUITMENT_FORM_COLORS.surfaceMuted,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: RECRUITMENT_FORM_SPACING.screen,
        paddingVertical: 16,
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: RECRUITMENT_FORM_COLORS.border,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    headerStep: {
        fontSize: 13,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.primary,
    },
    progressTrack: {
        height: 3,
        backgroundColor: RECRUITMENT_FORM_COLORS.border,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: RECRUITMENT_FORM_SPACING.screen,
        paddingTop: 24,
        paddingBottom: 16,
        flexGrow: 0,
    },
    stepContainer: {
        gap: 16,
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: RECRUITMENT_FORM_COLORS.text,
        marginBottom: 4,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    multilineInputLarge: {
        minHeight: 140,
        textAlignVertical: 'top',
    },
    addRow: {
        flexDirection: 'row',
        gap: 8,
    },
    addInput: {
        flex: 1,
        backgroundColor: RECRUITMENT_FORM_COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: RECRUITMENT_FORM_COLORS.text,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: RECRUITMENT_FORM_COLORS.primaryMuted,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.primaryDark,
    },
    listGap: {
        gap: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: RECRUITMENT_FORM_COLORS.surfaceMuted,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
    },
    listItemText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: RECRUITMENT_FORM_COLORS.text,
        marginRight: 8,
    },
    reviewRow: {
        gap: 4,
    },
    reviewLabel: {
        fontSize: 12,
        color: RECRUITMENT_FORM_COLORS.textSubtle,
    },
    reviewValue: {
        fontSize: 14,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    infoBanner: {
        backgroundColor: RECRUITMENT_FORM_COLORS.primaryMuted,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.primaryLight,
        borderRadius: 12,
        padding: 14,
    },
    infoBannerText: {
        fontSize: 12,
        lineHeight: 18,
        color: RECRUITMENT_FORM_COLORS.primaryDark,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 8,
        paddingHorizontal: RECRUITMENT_FORM_SPACING.screen,
        paddingTop: 12,
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: RECRUITMENT_FORM_COLORS.border,
    },
    footerSecondaryButton: {
        flex: 1,
        minWidth: 0,
        minHeight: 52,
        borderWidth: 2,
        borderColor: RECRUITMENT_FORM_COLORS.primary,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
    },
    footerButtonCompact: {
        paddingHorizontal: 8,
    },
    footerBackButton: {
        flex: 0.9,
    },
    footerDraftButton: {
        flex: 1,
    },
    footerPublishButton: {
        flex: 1.15,
    },
    footerSecondaryText: {
        color: RECRUITMENT_FORM_COLORS.primary,
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
    footerTextCompact: {
        fontSize: 13,
    },
    footerPrimaryButton: {
        flex: 1,
        minWidth: 0,
        borderRadius: 14,
        overflow: 'hidden',
    },
    footerPrimaryButtonFull: {
        flex: 1,
    },
    footerPrimaryButtonDisabled: {
        opacity: 0.7,
    },
    footerPrimaryGradient: {
        minHeight: 52,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 16,
        width: '100%',
    },
    footerPrimaryText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
});
