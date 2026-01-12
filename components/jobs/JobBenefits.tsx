import React from "react";
import { View, Text } from "react-native";
import { Gift } from "lucide-react-native";

interface JobBenefitsProps {
  benefits: string[];
}

export const JobBenefits = ({ benefits }: JobBenefitsProps) => {
  if (!benefits || benefits.length === 0) return null;

  return (
    <View className="gap-3">
      <Text className="text-lg font-extrabold text-gray-900 dark:text-white">
        Quyền lợi & Phúc lợi
      </Text>
      <View className="gap-2">
        {benefits.map((benefit, index) => (
          <View
            key={index}
            className="flex-row items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-3 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <Gift size={18} color="#3B82F6" />
            <Text className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              {benefit}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
