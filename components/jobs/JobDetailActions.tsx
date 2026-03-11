import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface JobDetailActionsProps {
    jobId: string;
    isOwned: boolean;
    onApply: () => void;
}

export const JobDetailActions = ({ jobId, isOwned, onApply }: JobDetailActionsProps) => {
    const router = useRouter();

    if (isOwned) {
        return (
            <View className="gap-3">
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
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    gradientButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
