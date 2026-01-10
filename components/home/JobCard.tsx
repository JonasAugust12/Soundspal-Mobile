import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType, StyleSheet, Platform } from 'react-native';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';

export type JobItem = {
    id: string;
    title: string;
    date: string;
    location: string;
    time: string;
    creator: string;
    image: ImageSourcePropType;
};

type Props = {
    item: JobItem;
    width?: number;
    onPress?: () => void;
};

export const JobCard = React.memo(function JobCard({ item, width = 210, onPress }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.92}
            style={[styles.shadow, { width }]}
            className="rounded-[20px] bg-white border border-gray-200 overflow-hidden"
        >
            {/* Job Image */}
            <View className="w-full h-[130px]">
                <Image
                    source={item.image}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            </View>

            {/* Job Info */}
            <View className="p-3 gap-2">
                <Text
                    className="text-base font-bold text-gray-900"
                    numberOfLines={1}
                >
                    {item.title}
                </Text>

                {/* Date and Location */}
                <View className="flex-row gap-3 items-center">
                    <View className="flex-row items-center gap-1.5">
                        <Calendar size={12} color="#7C3BED" />
                        <Text className="text-xs text-gray-600 font-medium">
                            {item.date}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-1.5 flex-1">
                        <MapPin size={12} color="#7C3BED" />
                        <Text
                            className="text-xs text-gray-600 font-medium"
                            numberOfLines={1}
                        >
                            {item.location}
                        </Text>
                    </View>
                </View>

                {/* Time and Creator */}
                <View className="flex-row justify-between items-center mt-1">
                    <View className="flex-row items-center gap-1.5">
                        <Clock size={12} color="#7C3BED" />
                        <Text className="text-xs text-gray-600 font-medium">
                            {item.time}
                        </Text>
                    </View>

                    <View className="bg-gray-100 px-2 py-1 rounded-lg flex-row items-center gap-1 max-w-[55%]">
                        <Users size={10} color="#7C3BED" />
                        <Text
                            className="text-xs font-bold text-purple-600"
                            numberOfLines={1}
                        >
                            {item.creator}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// Keep only shadow styles
const styles = StyleSheet.create({
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});
