import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass } from 'lucide-react-native';

export default function ExploreScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1">
                <View className="p-6">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Khám phá
                    </Text>

                    <View className="items-center justify-center py-20">
                        <View className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
                            <View className="text-blue-600">
                                <Compass size={40} />
                            </View>
                        </View>
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Khám phá
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Tính năng khám phá sẽ được thêm vào sau
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
