import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCreateJob } from '@/hooks/useJobApi';
import type { CreateJobRequest } from '@/types/job.type';
import { formatDate } from '@/utils/jobFormatters';

type FormStep = 'basic' | 'details' | 'requirements' | 'review';

const JOB_TYPES = ['venue', 'producer', 'singer'];
const RECRUITMENT_TYPES = ['full_time', 'part_time', 'contract', 'one_time'];
const LOCATION_TYPES = ['remote', 'onsite', 'hybrid'];
const CURRENCIES = ['VND', 'USD', 'EUR'];
const PAYMENT_TYPES = ['bySession', 'byHour', 'byProject', 'byMonth'];
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'expert', 'any'];

export default function RecruitmentFormScreen() {
    const router = useRouter();
    const { mutate: createJob, isPending } = useCreateJob();

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
        status: 'published',
        visibility: 'public',
    });

    const handleInputChange = (field: keyof CreateJobRequest, value: any) => {
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
        if (genreInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                genres: [...(prev.genres || []), genreInput.trim()],
            }));
            setGenreInput('');
        }
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

    const isDetailsValid = true; // All optional

    const isRequirementsValid = true; // All optional

    const handleSubmit = () => {
        if (!isBasicValid) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin cơ bản');
            return;
        }

        createJob(formData, {
            onSuccess: (data: any) => {
                const successMessage = data?.message || 'Bài đăng đã được tạo thành công';
                Alert.alert('Thành công', successMessage, [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            },
            onError: (error: any) => {
                const errorMessage =
                    error?.response?.data?.message || error?.message || 'Không thể tạo bài đăng';
                Alert.alert('Lỗi', errorMessage);
            },
        });
    };

    const renderBasicStep = () => (
        <View className="gap-4">
            <Text className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                Thông tin cơ bản
            </Text>

            {/* Title */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tiêu đề công việc *
                </Text>
                <TextInput
                    placeholder="Ví dụ: Tuyển Nữ Vocal..."
                    value={formData.title}
                    onChangeText={(val) => handleInputChange('title', val)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Brief Description */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mô tả ngắn *
                </Text>
                <TextInput
                    placeholder="Tóm tắt vị trí tuyển dụng..."
                    value={formData.brief_description}
                    onChangeText={(val) => handleInputChange('brief_description', val)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                    placeholderTextColor="#999"
                    numberOfLines={3}
                    multiline
                />
            </View>

            {/* Description */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mô tả chi tiết *
                </Text>
                <TextInput
                    placeholder="Mô tả đầy đủ về công việc, yêu cầu..."
                    value={formData.description}
                    onChangeText={(val) => handleInputChange('description', val)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white min-h-24"
                    placeholderTextColor="#999"
                    numberOfLines={6}
                    multiline
                    textAlignVertical="top"
                />
            </View>
        </View>
    );

    const renderDetailsStep = () => (
        <View className="gap-4">
            <Text className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                Chi tiết công việc
            </Text>

            {/* Job Type */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tuyển cho loại nghệ sĩ
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    {JOB_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => handleInputChange('type', type)}
                            className={`px-4 py-2 rounded-lg ${
                                formData.type === type
                                    ? 'bg-purple-600'
                                    : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                        >
                            <Text
                                className={`text-sm font-semibold ${
                                    formData.type === type
                                        ? 'text-white'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {type === 'venue'
                                    ? 'Venue'
                                    : type === 'producer'
                                      ? 'Nhà sản xuất'
                                      : type === 'singer'
                                        ? 'Ca sĩ'
                                        : 'Ban nhạc'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Recruitment Type */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Hình thức tuyển dụng
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    {RECRUITMENT_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => handleInputChange('recruitment_type', type)}
                            className={`flex-1 min-w-[45%] px-3 py-2 rounded-lg border-2 ${
                                formData.recruitment_type === type
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                            }`}
                        >
                            <Text
                                className={`text-xs font-semibold text-center ${
                                    formData.recruitment_type === type
                                        ? 'text-purple-700 dark:text-purple-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {type === 'full_time'
                                    ? 'Toàn thời gian'
                                    : type === 'part_time'
                                      ? 'Bán thời gian'
                                      : type === 'contract'
                                        ? 'Hợp đồng'
                                        : 'Một lần'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Location Type */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Loại địa điểm
                </Text>
                <View className="flex-row gap-2">
                    {LOCATION_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => handleInputChange('location_type', type)}
                            className={`flex-1 px-3 py-2 rounded-lg border-2 ${
                                formData.location_type === type
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                            }`}
                        >
                            <Text
                                className={`text-xs font-semibold text-center ${
                                    formData.location_type === type
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {type === 'remote'
                                    ? 'Từ xa'
                                    : type === 'onsite'
                                      ? 'Tại địa điểm'
                                      : 'Kết hợp'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Location */}
            {formData.location_type !== 'remote' && (
                <View className="gap-2">
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Địa điểm
                    </Text>
                    <TextInput
                        placeholder="Ví dụ: Quận 3, TP. Hồ Chí Minh"
                        value={formData.location}
                        onChangeText={(val) => handleInputChange('location', val)}
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                        placeholderTextColor="#999"
                    />
                </View>
            )}

            {/* Budget */}
            <View className="gap-3">
                <View className="flex-row gap-2 items-center">
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">
                        Ngân sách (VND)
                    </Text>
                    <TouchableOpacity
                        onPress={() => handleInputChange('is_negotiable', !formData.is_negotiable)}
                        className={`px-3 py-1 rounded-lg ${
                            formData.is_negotiable
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                    >
                        <Text
                            className={`text-xs font-semibold ${
                                formData.is_negotiable
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {formData.is_negotiable ? 'Thỏa thuận' : 'Cố định'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {!formData.is_negotiable && (
                    <View className="flex-row gap-2">
                        <TextInput
                            placeholder="Min"
                            value={formData.budget_min?.toString() || ''}
                            onChangeText={(val) =>
                                handleInputChange('budget_min', val ? parseInt(val) : undefined)
                            }
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                        <TextInput
                            placeholder="Max"
                            value={formData.budget_max?.toString() || ''}
                            onChangeText={(val) =>
                                handleInputChange('budget_max', val ? parseInt(val) : undefined)
                            }
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                )}
            </View>

            {/* Payment Type */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Hình thức thanh toán
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    {PAYMENT_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => handleInputChange('payment_type', type)}
                            className={`flex-1 min-w-[45%] px-3 py-2 rounded-lg border-2 ${
                                formData.payment_type === type
                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                            }`}
                        >
                            <Text
                                className={`text-xs font-semibold text-center ${
                                    formData.payment_type === type
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {type === 'bySession'
                                    ? 'Theo buổi'
                                    : type === 'byHour'
                                      ? 'Theo giờ'
                                      : type === 'byProject'
                                        ? 'Theo dự án'
                                        : 'Theo tháng'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Work Time */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Thời gian làm việc
                </Text>
                <TextInput
                    placeholder="Ví dụ: Tối T6, T7, CN (19:30 - 21:30)"
                    value={formData.work_time}
                    onChangeText={(val) => handleInputChange('work_time', val)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Deadline */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Hạn nộp (dd-MM-yyyy)
                </Text>
                <TextInput
                    placeholder="Ví dụ: 01-12-2026"
                    value={formData.deadline || ''}
                    onChangeText={(val) => handleInputChange('deadline', val || undefined)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                    placeholderTextColor="#999"
                />
            </View>
        </View>
    );

    const renderRequirementsStep = () => (
        <View className="gap-4">
            <Text className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                Yêu cầu & Lợi ích
            </Text>

            {/* Genres */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Thể loại nhạc
                </Text>
                <View className="flex-row gap-2">
                    <TextInput
                        placeholder="Thêm thể loại..."
                        value={genreInput}
                        onChangeText={setGenreInput}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                        onPress={addGenre}
                        className="bg-purple-600 px-4 py-3 rounded-lg items-center justify-center"
                    >
                        <Text className="text-white font-bold text-sm">Thêm</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap gap-2">
                    {formData.genres?.map((genre, idx) => (
                        <View
                            key={idx}
                            className="bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full flex-row items-center gap-2"
                        >
                            <Text className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                {genre}
                            </Text>
                            <TouchableOpacity onPress={() => removeGenre(idx)}>
                                <X size={14} color="#7C3BED" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Required Skills */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Kỹ năng yêu cầu
                </Text>
                <View className="flex-row gap-2">
                    <TextInput
                        placeholder="Thêm kỹ năng..."
                        value={skillInput}
                        onChangeText={setSkillInput}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                        onPress={addSkill}
                        className="bg-green-600 px-4 py-3 rounded-lg items-center justify-center"
                    >
                        <Text className="text-white font-bold text-sm">Thêm</Text>
                    </TouchableOpacity>
                </View>
                <View className="gap-2">
                    {formData.required_skills?.map((skill, idx) => (
                        <View
                            key={idx}
                            className="bg-green-50 dark:bg-green-900/20 px-3 py-2.5 rounded-lg flex-row items-center justify-between"
                        >
                            <Text className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {skill}
                            </Text>
                            <TouchableOpacity onPress={() => removeSkill(idx)}>
                                <X size={18} color="#10B981" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Benefits */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quyền lợi & Phúc lợi
                </Text>
                <View className="flex-row gap-2">
                    <TextInput
                        placeholder="Thêm phúc lợi..."
                        value={benefitInput}
                        onChangeText={setBenefitInput}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                        onPress={addBenefit}
                        className="bg-blue-600 px-4 py-3 rounded-lg items-center justify-center"
                    >
                        <Text className="text-white font-bold text-sm">Thêm</Text>
                    </TouchableOpacity>
                </View>
                <View className="gap-2">
                    {formData.benefits?.map((benefit, idx) => (
                        <View
                            key={idx}
                            className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2.5 rounded-lg flex-row items-center justify-between"
                        >
                            <Text className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {benefit}
                            </Text>
                            <TouchableOpacity onPress={() => removeBenefit(idx)}>
                                <X size={18} color="#3B82F6" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Experience Level */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Cấp độ kinh nghiệm
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    {EXPERIENCE_LEVELS.map((level) => (
                        <TouchableOpacity
                            key={level}
                            onPress={() => handleInputChange('experience_level', level)}
                            className={`flex-1 min-w-[45%] px-3 py-2 rounded-lg border-2 ${
                                formData.experience_level === level
                                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                            }`}
                        >
                            <Text
                                className={`text-xs font-semibold text-center ${
                                    formData.experience_level === level
                                        ? 'text-orange-700 dark:text-orange-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {level === 'beginner'
                                    ? 'Mới bắt đầu'
                                    : level === 'intermediate'
                                      ? 'Trung cấp'
                                      : level === 'expert'
                                        ? 'Chuyên gia'
                                        : 'Không yêu cầu'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderReviewStep = () => (
        <View className="gap-4">
            <Text className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                Xem lại & Xác nhận
            </Text>

            <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg gap-3">
                <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Tiêu đề</Text>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formData.title}
                    </Text>
                </View>

                <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Mô tả ngắn</Text>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formData.brief_description}
                    </Text>
                </View>

                <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Tuyển cho loại nghệ sĩ
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formData.type}
                    </Text>
                </View>

                <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Hình thức tuyển dụng
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formData.recruitment_type}
                    </Text>
                </View>

                {formData.location && (
                    <View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Địa điểm</Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formData.location}
                        </Text>
                    </View>
                )}

                {(formData.budget_min || formData.budget_max) && (
                    <View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Ngân sách</Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formData.budget_min && formData.budget_max
                                ? `${formData.budget_min} - ${formData.budget_max}`
                                : formData.budget_min
                                  ? `Từ ${formData.budget_min}`
                                  : formData.budget_max
                                    ? `Đến ${formData.budget_max}`
                                    : 'Thỏa thuận'}
                            {formData.budget_currency && ` ${formData.budget_currency}`}
                        </Text>
                    </View>
                )}

                {formData.deadline && (
                    <View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Hạn nộp</Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formData.deadline}
                        </Text>
                    </View>
                )}

                {formData.genres && formData.genres.length > 0 && (
                    <View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            Thể loại nhạc
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formData.genres.join(', ')}
                        </Text>
                    </View>
                )}

                {formData.required_skills && formData.required_skills.length > 0 && (
                    <View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            Kỹ năng yêu cầu
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formData.required_skills.join(', ')}
                        </Text>
                    </View>
                )}

                {formData.benefits && formData.benefits.length > 0 && (
                    <View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Quyền lợi</Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formData.benefits.join(', ')}
                        </Text>
                    </View>
                )}
            </View>

            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                <Text className="text-xs text-blue-700 dark:text-blue-300">
                    💡 Bài đăng sẽ được công bố ngay khi bạn xác nhận. Bạn có thể chỉnh sửa sau.
                </Text>
            </View>
        </View>
    );

    const steps: FormStep[] = ['basic', 'details', 'requirements', 'review'];
    const currentStepIndex = steps.indexOf(step);

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#7C3BED" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    Tạo bài đăng công việc
                </Text>
                <Text className="text-sm font-semibold text-purple-600">
                    {currentStepIndex + 1}/{steps.length}
                </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-1 bg-gray-200 dark:bg-gray-800">
                <View
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                    style={{
                        width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                    }}
                />
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingVertical: 24,
                    gap: 20,
                }}
                showsVerticalScrollIndicator={false}
            >
                {step === 'basic' && renderBasicStep()}
                {step === 'details' && renderDetailsStep()}
                {step === 'requirements' && renderRequirementsStep()}
                {step === 'review' && renderReviewStep()}
            </ScrollView>

            {/* Footer */}
            <View className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 flex-row gap-2">
                {currentStepIndex > 0 && (
                    <TouchableOpacity
                        onPress={() => setStep(steps[currentStepIndex - 1])}
                        className="flex-1 px-4 py-3 border-2 border-purple-600 rounded-lg items-center justify-center"
                    >
                        <Text className="text-purple-600 font-bold">Quay lại</Text>
                    </TouchableOpacity>
                )}

                {currentStepIndex < steps.length - 1 ? (
                    <TouchableOpacity
                        onPress={() => setStep(steps[currentStepIndex + 1])}
                        disabled={!isBasicValid && step === 'basic'}
                        className={`flex-1 px-4 py-3 rounded-lg items-center justify-center flex-row gap-1.5 ${
                            !isBasicValid && step === 'basic' ? 'opacity-50' : 'bg-purple-600'
                        }`}
                    >
                        <LinearGradient
                            colors={
                                !isBasicValid && step === 'basic'
                                    ? ['#CCCCCC', '#CCCCCC']
                                    : ['#7C3BED', '#F471B7']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                flexDirection: 'row',
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                borderRadius: 8,
                            }}
                        >
                            <Text className="text-white font-bold">Tiếp tục</Text>
                            <ChevronRight size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isPending}
                        className="flex-1"
                    >
                        <LinearGradient
                            colors={['#7C3BED', '#F471B7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                paddingHorizontal: 20,
                                paddingVertical: 14,
                                borderRadius: 12,
                            }}
                        >
                            {isPending ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold">Đăng bài</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}
