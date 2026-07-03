import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bookmark, Briefcase, Calendar, DollarSign, MapPin, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Job } from '@/features/jobs/domain/entities/job.type';
import {
    formatBudget,
    formatDate,
    formatJobType,
} from '@/features/jobs/domain/utils/jobFormatters';
import { cardShadow } from '@/shared/presentation/ui/shadows';

import { JobApplyModal } from './JobApplyModal';

interface JobCardFullProps {
    job: Job;
    isOwned?: boolean;
    onEdit?: () => void;
}

export const JobCardFull = ({ job, isOwned, onEdit }: JobCardFullProps) => {
    const router = useRouter();
    const [showApplyModal, setShowApplyModal] = useState(false);

    const imgUri = job.assets?.[0]?.thumbnail_url || job.assets?.[0]?.storage_url;
    const formattedBudget = formatBudget(job.budget_min, job.budget_max, job.budget_currency);
    const datePosted = formatDate(job.created_at);
    const jobTypeDisplay = formatJobType(job.type);

    const handleViewDetails = () => {
        router.push(`/(jobs)/detail?id=${job.id}` as `${string}`);
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else {
            router.push(`/(jobs)/edit-job?id=${job.id}` as `${string}`);
        }
    };

    return (
        <View className="w-full">
            <View
                className="gap-4 p-4 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                style={styles.card}
            >
                {/* Top section with image and title */}
                <View className="flex-row gap-4 items-start">
                    <View
                        style={styles.imageContainer}
                        className="bg-white dark:bg-gray-700 rounded-2xl p-1"
                    >
                        {imgUri ? (
                            <Image
                                source={{ uri: imgUri }}
                                className="w-full h-full rounded-xl"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-full rounded-xl bg-purple-50 dark:bg-purple-900/20 items-center justify-center">
                                <Briefcase size={32} color="#7C3BED" />
                            </View>
                        )}
                    </View>

                    <View className="flex-1 gap-1">
                        <View className="flex-row justify-between items-start">
                            <Text
                                className="text-lg font-bold text-gray-900 dark:text-white flex-1 pr-2 leading-tight"
                                numberOfLines={2}
                            >
                                {job.title}
                            </Text>
                            <TouchableOpacity className="p-1">
                                <Bookmark size={20} color="#7C3BED" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center gap-2 flex-wrap mt-1">
                            <View className="bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                                <Text className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                                    {jobTypeDisplay}
                                </Text>
                            </View>
                            {isOwned && (
                                <View className="flex-row items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/50">
                                    <Crown size={10} color="#F59E0B" />
                                    <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                                        Của tôi
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Info grid */}
                <View className="flex-row flex-wrap gap-2 mt-2">
                    <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[48%]">
                        <View className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                            <Briefcase size={14} color="#7C3BED" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                Hình thức
                            </Text>
                            <Text
                                className="text-xs font-bold text-gray-700 dark:text-gray-200"
                                numberOfLines={1}
                            >
                                {job.recruitment_type}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[48%]">
                        <View className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                            <DollarSign size={14} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                Ngân sách
                            </Text>
                            <Text
                                className="text-xs font-bold text-gray-700 dark:text-gray-200"
                                numberOfLines={1}
                            >
                                {formattedBudget}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[48%]">
                        <View className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
                            <MapPin size={14} color="#EF4444" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                Địa điểm
                            </Text>
                            <Text
                                className="text-xs font-bold text-gray-700 dark:text-gray-200"
                                numberOfLines={1}
                            >
                                {job.location || 'Toàn quốc'}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[48%]">
                        <View className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                            <Calendar size={14} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                Ngày đăng
                            </Text>
                            <Text
                                className="text-xs font-bold text-gray-700 dark:text-gray-200"
                                numberOfLines={1}
                            >
                                {datePosted}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-2">
                    <TouchableOpacity
                        onPress={isOwned ? handleEdit : () => setShowApplyModal(true)}
                        activeOpacity={0.8}
                        className="flex-1"
                    >
                        <LinearGradient
                            colors={['#7C3BED', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.gradientButtonFix, { flex: 1 }]}
                        >
                            <Text className="text-white font-bold text-sm">
                                {isOwned ? 'Chỉnh sửa' : 'Ứng tuyển ngay'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleViewDetails}
                        activeOpacity={0.8}
                        className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 py-3.5 rounded-2xl items-center justify-center"
                    >
                        <Text className="text-gray-900 dark:text-white font-bold text-sm">
                            Chi tiết
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Apply Modal */}
            <JobApplyModal
                visible={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                jobId={job.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: cardShadow,
    imageContainer: {
        width: 80,
        height: 80,
    },
    gradientButtonFix: {
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
