import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useGetJobById } from "@/hooks/useJobApi";
import { useAuthStore } from "@/stores/authStore";
import {
  JobDetailHeader,
  JobDetailTags,
  JobDetailInfo,
  JobDetailActions,
  JobApplyModal,
  JobRequiredSkills,
  JobBenefits,
} from "@/components/jobs";
import { formatDate } from "@/utils/jobFormatters";

export default function JobDetailScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useLocalSearchParams<{ id: string }>();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const jobId = useMemo(
    () => (Array.isArray(params.id) ? params.id[0] : params.id),
    [params.id]
  );

  const {
    data: job,
    isLoading,
    error,
  } = useGetJobById(jobId ?? "", {
    enabled: !!jobId,
  });

  const isOwned = useMemo(
    () =>
      !!(
        job &&
        user &&
        String(job.creator_id).trim() === String(user.id).trim()
      ),
    [job, user]
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white dark:bg-gray-900"
        edges={["top", "left", "right"]}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3BED" />
          <Text className="text-gray-600 dark:text-gray-400 mt-4">
            Đang tải...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <SafeAreaView
        className="flex-1 bg-white dark:bg-gray-900"
        edges={["top", "left", "right"]}
      >
        {/* Back Button */}
        <View className="px-4 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2"
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#7C3BED" />
            <Text className="text-base font-semibold text-purple-600">
              Quay lại
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-lg font-bold text-red-600 dark:text-red-400 text-center">
            {!jobId
              ? "Không tìm thấy ID công việc"
              : "Không thể tải thông tin công việc"}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const deadline = job.deadline ? formatDate(job.deadline) : undefined;

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-gray-900"
      edges={["top", "left", "right"]}
    >
      {/* Back Button */}
      <View className="px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#7C3BED" />
          <Text className="text-base font-semibold text-purple-600">
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <JobDetailHeader job={job} />

        {/* Brief Description */}
        {job.brief_description && (
          <View className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {job.brief_description}
            </Text>
          </View>
        )}

        {/* Tags */}
        {job.genres && job.genres.length > 0 && (
          <JobDetailTags tags={job.genres} />
        )}

        {/* Description */}
        {job.description && (
          <View className="gap-4 px-1">
            <View className="flex-row items-center gap-2">
              <View className="w-1.5 h-6 bg-purple-600 rounded-full" />
              <Text className="text-xl font-black text-gray-900 dark:text-white">
                Mô tả công việc
              </Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100 dark:border-gray-700">
              <Text className="text-base text-gray-700 dark:text-gray-300 leading-7">
                {job.description}
              </Text>
            </View>
          </View>
        )}

        {/* Job Info */}
        <JobDetailInfo
          recruitmentType={job.recruitment_type}
          budgetMin={job.budget_min}
          budgetMax={job.budget_max}
          budgetCurrency={job.budget_currency}
          location={job.location}
          deadline={deadline}
          workTime={job.work_time}
          isNegotiable={job.is_negotiable}
        />

        {/* Required Skills */}
        {job.required_skills && job.required_skills.length > 0 && (
          <JobRequiredSkills skills={job.required_skills} />
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <JobBenefits benefits={job.benefits} />
        )}

        {/* Action Buttons */}
        <JobDetailActions
          jobId={job.id}
          isOwned={isOwned}
          onApply={() => setShowApplyModal(true)}
        />
      </ScrollView>

      {/* Apply Modal */}
      <JobApplyModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        jobId={job.id}
      />
    </SafeAreaView>
  );
}
