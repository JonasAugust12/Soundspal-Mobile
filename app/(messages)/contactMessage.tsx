import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function ContactMessageScreen() {
    const router = useRouter();

    const [location, setLocation] = useState('');
    const [time, setTime] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [eventType, setEventType] = useState('');
    const [budget, setBudget] = useState('');
    const [description, setDescription] = useState('');

    const handleAccept = () => {
        // TODO: Implement accept logic
        console.log('Accepted');
    };

    const handleReject = () => {
        // TODO: Implement reject logic
        console.log('Rejected');
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                    <View>
                        {/* Header */}
                        <View className="p-3 flex-row items-center">
                            <Pressable onPress={() => router.back()} className="p-2">
                                <ChevronLeft size={20} color="#09090b" />
                            </Pressable>

                            <Image
                                source={require('@/assets/images/user_profile.png')}
                                className="w-12 h-12 rounded-full"
                            />

                            <View className="justify-center ml-2">
                                <Text className="text-sm font-bold">Smith Mathew</Text>
                                <Text className="text-xs">Active Now</Text>
                            </View>
                        </View>

                        {/* Địa điểm */}
                        <View>
                            <Text className="text-sm font-bold m-4">Địa điểm</Text>
                            <TextInput
                                placeholder="Nhập địa điểm của bạn"
                                value={location}
                                onChangeText={setLocation}
                                className="w-[90%] self-center h-11 px-4 bg-secondary rounded-xl text-foreground"
                                placeholderTextColor="#71717a"
                            />
                        </View>

                        {/* Thời gian */}
                        <View>
                            <Text className="text-sm font-bold m-4">Thời gian</Text>
                            <TextInput
                                placeholder=""
                                value={time}
                                onChangeText={setTime}
                                className="w-[90%] self-center h-11 px-4 bg-secondary rounded-xl text-foreground"
                                placeholderTextColor="#71717a"
                            />
                        </View>

                        {/* SĐT */}
                        <View>
                            <Text className="text-sm font-bold m-4">SĐT</Text>
                            <TextInput
                                placeholder=""
                                value={phone}
                                onChangeText={setPhone}
                                className="w-[90%] self-center h-11 px-4 bg-secondary rounded-xl text-foreground"
                                placeholderTextColor="#71717a"
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Email */}
                        <View>
                            <Text className="text-sm font-bold m-4">Email</Text>
                            <TextInput
                                placeholder=""
                                value={email}
                                onChangeText={setEmail}
                                className="w-[90%] self-center h-11 px-4 bg-secondary rounded-xl text-foreground"
                                placeholderTextColor="#71717a"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Loại sự kiện */}
                        <View>
                            <Text className="text-sm font-bold m-4">Loại sự kiện</Text>
                            <TextInput
                                placeholder=""
                                value={eventType}
                                onChangeText={setEventType}
                                className="w-[90%] self-center h-11 px-4 bg-secondary rounded-xl text-foreground"
                                placeholderTextColor="#71717a"
                            />
                        </View>

                        {/* Ngân sách */}
                        <View>
                            <Text className="text-sm font-bold m-4">Ngân sách</Text>
                            <TextInput
                                placeholder=""
                                value={budget}
                                onChangeText={setBudget}
                                className="w-[90%] self-center h-11 px-4 bg-secondary rounded-xl text-foreground"
                                placeholderTextColor="#71717a"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Mô tả công việc */}
                        <View>
                            <Text className="text-sm font-bold m-4">Mô tả công việc</Text>
                            <TextInput
                                placeholder=""
                                value={description}
                                onChangeText={setDescription}
                                className="w-[90%] self-center px-4 py-3 bg-secondary rounded-xl text-foreground"
                                placeholderTextColor="#71717a"
                                multiline
                                numberOfLines={4}
                                style={{ height: 100, textAlignVertical: 'top' }}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Buttons */}
                <View className="flex-row justify-around pt-5 pb-2">
                    <Pressable
                        onPress={handleAccept}
                        className="w-[140px] h-11 bg-primary rounded-xl items-center justify-center"
                    >
                        <Text className="text-sm font-bold text-white">Chấp nhận</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleReject}
                        className="w-[140px] h-11 bg-secondary rounded-xl items-center justify-center"
                    >
                        <Text className="text-sm font-bold text-foreground">Từ chối</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
