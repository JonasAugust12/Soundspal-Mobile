import React from "react";
import { View, Text, Image } from "react-native";
import { Briefcase, User } from "lucide-react-native";
import { Job } from "@/types/job.type";
import { formatDate, formatJobType } from "@/utils/jobFormatters";

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
      <View className="gap-3">
        <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {job.title}
        </Text>

        {/* Job Type and Date */}
        <View className="flex-row items-center justify-between">
          <View className="bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg">
            <Text className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {jobTypeDisplay}
            </Text>
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-500">
            {datePosted}
          </Text>
        </View>

        {/* Creator Info */}
        {job.creator_display_name && (
          <View className="flex-row items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5">
            <User size={16} color="#7C3BED" />
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Đăng bởi
              </Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {job.creator_display_name}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
