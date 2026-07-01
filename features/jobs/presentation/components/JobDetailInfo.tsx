import React from 'react';
import { View, Text } from 'react-native';
import { Briefcase, Calendar, DollarSign, MapPin, Clock } from 'lucide-react-native';
import { formatBudget } from '@/features/jobs/domain/utils/jobFormatters';

interface JobDetailInfoProps {
    recruitmentType: string;
    budgetMin: number;
    budgetMax: number;
    budgetCurrency: string;
    location: string;
    deadline?: string;
    workTime?: string;
    isNegotiable?: boolean;
}

export const JobDetailInfo = ({
    recruitmentType,
    budgetMin,
    budgetMax,
    budgetCurrency,
    location,
    deadline,
    workTime,
    isNegotiable,
}: JobDetailInfoProps) => {
    const formattedBudget = formatBudget(budgetMin, budgetMax, budgetCurrency);

    return (
        <View className="gap-4 px-1">
            <Text className="text-xl font-black text-gray-900 dark:text-white">
                Chi tiết công việc
            </Text>

            <View className="flex-row flex-wrap gap-3">
                {/* Recruitment Type */}
                <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[45%]">
                    <View className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center mb-3">
                        <Briefcase size={20} color="#7C3BED" />
                    </View>
                    <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">
                        Hình thức
                    </Text>
                    <Text className="text-sm font-black text-gray-900 dark:text-white">
                        {recruitmentType}
                    </Text>
                </View>

                {/* Budget */}
                <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[45%]">
                    <View className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/30 items-center justify-center mb-3">
                        <DollarSign size={20} color="#10B981" />
                    </View>
                    <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">
                        Ngân sách {isNegotiable && '✨'}
                    </Text>
                    <Text className="text-sm font-black text-gray-900 dark:text-white">
                        {formattedBudget}
                    </Text>
                </View>

                {/* Location */}
                <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[45%]">
                    <View className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 items-center justify-center mb-3">
                        <MapPin size={20} color="#EF4444" />
                    </View>
                    <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">
                        Địa điểm
                    </Text>
                    <Text className="text-sm font-black text-gray-900 dark:text-white">
                        {location || 'Toàn quốc'}
                    </Text>
                </View>

                {/* Deadline */}
                {deadline && (
                    <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[45%]">
                        <View className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-3">
                            <Calendar size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">
                            Hạn nộp
                        </Text>
                        <Text className="text-sm font-black text-gray-900 dark:text-white">
                            {deadline}
                        </Text>
                    </View>
                )}

                {/* Work Time */}
                {workTime && (
                    <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[45%]">
                        <View className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 items-center justify-center mb-3">
                            <Clock size={20} color="#F59E0B" />
                        </View>
                        <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">
                            Thời gian
                        </Text>
                        <Text className="text-sm font-black text-gray-900 dark:text-white">
                            {workTime}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};
