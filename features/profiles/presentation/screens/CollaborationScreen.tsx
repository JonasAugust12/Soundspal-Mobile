import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TabScreenWrapper } from '@/shared/presentation/navigation/TabScreenWrapper';
import { CollabTabs, CollabList } from '@/features/collab/presentation/components';

export default function CollaborationScreen() {
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
    const router = useRouter();

    const handleViewJobDetail = (jobId: string) => {
        router.push(`/(jobs)/detail?id=${jobId}`);
    };

    const handleViewJobSubmissions = (jobId: string, jobTitle: string) => {
        router.push({
            pathname: '/(profiles)/jobSubmissions',
            params: { jobId, jobTitle },
        });
    };

    return (
        <TabScreenWrapper>
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <View className="flex-row items-center gap-3 bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                    <ChevronLeft size={24} color="#7C3BED" onPress={() => router.back()} />
                    <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                        Quản lý hợp tác
                    </Text>
                </View>

                {/* Tabs */}
                <View className="px-4 py-3">
                    <CollabTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </View>

                {/* List */}
                <CollabList
                    tab={activeTab}
                    onViewJobDetail={handleViewJobDetail}
                    onViewJobSubmissions={handleViewJobSubmissions}
                />
            </SafeAreaView>
        </TabScreenWrapper>
    );
}
