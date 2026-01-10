import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';

export default function NotificationsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1">
                <View className="p-6">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Tin nhắn
                    </Text>

                    <View className="items-center justify-center py-20">
                        <View className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-4">
                            <View className="text-orange-600">
                                <MessageCircle size={40} />
                            </View>
                        </View>
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Tin nhắn
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Tin nhắn và thông báo sẽ được thêm vào sau
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
