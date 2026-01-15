import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export const JobHeader = () => {
    const router = useRouter();

    return (
        <View className="w-full px-4 py-6">
            <View className="flex-row justify-between items-center">
                <View className="gap-1">
                    <Text className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Việc làm
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Tìm kiếm cơ hội phù hợp với bạn
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/(jobs)/recruitment-form' as any)}
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
    );
};

const styles = StyleSheet.create({
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
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
