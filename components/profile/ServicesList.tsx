import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { Briefcase, Check, Tag, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserService } from '@/types/user.type';

interface ServicesListProps {
    services: UserService[];
}

export function ServicesList({ services }: ServicesListProps) {
    if (!services || services.length === 0) return null;

    const formatPrice = (price: number, currency: string) => {
        if (price === 0) return 'Thỏa thuận';
        return `${price.toLocaleString()} ${currency}`;
    };

    return (
        <View className="gap-4">
            {/* Section Header */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                        <Briefcase size={18} color="#3B82F6" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">Dịch vụ</Text>
                </View>
                <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <Text className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">
                        Đang nhận việc
                    </Text>
                </View>
            </View>

            {/* Services Grid */}
            <View className="gap-3">
                {services.map((service, index) => (
                    <View
                        key={index}
                        className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                        style={styles.card}
                    >
                        {/* Gradient Top Bar */}
                        <LinearGradient
                            colors={['#3B82F6', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-1"
                        />

                        <View className="p-4">
                            <View className="flex-row justify-between items-start">
                                {/* Service Info */}
                                <View className="flex-1 pr-3">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={2}>
                                        {service.name}
                                    </Text>

                                    {/* Tags */}
                                    <View className="flex-row flex-wrap gap-2 mt-2">
                                        {service.is_negotiable && (
                                            <View className="flex-row items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md">
                                                <MessageCircle size={10} color="#22C55E" />
                                                <Text className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                                                    Thương lượng
                                                </Text>
                                            </View>
                                        )}
                                        <View className="flex-row items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                            <Check size={10} color="#3B82F6" />
                                            <Text className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                                Chất lượng
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Price */}
                                <View className="items-end">
                                    <View className="bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-xl border border-purple-100 dark:border-purple-800">
                                        <Text className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                                            {formatPrice(service.price, service.currency)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
