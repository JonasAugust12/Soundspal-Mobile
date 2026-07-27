import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Handshake } from 'lucide-react-native';
import { usePublicCollaborators } from '@/features/collabRequests/presentation/hooks/useCollabRequestApi';
import { colors } from '@/shared/domain/constants/colors';

interface Props {
    userId?: string;
}

export function PublicCollaboratorsSection({ userId }: Props) {
    const router = useRouter();
    const { data, isLoading } = usePublicCollaborators(userId || '', Boolean(userId));
    const collaborators = data?.collaborators ?? [];

    if (!userId) return null;

    if (isLoading) {
        return (
            <View className="gap-3">
                <View className="flex-row items-center gap-2">
                    <Handshake size={18} color={colors.primary01} />
                    <Text className="text-base font-bold text-gray-900">Đã hợp tác với</Text>
                </View>
                <View className="gap-2">
                    {[0, 1, 2].map((i) => (
                        <View
                            key={i}
                            className="h-14 rounded-xl bg-gray-200 animate-pulse border border-gray-100"
                        />
                    ))}
                </View>
            </View>
        );
    }

    if (collaborators.length === 0) return null;

    return (
        <View className="gap-3">
            <View className="flex-row items-center gap-2">
                <Handshake size={18} color={colors.primary01} />
                <Text className="text-base font-bold text-gray-900">Đã hợp tác với</Text>
            </View>
            <View className="gap-2">
                {collaborators.map((c) => {
                    const name = c.display_name || c.username;
                    return (
                        <TouchableOpacity
                            key={c.collaboration_id}
                            onPress={() =>
                                router.push({
                                    pathname: '/(profiles)/artistProfile',
                                    params: { username: c.username },
                                })
                            }
                            className="flex-row items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 active:bg-gray-50"
                        >
                            <Image
                                source={
                                    c.avatar_url
                                        ? { uri: c.avatar_url }
                                        : require('@/assets/images/user_profile.png')
                                }
                                className="w-9 h-9 rounded-full bg-gray-100"
                            />
                            <View className="flex-1 min-w-0">
                                <Text
                                    className="text-sm font-semibold text-gray-900"
                                    numberOfLines={1}
                                >
                                    {name}
                                </Text>
                                <Text className="text-xs text-gray-500" numberOfLines={1}>
                                    {c.title}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
