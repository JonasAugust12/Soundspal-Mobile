import React from 'react';
import { View, Text, TouchableOpacity, Image, Pressable, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Bookmark,
    Briefcase,
    Calendar,
    DollarSign,
    MapPin,
    Crown
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Job } from '@/types/job.type';
import { formatBudget, formatDate } from '@/utils/jobFormatters';
import { Info } from './Info';

interface JobCardFullProps {
    job: Job;
    isOwned?: boolean;
    onEdit?: () => void;
}

export const JobCardFull = ({ job, isOwned, onEdit }: JobCardFullProps) => {
    const router = useRouter();

    const imgUri = job.assets?.[0]?.thumbnail_url || job.assets?.[0]?.storage_url;
    const formattedBudget = formatBudget(job.budget_min, job.budget_max, job.budget_currency);
    const datePosted = formatDate(job.created_at);

    const handleViewDetails = () => {
        router.push(`/(jobs)/detail?id=${job.id}` as any);
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else {
            router.push(`/(jobs)/recruitment-form?id=${job.id}` as any);
        }
    };

    return (
        <View className="w-full px-4">
            <View
                className="gap-4 p-4 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                style={styles.card}
            >
                {/* Top section with image and title */}
                <View className="flex-row gap-3 items-start">
                    <View style={styles.imageContainer}>
                        {imgUri ? (
                            <Image
                                source={{ uri: imgUri }}
                                className="w-full h-full rounded-2xl"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 items-center justify-center">
                                <Briefcase size={36} color="#7C3BED" />
                            </View>
                        )}
                    </View>

                    <View className="flex-1 gap-2">
                        <View className="flex-row justify-between items-start">
                            <Text className="text-lg font-black text-gray-900 dark:text-white flex-1 pr-2" numberOfLines={2}>
                                {job.title}
                            </Text>
                            <Pressable className="p-2 -mt-2 -mr-2">
                                <Bookmark size={22} color="#7C3BED" />
                            </Pressable>
                        </View>

                        <View className="flex-row items-center gap-2 flex-wrap">
                            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {job.type}
                            </Text>
                            {isOwned && (
                                <View className="flex-row items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                    <Crown size={12} color="#F59E0B" />
                                    <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                        Của tôi
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Tags */}
                {job.genres && job.genres.length > 0 && (
                    <View className="flex-row flex-wrap gap-2">
                        {job.genres.slice(0, 4).map((tag, index) => (
                            <View key={index} className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
                                <Text className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                    {tag}
                                </Text>
                            </View>
                        ))}
                        {job.genres.length > 4 && (
                            <View className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                                <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                    +{job.genres.length - 4}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Info grid */}
                <View className="flex-row flex-wrap gap-3">
                    <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-xl flex-1 min-w-[45%]">
                        <Briefcase size={16} color="#7C3BED" />
                        <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1" numberOfLines={1}>
                            {job.recruitment_type}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-xl flex-1 min-w-[45%]">
                        <DollarSign size={16} color="#10B981" />
                        <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1" numberOfLines={1}>
                            {formattedBudget}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-xl flex-1 min-w-[45%]">
                        <MapPin size={16} color="#EF4444" />
                        <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1" numberOfLines={1}>
                            {job.location || 'N/A'}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-xl flex-1 min-w-[45%]">
                        <Calendar size={16} color="#3B82F6" />
                        <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1" numberOfLines={1}>
                            {datePosted}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-2">
                    {isOwned ? (
                        <TouchableOpacity
                            onPress={handleEdit}
                            activeOpacity={0.8}
                            className="flex-1"
                            style={styles.primaryButton}
                        >
                            <LinearGradient
                                colors={['#7C3BED', '#F471B7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                <Text className="text-white font-bold text-sm">
                                    Chỉnh sửa
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => {/* Apply modal will be added in Phase 4 */ }}
                            activeOpacity={0.8}
                            className="flex-1"
                            style={styles.primaryButton}
                        >
                            <LinearGradient
                                colors={['#7C3BED', '#F471B7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                <Text className="text-white font-bold text-sm">
                                    Ứng tuyển ngay
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={handleViewDetails}
                        activeOpacity={0.8}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 py-3.5 rounded-xl items-center justify-center"
                        style={styles.secondaryButton}
                    >
                        <Text className="text-gray-900 dark:text-white font-bold text-sm">
                            Chi tiết
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    imageContainer: {
        width: 80,
        height: 80,
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    primaryButton: {
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    secondaryButton: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    gradientButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
