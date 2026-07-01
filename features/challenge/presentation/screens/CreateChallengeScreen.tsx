import React from 'react';
import { View, StatusBar, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { CreateChallengeForm } from '@/features/challenge/presentation/components/createChallenge';

export default function CreateChallengeScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View className="h-[90px] pt-[40px] px-4 flex-row items-center border-b border-gray-100 bg-white z-50">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
                >
                    <ChevronLeft size={28} color="#111827" />
                </TouchableOpacity>
                <Text className="font-heading text-xl font-bold text-gray-900 ml-2">
                    Tạo Thử Thách
                </Text>
            </View>

            <KeyboardAwareScrollView
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                bottomOffset={20}
            >
                <View className="px-6 mb-8">
                    <Text className="font-heading text-3xl text-gray-900 font-extrabold tracking-tight mb-2">
                        Bắt đầu dự án mới
                    </Text>
                    <Text className="font-body text-gray-500 text-sm">
                        Cùng cộng đồng Sonic Pulse sáng tạo nên những kỷ lục âm nhạc.
                    </Text>
                </View>

                <CreateChallengeForm />
            </KeyboardAwareScrollView>
        </View>
    );
}
