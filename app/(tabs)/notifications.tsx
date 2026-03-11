import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Platform,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import { ChatItem } from '@/components/common';
import { useMessagingStore } from '@/stores/messagingStore';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/services/socketService';
import { apiClient } from '@/lib/apiClient';
import type { Conversation } from '@/types/messaging.type';

export default function MessagesScreen() {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const currentUserId = currentUser?.id;

    const [activeTab, setActiveTab] = React.useState<'all' | 'unread'>('all');
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');

    // Read from store
    const {
        conversationOrder,
        unreadCounts,
        isLoadingConversations,
        setConversations,
        setLoadingConversations,
        getSortedConversations,
    } = useMessagingStore();

    // Fetch conversations on mount
    useEffect(() => {
        const fetchConversations = async () => {
            setLoadingConversations(true);
            try {
                const response = await apiClient.get<Conversation[]>('/conversations');
                setConversations(response.data);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            } finally {
                setLoadingConversations(false);
            }
        };

        fetchConversations();
    }, [setConversations, setLoadingConversations]);

    // Ensure socket is connected
    useEffect(() => {
        if (!socketService.isConnected()) {
            socketService.connect();
        }
    }, []);

    const handleConversationPress = (conversationId: string) => {
        router.push({
            pathname: '/(messages)/detailMessage',
            params: { conversationId },
        });
    };

    const getOtherParticipant = (conversation: Conversation) => {
        if (conversation.isGroup) {
            return {
                id: undefined,
                name: conversation.name || 'Group Chat',
                avatarUrl: null,
            };
        }
        const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId);
        return {
            id: otherParticipant?.id,
            name: otherParticipant?.displayName || 'Unknown User',
            avatarUrl: otherParticipant?.avatarUrl,
        };
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (minutes < 1) return 'Vừa xong';
        if (hours < 1) return `${minutes} phút`;
        if (hours < 24) return `${hours} giờ`;
        return `${Math.floor(hours / 24)} ngày`;
    };

    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    const sortedConversations = getSortedConversations().filter((conv) => {
        // Tab filter
        const isUnreadTab = activeTab === 'all' || (unreadCounts[conv.id] || 0) > 0;
        if (!isUnreadTab) return false;

        // Search filter
        if (isSearching && searchText.trim()) {
            const participant = getOtherParticipant(conv);
            return participant.name.toLowerCase().includes(searchText.toLowerCase());
        }

        return true;
    });

    if (isLoadingConversations && conversationOrder.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center mb-4">
                        <ActivityIndicator size="large" color="#7C3BED" />
                    </View>
                    <Text className="text-gray-600 font-medium">Đang tải tin nhắn...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                {/* Modern Header */}
                <View className="px-5 pt-2 pb-4">
                    {isSearching ? (
                        <View className="flex-row items-center gap-3 mb-4">
                            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                                <Search size={18} color="#9CA3AF" />
                                <TextInput
                                    autoFocus
                                    placeholder="Tìm người trò chuyện.."
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    className="flex-1 ml-2 text-base text-gray-900"
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchText('')}>
                                        <Text className="text-gray-400 text-xs font-bold">Xóa</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsSearching(false);
                                    setSearchText('');
                                }}
                            >
                                <Text className="text-purple-600 font-bold">Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="flex-row items-center justify-between mb-4">
                            <View>
                                <Text className="text-2xl font-black text-gray-900">Tin nhắn</Text>
                                {totalUnread > 0 && (
                                    <Text className="text-sm text-gray-500 mt-1">
                                        {totalUnread} tin chưa đọc
                                    </Text>
                                )}
                            </View>
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => setIsSearching(true)}
                                    className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                                >
                                    <Search size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Quick Actions */}
                    {getSortedConversations().length > 0 && (
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setActiveTab('all')}
                                className={`flex-row items-center px-4 py-2 rounded-full ${
                                    activeTab === 'all' ? 'bg-purple-100' : 'bg-gray-50'
                                }`}
                            >
                                <View
                                    className={`w-2 h-2 rounded-full mr-2 ${activeTab === 'all' ? 'bg-purple-500' : 'bg-gray-400'}`}
                                />
                                <Text
                                    className={`font-semibold text-sm ${activeTab === 'all' ? 'text-purple-600' : 'text-gray-600'}`}
                                >
                                    Tất cả
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab('unread')}
                                className={`flex-row items-center px-4 py-2 rounded-full ${
                                    activeTab === 'unread' ? 'bg-purple-100' : 'bg-gray-50'
                                }`}
                            >
                                <Text
                                    className={`font-medium text-sm ${activeTab === 'unread' ? 'text-purple-600' : 'text-gray-600'}`}
                                >
                                    Chưa đọc
                                </Text>
                                {totalUnread > 0 && (
                                    <View className="bg-red-500 rounded-full px-1.5 py-0.5 ml-2 min-w-[20px] items-center">
                                        <Text className="text-white text-[10px] font-bold">
                                            {totalUnread}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Conversation List */}
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {sortedConversations.length > 0 ? (
                        <View className="px-4">
                            {/* Online section header */}
                            <View className="flex-row items-center gap-2 mb-3 px-1">
                                <View className="w-2 h-2 rounded-full bg-green-500" />
                                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Hội thoại
                                </Text>
                            </View>

                            <View className="gap-2">
                                {sortedConversations.map((conversation) => {
                                    const participant = getOtherParticipant(conversation);
                                    const unreadCount = unreadCounts[conversation.id] || 0;

                                    return (
                                        <View
                                            key={conversation.id}
                                            style={
                                                unreadCount > 0 ? styles.unreadCard : styles.card
                                            }
                                            className={`rounded-2xl overflow-hidden ${unreadCount > 0 ? 'bg-purple-50' : 'bg-gray-50'}`}
                                        >
                                            <ChatItem
                                                name={participant.name}
                                                preview={
                                                    conversation.lastMessage?.content ||
                                                    'Chưa có tin nhắn'
                                                }
                                                avatarSource={
                                                    participant.avatarUrl
                                                        ? { uri: participant.avatarUrl }
                                                        : require('@/assets/images/user-default.jpg')
                                                }
                                                time={
                                                    conversation.lastMessage
                                                        ? formatTime(
                                                              conversation.lastMessage.createdAt,
                                                          )
                                                        : undefined
                                                }
                                                unread={unreadCount > 0}
                                                unreadCount={unreadCount}
                                                userId={participant.id}
                                                onPress={() =>
                                                    handleConversationPress(conversation.id)
                                                }
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        <View className="items-center justify-center px-8 py-20">
                            {/* Empty State */}
                            <View className="w-24 h-24 rounded-full bg-purple-50 dark:bg-gray-800 items-center justify-center mb-6">
                                <MessageCircle size={48} color="#7C3BED" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
                                {isSearching && searchText.trim()
                                    ? 'Không tìm thấy kết quả'
                                    : activeTab === 'unread'
                                      ? 'Không có tin nhắn chưa đọc'
                                      : 'Chưa có tin nhắn'}
                            </Text>
                            <Text className="text-base text-gray-500 dark:text-gray-400 text-center max-w-[280px] leading-relaxed">
                                {isSearching && searchText.trim()
                                    ? `Không tìm thấy ai tên "${searchText}"`
                                    : activeTab === 'unread'
                                      ? 'Cảm ơn bạn đã cập nhật nhanh chóng với các đối tác!'
                                      : 'Bắt đầu trò chuyện với nghệ sĩ và nhà tổ chức để tạo kết nối mới'}
                            </Text>
                            {activeTab === 'all' && !isSearching && (
                                <TouchableOpacity
                                    className="mt-6 bg-purple-600 px-6 py-3 rounded-full"
                                    onPress={() => router.push('/(tabs)/explore')}
                                >
                                    <Text className="text-white font-bold">Khám phá nghệ sĩ</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    iconButton: {
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
    card: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    unreadCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
});
