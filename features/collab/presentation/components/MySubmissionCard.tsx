import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, FileText, Trash2 } from 'lucide-react-native';
import type { MySubmission } from '@/features/collab/domain/entities/collaboration.type';
import { formatDate } from '@/features/jobs/domain/utils/jobFormatters';
import { CollabStatusBadge } from './CollabStatusBadge';

interface MySubmissionCardProps {
    item: MySubmission;
    onWithdraw: (id: string, reason: string) => void;
    onViewDetail?: (jobId: string) => void;
}

export const MySubmissionCard = ({ item, onWithdraw, onViewDetail }: MySubmissionCardProps) => {
    return (
        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 gap-3">
            {/* Header: Title + Status */}
            <View className="flex-row gap-3 items-start justify-between">
                <View className="flex-1 gap-1">
                    <Text
                        className="text-base font-bold text-gray-900 dark:text-white"
                        numberOfLines={2}
                    >
                        {item.job.title}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {item.job.post_type}
                    </Text>
                </View>
                <CollabStatusBadge status={item.status} size="sm" />
            </View>

            {/* Details */}
            <View className="gap-2">
                <View className="flex-row items-center gap-2">
                    <FileText size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Loại: {item.job.post_type}
                    </Text>
                </View>

                <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Ngày gửi: {formatDate(item.created_at)}
                    </Text>
                </View>

                {item.job.submission_deadline && (
                    <View className="flex-row items-center gap-2">
                        <Calendar size={14} color="#6B7280" />
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                            Hạn nộp: {formatDate(item.job.submission_deadline)}
                        </Text>
                    </View>
                )}

                {/* Cover letter preview */}
                {item.cover_letter && (
                    <View className="gap-1">
                        <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Thư giới thiệu:
                        </Text>
                        <Text
                            className="text-sm text-gray-600 dark:text-gray-400"
                            numberOfLines={3}
                        >
                            {item.cover_letter}
                        </Text>
                    </View>
                )}

                {/* Rejection reason */}
                {item.rejection_reason && (
                    <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 rounded-lg">
                        <Text className="text-xs font-semibold text-red-700 dark:text-red-300">
                            Lý do từ chối: {item.rejection_reason}
                        </Text>
                    </View>
                )}

                {/* Portfolio Links */}
                {item.portfolio_links && item.portfolio_links.length > 0 && (
                    <View className="gap-1">
                        <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Portfolio:
                        </Text>
                        {item.portfolio_links.map((link, idx) => (
                            <Text
                                key={idx}
                                className="text-xs text-blue-600 dark:text-blue-400"
                                numberOfLines={1}
                            >
                                {link}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Demo File */}
                {item.demo_file && (
                    <View className="gap-1">
                        <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            File demo:
                        </Text>
                        <Text
                            className="text-xs text-blue-600 dark:text-blue-400"
                            numberOfLines={1}
                        >
                            {item.demo_file}
                        </Text>
                    </View>
                )}
            </View>

            {/* Actions */}
            <View className="flex-row gap-2 pt-2">
                <TouchableOpacity
                    onPress={() => onViewDetail?.(item.job.id)}
                    className="flex-1 bg-purple-600 py-2.5 rounded-lg items-center"
                >
                    <Text className="text-white font-semibold text-sm">Xem chi tiết</Text>
                </TouchableOpacity>

                {item.can_withdraw && item.status === 'pending_review' && (
                    <TouchableOpacity
                        onPress={() => onWithdraw(item.id, 'Tôi muốn rút đơn')}
                        className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg items-center justify-center"
                    >
                        <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
