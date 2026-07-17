import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Users, MessageCircle, Bookmark, FileText } from 'lucide-react-native';
import type { JobPrimaryAction } from '@/features/jobs/domain/utils/jobInteractionState';

interface JobDetailActionsProps {
    jobId: string;
    isOwned: boolean;
    status: string;
    onApply: () => void;
    onViewApplicants?: () => void;
    submissionsCount?: number;
    onContact?: () => void;
    isContacting?: boolean;
    onPublish?: () => void;
    onReopen?: () => void;
    onClose?: () => void;
    isPublishing?: boolean;
    isReopening?: boolean;
    isClosing?: boolean;
    // Trạng thái tương tác (non-owner)
    primaryAction?: JobPrimaryAction;
    reasonLabel?: string;
    onViewApplication?: () => void;
    canSave?: boolean;
    isSaved?: boolean;
    onToggleSave?: () => void;
}

export const JobDetailActions = ({
    jobId,
    isOwned,
    status,
    onApply,
    onViewApplicants,
    submissionsCount,
    onContact,
    isContacting,
    onPublish,
    onReopen,
    onClose,
    isPublishing,
    isReopening,
    isClosing,
    primaryAction = 'apply',
    reasonLabel,
    onViewApplication,
    canSave,
    isSaved,
    onToggleSave,
}: JobDetailActionsProps) => {
    const router = useRouter();

    if (isOwned) {
        return (
            <View className="gap-3">
                {onViewApplicants && (
                    <TouchableOpacity
                        onPress={onViewApplicants}
                        activeOpacity={0.8}
                        className="flex-row items-center justify-center gap-2 border-2 border-purple-600 rounded-2xl py-4"
                    >
                        <Users size={18} color="#7C3BED" />
                        <Text className="text-purple-600 font-bold text-base">
                            Xem đơn ứng tuyển
                            {typeof submissionsCount === 'number' ? ` (${submissionsCount})` : ''}
                        </Text>
                    </TouchableOpacity>
                )}

                {status === 'draft' && onPublish && (
                    <TouchableOpacity
                        onPress={onPublish}
                        disabled={isPublishing}
                        activeOpacity={0.8}
                        style={styles.primaryButton}
                    >
                        <LinearGradient
                            colors={['#7C3BED', '#F471B7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            {isPublishing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">
                                    Xuất bản bài đăng
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {status === 'closed' && onReopen && (
                    <TouchableOpacity
                        onPress={onReopen}
                        disabled={isReopening}
                        activeOpacity={0.8}
                        style={styles.primaryButton}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            {isReopening ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">
                                    Mở lại tuyển dụng
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => router.push(`/(jobs)/edit-job?id=${jobId}` as `${string}`)}
                    activeOpacity={0.8}
                    style={styles.primaryButton}
                >
                    <LinearGradient
                        colors={['#7C3BED', '#F471B7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                    >
                        <Text className="text-white font-bold text-base">Chỉnh sửa bài đăng</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {status === 'published' && onClose && (
                    <TouchableOpacity
                        onPress={onClose}
                        disabled={isClosing}
                        activeOpacity={0.8}
                        className="border-2 border-red-500 rounded-2xl py-4 items-center justify-center"
                    >
                        {isClosing ? (
                            <ActivityIndicator color="#EF4444" />
                        ) : (
                            <Text className="text-red-500 font-bold text-base">Đóng bài đăng</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // ---- Non-owner ----
    const gradientButton = (label: string, onPress?: () => void) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.primaryButton}>
            <LinearGradient
                colors={['#7C3BED', '#F471B7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
            >
                <Text className="text-white font-bold text-base">{label}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    const contactButton = onContact ? (
        <TouchableOpacity
            onPress={onContact}
            disabled={isContacting}
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-2 border-2 border-purple-600 rounded-2xl py-4"
        >
            {isContacting ? (
                <ActivityIndicator color="#7C3BED" />
            ) : (
                <>
                    <MessageCircle size={18} color="#7C3BED" />
                    <Text className="text-purple-600 font-bold text-base">Nhắn tin</Text>
                </>
            )}
        </TouchableOpacity>
    ) : null;

    const saveButton =
        canSave && onToggleSave ? (
            <TouchableOpacity
                onPress={onToggleSave}
                activeOpacity={0.8}
                className="flex-row items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-600 rounded-2xl py-4"
            >
                <Bookmark
                    size={18}
                    color={isSaved ? '#7C3BED' : '#6B7280'}
                    fill={isSaved ? '#7C3BED' : 'transparent'}
                />
                <Text
                    className={`font-bold text-base ${isSaved ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    {isSaved ? 'Đã lưu' : 'Lưu tin'}
                </Text>
            </TouchableOpacity>
        ) : null;

    let primary: React.ReactNode = null;
    if (primaryAction === 'apply') {
        primary = gradientButton('Ứng tuyển ngay', onApply);
    } else if (primaryAction === 'contact') {
        primary = onContact ? (
            <TouchableOpacity
                onPress={onContact}
                disabled={isContacting}
                activeOpacity={0.8}
                style={styles.primaryButton}
            >
                <LinearGradient
                    colors={['#7C3BED', '#F471B7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                >
                    {isContacting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View className="flex-row items-center gap-2">
                            <MessageCircle size={18} color="#FFFFFF" />
                            <Text className="text-white font-bold text-base">
                                Liên hệ / Nhắn tin
                            </Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        ) : null;
    } else if (primaryAction === 'view_application') {
        primary = (
            <TouchableOpacity
                onPress={onViewApplication}
                activeOpacity={0.8}
                className="flex-row items-center justify-center gap-2 border-2 border-purple-600 rounded-2xl py-4"
            >
                <FileText size={18} color="#7C3BED" />
                <Text className="text-purple-600 font-bold text-base">Xem đơn của tôi</Text>
            </TouchableOpacity>
        );
    } else {
        // unavailable
        primary = (
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl py-4 items-center">
                <Text className="text-gray-600 dark:text-gray-300 font-semibold text-center px-4">
                    {reasonLabel || 'Bài đăng hiện không nhận ứng tuyển'}
                </Text>
            </View>
        );
    }

    return (
        <View className="gap-3">
            {primary}
            {primaryAction !== 'contact' && contactButton}
            {saveButton}
        </View>
    );
};

const styles = StyleSheet.create({
    primaryButton: {
        borderRadius: 16,
    },
    gradientButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
