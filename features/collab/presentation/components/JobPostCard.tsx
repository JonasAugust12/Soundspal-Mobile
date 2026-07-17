import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Briefcase, Calendar, Users } from 'lucide-react-native';
import { formatDate } from '@/features/jobs/domain/utils/jobFormatters';

interface JobPostCardProps {
    job: {
        id: string;
        title: string;
        post_type: string;
        created_at: string;
        submission_deadline?: string;
        total_submissions?: number;
    };
    onPress: () => void;
}

export const JobPostCard = ({ job, onPress }: JobPostCardProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 active:opacity-70"
        >
            {/* Header */}
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 gap-1">
                    <Text
                        className="text-base font-bold text-gray-900 dark:text-white"
                        numberOfLines={2}
                    >
                        {job.title}
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <Briefcase size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {job.post_type}
                        </Text>
                    </View>
                </View>

                {/* Submissions Count Badge */}
                <View className="bg-purple-600 px-3 py-2 rounded-full">
                    <Text className="text-white font-bold text-sm">
                        {job.total_submissions || 0} đơn
                    </Text>
                </View>
            </View>

            {/* Details */}
            <View className="gap-2">
                <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Đăng: {formatDate(job.created_at)}
                    </Text>
                </View>

                {job.submission_deadline && (
                    <View className="flex-row items-center gap-2">
                        <Calendar size={14} color="#F59E0B" />
                        <Text className="text-sm text-orange-600 dark:text-orange-400">
                            Hạn nộp: {formatDate(job.submission_deadline)}
                        </Text>
                    </View>
                )}

                <View className="flex-row items-center gap-2">
                    <Users size={14} color="#7C3BED" />
                    <Text className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                        {job.total_submissions || 0} người đã ứng tuyển
                    </Text>
                </View>
            </View>

            {/* View button hint */}
            <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Nhấn để xem ứng tuyển →
                </Text>
            </View>
        </TouchableOpacity>
    );
};
