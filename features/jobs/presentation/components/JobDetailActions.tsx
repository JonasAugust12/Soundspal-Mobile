import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { isJobAcceptingApplications } from '@/features/jobs/domain/utils/jobFormatters';

interface JobDetailActionsProps {
    jobId: string;
    isOwned: boolean;
    status: string;
    onApply: () => void;
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

    if (!canApply) {
        return (
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl py-4 items-center">
                <Text className="text-gray-600 dark:text-gray-300 font-semibold">
                    Bài đăng hiện không nhận ứng tuyển
                </Text>
            </View>
        );
    }

    return (
        <View className="gap-3">
            <TouchableOpacity onPress={onApply} activeOpacity={0.8} style={styles.primaryButton}>
                <LinearGradient
                    colors={['#7C3BED', '#F471B7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                >
                    <Text className="text-white font-bold text-base">Ứng tuyển ngay</Text>
                </LinearGradient>
            </TouchableOpacity>
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
