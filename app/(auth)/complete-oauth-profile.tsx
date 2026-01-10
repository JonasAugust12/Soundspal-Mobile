import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserCog } from 'lucide-react-native';
import { LogoHeader } from '@/components/auth';

export default function CompleteOAuthProfileScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <View className="flex-1 items-center justify-center p-6">
                <LogoHeader />

                <View className="items-center gap-4 mt-8">
                    <View className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                        <View className="text-purple-600">
                            <UserCog size={40} />
                        </View>
                    </View>

                    <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                        Hoàn thành hồ sơ OAuth
                    </Text>
                    <Text className="text-sm text-center text-gray-600 dark:text-gray-400">
                        Tính năng này sẽ được triển khai khi tích hợp Google Sign-In
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
