import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Users, MessageCircle } from 'lucide-react-native';
import { isJobAcceptingApplications } from '@/features/jobs/domain/utils/jobFormatters';

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
}: JobDetailActionsProps) => {
    const router = useRouter();
    const canApply = !isOwned && isJobAcceptingApplications(status);

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

    return (
        <View className="gap-3">
            {canApply ? (
                <TouchableOpacity
                    onPress={onApply}
                    activeOpacity={0.8}
                    style={styles.primaryButton}
                >
                    <LinearGradient
                        colors={['#7C3BED', '#F471B7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                    >
                        <Text className="text-white font-bold text-base">Ứng tuyển ngay</Text>
                    </LinearGradient>
                </TouchableOpacity>
            ) : (
                <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl py-4 items-center">
                    <Text className="text-gray-600 dark:text-gray-300 font-semibold">
                        Bài đăng hiện không nhận ứng tuyển
                    </Text>
                </View>
            )}
            {contactButton}
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
