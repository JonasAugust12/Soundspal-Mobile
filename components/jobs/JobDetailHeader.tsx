import React from 'react';
import { View, Text, Image } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { Job } from '@/types/job.type';
import { formatDate } from '@/utils/jobFormatters';

interface JobDetailHeaderProps {
    job: Job;
}

export const JobDetailHeader = ({ job }: JobDetailHeaderProps) => {
    const imgUri = job.assets?.[0]?.storage_url || job.assets?.[0]?.thumbnail_url;
    const datePosted = formatDate(job.created_at);

    return (
        <View className="gap-4">
            {/* Hero Image */}
            {imgUri ? (
                <Image
                    source={{ uri: imgUri }}
                    className="w-full h-64 rounded-2xl"
                    resizeMode="cover"
                />
            ) : (
                <View className="w-full h-64 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 items-center justify-center">
                    <Briefcase size={64} color="#7C3BED" />
                </View>
            )}

            {/* Title and Info */}
            <View className="gap-2">
                <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {job.title}
                </Text>

                <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium text-gray-600 dark:text-gray-400">
                        {job.type}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-500">
                        {datePosted}
                    </Text>
                </View>
            </View>
        </View>
    );
};
