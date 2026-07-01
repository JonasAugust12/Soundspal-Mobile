import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, User } from 'lucide-react-native';
import { Job } from '@/features/jobs/domain/entities/job.type';
import { formatDate, formatJobType } from '@/features/jobs/domain/utils/jobFormatters';

interface JobDetailHeaderProps {
    job: Job;
}

export const JobDetailHeader = ({ job }: JobDetailHeaderProps) => {
    const imgUri = job.assets?.[0]?.storage_url || job.assets?.[0]?.thumbnail_url;
    const datePosted = formatDate(job.created_at);
    const jobTypeDisplay = formatJobType(job.type);

    return (
        <View className="gap-4">
            {/* Hero Image */}
            <View className="relative">
                {imgUri ? (
                    <Image
                        source={{ uri: imgUri }}
                        className="w-full h-72 rounded-3xl"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-72 rounded-3xl bg-purple-50 dark:bg-purple-900/10 items-center justify-center border border-purple-100 dark:border-purple-900/30">
                        <Briefcase size={64} color="#7C3BED" />
                    </View>
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
                {job.creator_display_name && (
                    <View className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                                <User size={20} color="#7C3BED" />
                            </View>
                            <View>
                                <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-tight">
                                    Đăng bởi
                                </Text>
                                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                                    {job.creator_display_name}
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
