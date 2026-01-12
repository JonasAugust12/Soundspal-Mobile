import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";

interface CollabTabsProps {
  activeTab: "sent" | "received";
  onTabChange: (tab: "sent" | "received") => void;
}

export const CollabTabs = ({ activeTab, onTabChange }: CollabTabsProps) => {
  return (
    <View className="flex-row gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full">
      {["sent", "received"].map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab as "sent" | "received")}
            // XÓA class "shadow" ở đây để tránh lỗi crash
            className={`flex-1 py-3 rounded-lg items-center justify-center transition-colors ${
              isActive ? "bg-white dark:bg-gray-700" : "bg-transparent"
            }`}
            // Thêm style bóng đổ thủ công nếu cần (an toàn hơn NativeWind shadow trong trường hợp này)
            style={
              isActive
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2, // Cho Android
                  }
                : undefined
            }
          >
            <Text
              className={`font-semibold text-sm ${
                isActive
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {tab === "sent" ? "Đã gửi" : "Nhận được"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
