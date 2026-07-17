import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Play } from 'lucide-react-native';
import { KeyboardAwareModalOverlay, showAppDialog } from '@/shared/presentation/ui';
import { useSubmitJobApplication } from '@/features/jobs/presentation/hooks/useJobApi';
import { MediaPicker } from './MediaPicker';
import type { Media } from '@/features/profiles/domain/entities/media.type';

interface JobApplyModalProps {
    visible: boolean;
    onClose: () => void;
    jobId: string;
}

export const JobApplyModal = ({ visible, onClose, jobId }: JobApplyModalProps) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [portfolioLinks, setPortfolioLinks] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const { mutate: submitApplication, isPending: isLoading } = useSubmitJobApplication();
    const insets = useSafeAreaInsets();

    // Reset form when modal closes
    useEffect(() => {
        if (!visible) {
            setFullName('');
            setEmail('');
            setPhoneNumber('');
            setPortfolioLinks('');
            setSelectedMedia(null);
            setCoverLetter('');
        }
    }, [visible]);

    const handleSubmit = () => {
        // Validation
        if (!fullName || fullName.trim().length < 2) {
            showAppDialog('Lỗi', 'Họ và tên phải có ít nhất 2 ký tự');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showAppDialog('Lỗi', 'Email không hợp lệ');
            return;
        }

        // Phone number validation (Vietnamese format)
        const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
        if (!phoneNumber || !phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            showAppDialog('Lỗi', 'Số điện thoại không hợp lệ (VD: 0912345678)');
            return;
        }

        if (!coverLetter || coverLetter.trim().length < 50) {
            showAppDialog('Lỗi', 'Giới thiệu bản thân phải có ít nhất 50 ký tự');
            return;
        }

        // Parse portfolio links
        const parsedLinks = portfolioLinks
            .split(/[\n,\s]+/)
            .map((link) => link.trim())
            .filter((link) => link.length > 0);

        // Validate URLs if provided
        if (parsedLinks.length > 0) {
            const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            const invalidLinks = parsedLinks.filter((link) => !urlRegex.test(link));
            if (invalidLinks.length > 0) {
                showAppDialog('Lỗi', `Link không hợp lệ: ${invalidLinks[0]}`);
                return;
            }
        }

        // Build request body
        const requestBody = {
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone_number: phoneNumber.trim(),
            cover_letter: coverLetter.trim(),
            ...(parsedLinks.length > 0 && { portfolio_links: parsedLinks }),
            ...(selectedMedia && { demo_file: selectedMedia.file_url }),
        };

        submitApplication(
            { jobId, body: requestBody },
            {
                onSuccess: (data) => {
                    const successMessage =
                        (data as { message?: string })?.message ||
                        'Đã gửi đơn ứng tuyển thành công!';
                    showAppDialog('Thành công', successMessage, [
                        {
                            text: 'OK',
                            onPress: onClose,
                        },
                    ]);
                },
                onError: (error: unknown) => {
                    const err = error as {
                        response?: { data?: { message?: string } };
                        message?: string;
                    };
                    const errorMessage =
                        err?.response?.data?.message ||
                        err?.message ||
                        'Không thể gửi đơn ứng tuyển';
                    showAppDialog('Lỗi', errorMessage);
                },
            },
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAwareModalOverlay>
                <View className="flex-1 bg-black/50 justify-end">
                    <View
                        className="bg-white dark:bg-gray-900 rounded-t-3xl h-[95%]"
                        style={styles.modalContent}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                Ứng tuyển công việc
                            </Text>
                            <TouchableOpacity
                                onPress={onClose}
                                disabled={isLoading}
                                className="p-2 -mr-2"
                            >
                                <X size={28} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <ScrollView
                            className="flex-1 px-5 py-6"
                            showsVerticalScrollIndicator={false}
                        >
                            <View className="gap-5">
                                {/* Full Name */}
                                <View className="gap-2">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                                        Họ và tên <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        value={fullName}
                                        onChangeText={setFullName}
                                        placeholder="Nhập họ và tên"
                                        placeholderTextColor="#9CA3AF"
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-base text-gray-900 dark:text-white"
                                    />
                                </View>

                                {/* Email */}
                                <View className="gap-2">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                                        Email <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="email@example.com"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-base text-gray-900 dark:text-white"
                                    />
                                </View>

                                {/* Phone */}
                                <View className="gap-2">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                                        Số điện thoại <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        placeholder="0912345678"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-base text-gray-900 dark:text-white"
                                    />
                                </View>

                                {/* Portfolio Links */}
                                <View className="gap-2">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                                        Link portfolio/video (Youtube, SoundCloud...)
                                    </Text>
                                    <TextInput
                                        value={portfolioLinks}
                                        onChangeText={setPortfolioLinks}
                                        placeholder="Nhập các link, cách nhau bởi dấu phẩy hoặc xuống dòng"
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-base text-gray-900 dark:text-white min-h-[100px]"
                                    />
                                </View>

                                {/* Demo File / Media */}
                                <View className="gap-2">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                                        File demo (ảnh, video, âm thanh)
                                    </Text>
                                    {selectedMedia ? (
                                        <View className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 flex-row items-center justify-between">
                                            <View className="flex-1 gap-1">
                                                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {selectedMedia.file_name}
                                                </Text>
                                                <Text className="text-xs text-gray-600 dark:text-gray-400">
                                                    {(
                                                        selectedMedia.file_size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{' '}
                                                    MB
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => setSelectedMedia(null)}
                                                className="p-2"
                                            >
                                                <X size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => setShowMediaPicker(true)}
                                            className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl py-6 items-center gap-2"
                                        >
                                            <Play size={24} color="#7C3BED" />
                                            <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                                                Chọn từ phương tiện của tôi
                                            </Text>
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                Hoặc upload từ profile
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Cover Letter */}
                                <View className="gap-2">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                                        Giới thiệu bản thân <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        value={coverLetter}
                                        onChangeText={setCoverLetter}
                                        placeholder="Chia sẻ về kinh nghiệm, kỹ năng và lý do phù hợp với công việc này... (tối thiểu 50 ký tự)"
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={8}
                                        textAlignVertical="top"
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-base text-gray-900 dark:text-white min-h-[160px]"
                                    />
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        {coverLetter.length}/50 ký tự tối thiểu
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View
                            className="px-5 pt-5 border-t border-gray-200 dark:border-gray-700 gap-3"
                            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
                        >
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isLoading}
                                className="bg-purple-600 rounded-xl py-4 items-center"
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">
                                        Gửi đơn ứng tuyển
                                    </Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onClose}
                                disabled={isLoading}
                                className="bg-gray-200 dark:bg-gray-700 rounded-xl py-4 items-center"
                                activeOpacity={0.8}
                            >
                                <Text className="text-gray-900 dark:text-white font-semibold text-base">
                                    Huỷ
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAwareModalOverlay>

            {/* Media Picker Modal */}
            <MediaPicker
                visible={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={setSelectedMedia}
                selectedMediaId={selectedMedia?.id}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});
