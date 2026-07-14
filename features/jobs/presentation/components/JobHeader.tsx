import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, ClipboardList } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { accentFabShadow } from '@/shared/presentation/ui/shadows';

interface JobHeaderProps {
    // Hiển thị nút "Đơn của tôi" (cho ứng viên đã ứng tuyển) — Flow 6.
    onOpenMyApplications?: () => void;
}

export const JobHeader = ({ onOpenMyApplications }: JobHeaderProps) => {
    const router = useRouter();

    return (
        <View className="w-full px-4 pt-5 pb-4">
            <View className="flex-row justify-between items-center">
                <View className="gap-1">
                    <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        Việc làm
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Tìm kiếm cơ hội phù hợp với bạn
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    {onOpenMyApplications && (
                        <TouchableOpacity
                            onPress={onOpenMyApplications}
                            activeOpacity={0.8}
                            className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 items-center justify-center"
                            accessibilityLabel="Đơn ứng tuyển của tôi"
                        >
                            <ClipboardList size={20} color="#7C3BED" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => router.push('/(jobs)/recruitment-form' as `${string}`)}
                        activeOpacity={0.8}
                        style={styles.shadow}
                    >
                        <LinearGradient
                            colors={['#7C3BED', '#F471B7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Plus size={20} color="white" />
                            <Text className="text-white font-bold text-sm ml-1.5">Đăng tin</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    shadow: {
        ...accentFabShadow,
        borderRadius: 12,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
});
