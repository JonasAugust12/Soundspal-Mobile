import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Handshake } from 'lucide-react-native';
import { usePublicCollaborators } from '@/features/collabRequests/presentation/hooks/useCollabRequestApi';
import { InitialsAvatar } from '@/shared/presentation/ui/InitialsAvatar';
import { colors } from '@/shared/domain/constants/colors';

interface Props {
    userId?: string;
}

const AVATAR_SIZE = 44;
const OVERLAP = 12;

export function PublicCollaboratorsSection({ userId }: Props) {
    const router = useRouter();
    const { data, isLoading } = usePublicCollaborators(userId || '', Boolean(userId));
    const collaborators = data?.collaborators ?? [];
    const [activeName, setActiveName] = useState<string | null>(null);

    if (!userId) return null;

    if (isLoading) {
        return (
            <View className="gap-3">
                <SectionHeader />
                <View className="flex-row items-center pl-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <View
                            key={i}
                            className="h-11 w-11 rounded-full bg-gray-200 border-2 border-white animate-pulse"
                            style={{ marginLeft: i === 0 ? 0 : -OVERLAP, zIndex: 5 - i }}
                        />
                    ))}
                </View>
            </View>
        );
    }

    if (collaborators.length === 0) return null;

    return (
        <View className="gap-2">
            <SectionHeader />

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingLeft: 4,
                    paddingRight: 12,
                    paddingTop: 6,
                    paddingBottom: 4,
                }}
            >
                <View className="flex-row items-center">
                    {collaborators.map((c, index) => {
                        const name = c.display_name || c.username;
                        const isActive = activeName === name;

                        return (
                            <Pressable
                                key={c.collaboration_id}
                                accessibilityLabel={name}
                                accessibilityRole="button"
                                onPressIn={() => setActiveName(name)}
                                onPressOut={() => setActiveName(null)}
                                onPress={() =>
                                    router.push({
                                        pathname: '/(profiles)/artistProfile',
                                        params: { username: c.username },
                                    })
                                }
                                style={{
                                    marginLeft: index === 0 ? 0 : -OVERLAP,
                                    zIndex: isActive ? 100 : collaborators.length - index,
                                    transform: [{ scale: isActive ? 1.08 : 1 }],
                                }}
                            >
                                <View
                                    className="rounded-full border-2 border-white bg-white overflow-hidden"
                                    style={{
                                        width: AVATAR_SIZE,
                                        height: AVATAR_SIZE,
                                        shadowColor: '#000',
                                        shadowOpacity: 0.08,
                                        shadowRadius: 3,
                                        shadowOffset: { width: 0, height: 1 },
                                        elevation: 2,
                                    }}
                                >
                                    {c.avatar_url ? (
                                        <Image
                                            source={{ uri: c.avatar_url }}
                                            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                                        />
                                    ) : (
                                        <InitialsAvatar name={name} size={AVATAR_SIZE} />
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            {activeName ? (
                <View className="items-center">
                    <View className="rounded-full bg-gray-900/90 px-3 py-1">
                        <Text className="text-xs font-semibold text-white" numberOfLines={1}>
                            {activeName}
                        </Text>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

function SectionHeader() {
    return (
        <View className="flex-row items-center gap-2">
            <Handshake size={18} color={colors.primary01} />
            <Text className="text-base font-bold text-gray-900">Đã hợp tác với</Text>
        </View>
    );
}
