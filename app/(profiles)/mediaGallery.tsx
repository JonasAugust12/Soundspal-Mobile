import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { MediaUploadSection } from "@/components/profile/MediaUploadSection";

export default function MediaGalleryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#09090b" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
          Phương tiện của tôi
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <MediaUploadSection />
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
