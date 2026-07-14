import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { InitialsAvatar } from '@/shared/presentation/ui';
import { Job } from '@/features/jobs/domain/entities/job.type';
import { formatDate, formatJobType } from '@/features/jobs/domain/utils/jobFormatters';

interface JobDetailHeaderProps {
    job: Job;
}

export const JobDetailHeader = ({ job }: JobDetailHeaderProps) => {
    const posterName = job.creator_display_name || job.creator_username;
    // Ảnh nền hero: ưu tiên cover người đăng → avatar người đăng → chữ-từ-tên.
    const heroUri =
        job.creator_cover_url?.trim() ||
        job.creator_avatar_url?.trim() ||
        job.creator_avatar?.trim();
    // Avatar mục "Đăng bởi".
    const posterAvatarUri = job.creator_avatar_url?.trim() || job.creator_avatar?.trim();
    const datePosted = formatDate(job.created_at);
    const jobTypeDisplay = formatJobType(job.type);

    return (
        <View className="gap-4">
            {/* Hero Image */}
            <View className="relative w-full h-72 rounded-3xl overflow-hidden">
                {heroUri ? (
                    <Image
                        source={{ uri: heroUri }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                    />
                ) : (
                    <InitialsAvatar fill name={posterName} fontSize={72} />
                )}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.overlay}
                />
                <View className="absolute bottom-4 left-4 right-4">
                    <View className="flex-row items-center gap-2">
                        <View className="bg-purple-600 px-3 py-1 rounded-full border border-white/20">
                            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                                {jobTypeDisplay}
                            </Text>
                        </View>
                        <View className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                                {datePosted}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Title and Creator */}
            <View className="gap-4 px-1">
                <Text className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {job.title}
                </Text>

                {/* Creator Info */}
                {posterName && (
                    <View className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full overflow-hidden">
                                {posterAvatarUri ? (
                                    <Image
                                        source={{ uri: posterAvatarUri }}
                                        className="w-10 h-10 rounded-full"
                                    />
                                ) : (
                                    <InitialsAvatar fill name={posterName} fontSize={16} />
                                )}
                            </View>
                            <View>
                                <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-tight">
                                    Đăng bởi
                                </Text>
                                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                                    {posterName}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            className="bg-purple-600/10 px-4 py-2 rounded-xl"
                            style={styles.profileButton}
                        >
                            <Text className="text-xs font-bold text-purple-600">Hồ sơ</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 128,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    profileButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
});
