import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Mail, Phone, CheckCircle, XCircle } from 'lucide-react-native';
import type { OpportunitySubmission } from '@/features/collab/domain/entities/collaboration.type';
import { formatDate } from '@/features/jobs/domain/utils/jobFormatters';
import { CollabStatusBadge } from './CollabStatusBadge';

interface OpportunitySubmissionCardProps {
    item: OpportunitySubmission;
    onReview?: (id: string, action: 'accept' | 'reject' | 'skip', notes?: string) => void;
    isReviewing?: boolean;
}

export const OpportunitySubmissionCard = ({
    item,
    onReview,
    isReviewing = false,
}: OpportunitySubmissionCardProps) => {
    const handleAccept = () => {
        Alert.alert(
            'Xác nhận chấp nhận',
            `Bạn chắc chắn muốn chấp nhận ứng tuyển từ ${item.full_name}?`,
            [
                { text: 'Hủy', onPress: () => {} },
                {
                    text: 'Chấp nhận',
                    onPress: () => onReview?.(item.id, 'accept'),
                    style: 'default',
                },
            ],
        );
    };

    const handleReject = () => {
        Alert.prompt(
            'Lý do từ chối',
            'Vui lòng nhập lý do từ chối (tùy chọn)',
            [
                { text: 'Hủy', onPress: () => {} },
                {
                    text: 'Từ chối',
                    onPress: (reason?: string) => onReview?.(item.id, 'reject', reason),
                    style: 'destructive',
                },
            ],
            'plain-text',
            '',
        );
    };

    return (
        <ScrollView className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
            {/* Header: Name + Status */}
            <View className="flex-row gap-3 items-start justify-between mb-3">
                <View className="flex-1 gap-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                        {item.full_name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Gửi: {formatDate(item.created_at)}
                    </Text>
                </View>
                <CollabStatusBadge status={item.status} size="sm" />
            </View>

            {/* Contact Info */}
            <View className="gap-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                <View className="flex-row items-center gap-2">
                    <Mail size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 dark:text-gray-400">{item.email}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Phone size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                        {item.phone_number}
                    </Text>
                </View>
            </View>

            {/* Cover Letter */}
            {item.cover_letter && (
                <View className="gap-1 mb-3">
                    <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Thư giới thiệu:
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5">
                        {item.cover_letter}
                    </Text>
                </View>
            )}

            {/* Portfolio Links */}
            {item.portfolio_links && item.portfolio_links.length > 0 && (
                <View className="gap-1 mb-3">
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
                <View className="gap-1 mb-3">
                    <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        File demo:
                    </Text>
                    <Text className="text-xs text-blue-600 dark:text-blue-400" numberOfLines={1}>
                        {item.demo_file}
                    </Text>
                </View>
            )}

            {/* Review Notes */}
            {item.review_notes && (
                <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg mb-3">
                    <Text className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                        Ghi chú từ reviewer:
                    </Text>
                    <Text className="text-xs text-blue-600 dark:text-blue-400">
                        {item.review_notes}
                    </Text>
                </View>
            )}

            {/* Action Buttons */}
            {item.can_be_reviewed && item.status === 'pending_review' && (
                <View className="flex-row gap-2 mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <TouchableOpacity
                        onPress={handleAccept}
                        disabled={isReviewing}
                        className="flex-1 bg-green-600 py-2.5 rounded-lg items-center justify-center flex-row gap-1.5"
                    >
                        {isReviewing ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <CheckCircle size={16} color="white" />
                                <Text className="text-white font-semibold text-sm">Chấp nhận</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleReject}
                        disabled={isReviewing}
                        className="flex-1 bg-red-600 py-2.5 rounded-lg items-center justify-center flex-row gap-1.5"
                    >
                        {isReviewing ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <XCircle size={16} color="white" />
                                <Text className="text-white font-semibold text-sm">Từ chối</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Status Info */}
            {!item.can_be_reviewed && item.is_reviewed && (
                <View className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-3">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                        Đã xem xét: {formatDate(item.reviewed_at)}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};
