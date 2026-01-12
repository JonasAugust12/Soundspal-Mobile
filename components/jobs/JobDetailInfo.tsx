import React from "react";
import { View, Text } from "react-native";
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
} from "lucide-react-native";
import { formatBudget } from "@/utils/jobFormatters";

interface JobDetailInfoProps {
  recruitmentType: string;
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
  location: string;
  deadline?: string;
  workTime?: string;
  isNegotiable?: boolean;
}

export const JobDetailInfo = ({
  recruitmentType,
  budgetMin,
  budgetMax,
  budgetCurrency,
  location,
  deadline,
  workTime,
  isNegotiable,
}: JobDetailInfoProps) => {
  const formattedBudget = formatBudget(budgetMin, budgetMax, budgetCurrency);

  return (
    <View className="gap-3">
      <Text className="text-lg font-extrabold text-gray-900 dark:text-white">
        Thông tin công việc
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {/* Recruitment Type */}
        <View className="flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 min-w-[45%]">
          <Briefcase size={20} color="#7C3BED" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Hình thức
            </Text>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {recruitmentType}
            </Text>
          </View>
        </View>

        {/* Budget */}
        <View className="flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 min-w-[45%]">
          <DollarSign size={20} color="#10B981" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Ngân sách {isNegotiable && "(Thỏa thuận)"}
            </Text>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {formattedBudget}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View className="flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 min-w-[45%]">
          <MapPin size={20} color="#EF4444" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Địa điểm
            </Text>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {location || "Không yêu cầu"}
            </Text>
          </View>
        </View>

        {/* Deadline */}
        {deadline && (
          <View className="flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 min-w-[45%]">
            <Calendar size={20} color="#3B82F6" />
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Hạn nộp
              </Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {deadline}
              </Text>
            </View>
          </View>
        )}

        {/* Work Time */}
        {workTime && (
          <View className="flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 min-w-[45%]">
            <Clock size={20} color="#F59E0B" />
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Thời gian làm việc
              </Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {workTime}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
