import React from "react";
import { View, Text } from "react-native";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react-native";
import type { SubmissionStatus } from "@/types/collaboration.type";

interface StatusBadgeProps {
  status: SubmissionStatus;
  size?: "sm" | "md" | "lg";
}

export const CollabStatusBadge = ({
  status,
  size = "md",
}: StatusBadgeProps) => {
  const getStatusConfig = (status: SubmissionStatus) => {
    switch (status) {
      case "pending_review":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          text: "text-yellow-700 dark:text-yellow-300",
          icon: Clock,
          label: "Đang chờ xem xét",
        };
      case "accepted":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          text: "text-green-700 dark:text-green-300",
          icon: CheckCircle,
          label: "Chấp nhận",
        };
      case "rejected":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-700 dark:text-red-300",
          icon: XCircle,
          label: "Từ chối",
        };
      case "withdrawn":
        return {
          bg: "bg-gray-50 dark:bg-gray-800",
          border: "border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          icon: AlertCircle,
          label: "Đã rút lại",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClass = {
    sm: "px-2 py-1 gap-1",
    md: "px-3 py-1.5 gap-1.5",
    lg: "px-4 py-2 gap-2",
  }[size];

  const iconSize = { sm: 14, md: 16, lg: 18 }[size];
  const textSize = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];

  return (
    <View
      className={`flex-row items-center rounded-lg border ${config.bg} ${config.border} ${sizeClass}`}
    >
      <Icon size={iconSize} color={config.text} />
      <Text className={`font-semibold ${config.text} ${textSize}`}>
        {config.label}
      </Text>
    </View>
  );
};
