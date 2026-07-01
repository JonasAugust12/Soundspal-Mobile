import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ImageSourcePropType,
    StyleSheet,
    Platform,
} from 'react-native';
import { MapPin, Clock, DollarSign, Briefcase } from 'lucide-react-native';

export type JobItem = {
    id: string;
    title: string;
    briefDescription?: string;
    location: string;
    workTime?: string;
    budgetMin?: number;
    budgetMax?: number;
    budgetCurrency?: string;
    genres?: string[];
    recruitmentType?: string;
    creatorName: string;
    creatorAvatar?: ImageSourcePropType;
    postType?: string;
};

type Props = {
    item: JobItem;
    width?: number;
    onPress?: () => void;
};

// Helper to format budget
const formatBudget = (min?: number, max?: number, _currency?: string) => {
    if (!min && !max) return 'Thỏa thuận';

    const formatNum = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(0)}tr`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
        return n.toString();
    };

    if (min && max) {
        return `${formatNum(min)} - ${formatNum(max)}`;
    }
    return min ? `Từ ${formatNum(min)}` : `Đến ${formatNum(max!)}`;
};

// Helper to get recruitment type label
const getRecruitmentLabel = (type?: string) => {
    const labels: Record<string, string> = {
        full_time: 'Toàn thời gian',
        part_time: 'Bán thời gian',
        contract: 'Hợp đồng',
        one_time: 'Một lần',
    };
    return labels[type || ''] || 'Linh hoạt';
};

// Helper to get post type badge
const getPostTypeBadge = (type?: string) => {
    switch (type) {
        case 'job_offer':
            return { label: 'Tuyển dụng', bg: 'bg-blue-100', text: 'text-blue-600' };
        case 'gig':
            return { label: 'Việc ngắn hạn', bg: 'bg-orange-100', text: 'text-orange-600' };
        case 'availability':
            return { label: 'Đang nhận việc', bg: 'bg-green-100', text: 'text-green-600' };
        default:
            return { label: 'Việc làm', bg: 'bg-gray-100', text: 'text-gray-600' };
    }
};

export const JobCard = React.memo(function JobCard({ item, width = 220, onPress }: Props) {
    const postTypeBadge = getPostTypeBadge(item.postType);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.92}
            style={[styles.shadow, { width }]}
            className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
        >
            {/* Header with creator info */}
            <View className="flex-row items-center gap-2 p-3 border-b border-gray-100">
                <Image
                    source={item.creatorAvatar || require('@/assets/images/user_profile.png')}
                    className="w-8 h-8 rounded-full"
                    resizeMode="cover"
                />
                <View className="flex-1">
                    <Text className="text-xs font-semibold text-gray-900" numberOfLines={1}>
                        {item.creatorName}
                    </Text>
                    <Text className="text-[10px] text-gray-500">Nhà tuyển dụng</Text>
                </View>
                <View className={`${postTypeBadge.bg} px-2 py-0.5 rounded-full`}>
                    <Text className={`text-[10px] font-bold ${postTypeBadge.text}`}>
                        {postTypeBadge.label}
                    </Text>
                </View>
            </View>

            {/* Job Content */}
            <View className="p-3 gap-2">
                {/* Title */}
                <Text className="text-sm font-bold text-gray-900 leading-tight" numberOfLines={2}>
                    {item.title}
                </Text>

                {/* Brief Description */}
                {item.briefDescription && (
                    <Text className="text-xs text-gray-500" numberOfLines={2}>
                        {item.briefDescription}
                    </Text>
                )}

                {/* Genres */}
                {item.genres && item.genres.length > 0 && (
                    <View className="flex-row flex-wrap gap-1">
                        {item.genres.slice(0, 3).map((genre, idx) => (
                            <View
                                key={idx}
                                className="bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full"
                            >
                                <Text className="text-[9px] font-semibold text-purple-700">
                                    {genre}
                                </Text>
                            </View>
                        ))}
                        {item.genres.length > 3 && (
                            <View className="bg-gray-100 px-1.5 py-0.5 rounded-full">
                                <Text className="text-[9px] font-semibold text-gray-600">
                                    +{item.genres.length - 3}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Info Row */}
                <View className="flex-row items-center gap-3 mt-1">
                    <View className="flex-row items-center gap-1">
                        <MapPin size={11} color="#7C3BED" />
                        <Text className="text-[10px] text-gray-600 font-medium" numberOfLines={1}>
                            {item.location}
                        </Text>
                    </View>
                </View>

                {/* Bottom Row: Budget & Time */}
                <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-gray-100">
                    <View className="flex-row items-center gap-1">
                        <DollarSign size={12} color="#10B981" />
                        <Text className="text-xs font-bold text-emerald-600">
                            {formatBudget(item.budgetMin, item.budgetMax, item.budgetCurrency)}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <Briefcase size={10} color="#6B7280" />
                        <Text className="text-[10px] text-gray-500 font-medium">
                            {getRecruitmentLabel(item.recruitmentType)}
                        </Text>
                    </View>
                </View>

                {/* Work Time */}
                {item.workTime && (
                    <View className="flex-row items-center gap-1">
                        <Clock size={10} color="#7C3BED" />
                        <Text className="text-[10px] text-gray-500" numberOfLines={1}>
                            {item.workTime}
                        </Text>
                    </View>
                )}
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
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});
