import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { PlayCircle, User, Activity, Clock, PlusCircle } from 'lucide-react-native';

export type BeatCardProps = {
    title: string;
    producer: string;
    bpm: number;
    duration: string;
    genre: string;
    entries: string;
    imageUrl: string;
    isHot?: boolean;
    tagColorType?: 'primary' | 'secondary' | 'tertiary';
    onPress?: () => void;
    onPlayAudio?: () => void;
};

export function BeatCard({
    title,
    producer,
    bpm,
    duration,
    genre,
    entries,
    imageUrl,
    isHot,
    tagColorType = 'primary',
    onPress,
    onPlayAudio,
}: BeatCardProps) {
    const getTagColorInfo = () => {
        switch (tagColorType) {
            case 'secondary':
                return { text: 'text-primary-02', bg: 'bg-[#f9b8dd]/20' }; // using secondary.02 light color
            case 'tertiary':
                return { text: 'text-primary-02', bg: 'bg-[#f9b8dd]/20' };
            default:
                return { text: 'text-primary', bg: 'bg-primary/10' };
        }
    };

    const tagColors = getTagColorInfo();

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="bg-white rounded-2xl p-4 border border-gray-100 mb-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View className="flex-row gap-5">
                {/* Artwork */}
                <TouchableOpacity
                    className="w-32 h-32 rounded-xl overflow-hidden relative"
                    activeOpacity={0.9}
                    onPress={onPlayAudio}
                >
                    <Image
                        source={{ uri: imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    {/* Play Icon Overlay */}
                    <View className="absolute inset-0 bg-black/20 items-center justify-center">
                        <PlayCircle size={40} color="#ffffff" fill="transparent" opacity={0.9} />
                    </View>
                </TouchableOpacity>

                {/* Info Container */}
                <View className="flex-1 justify-between py-1">
                    <View>
                        <View className="flex-row justify-between items-start">
                            <Text
                                className="text-gray-900 font-heading text-xl leading-snug flex-1 mr-2"
                                numberOfLines={2}
                            >
                                {title}
                            </Text>
                            {isHot && (
                                <View className="bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                    <Text className="text-orange-500 text-[10px] font-bold">
                                        HOT
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center gap-1 mt-1">
                            <User size={12} color="#6b7280" />
                            <Text className="text-gray-500 text-sm font-body">
                                Sản xuất: {producer}
                            </Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View className="flex-row items-center gap-4 mt-2">
                        <View className="flex-row items-center gap-1">
                            <Activity size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-xs font-bold font-body">
                                {bpm} BPM
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Clock size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-xs font-bold font-body">
                                {duration}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Section */}
            <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className={`${tagColors.bg} px-3 py-1 rounded-md`}>
                        <Text
                            className={`${tagColors.text} text-[10px] font-bold font-body uppercase tracking-wider`}
                        >
                            {genre}
                        </Text>
                    </View>
                    <Text className="text-gray-500 text-xs font-body">
                        <Text className="text-gray-900 font-bold">{entries}</Text> Lượt nghe
                    </Text>
                </View>

                <TouchableOpacity>
                    <PlusCircle size={32} color="#7d3bed" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
