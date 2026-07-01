import React from 'react';
import {
    View,
    Text,
    Image,
    Pressable,
    useWindowDimensions,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type ChatMessage = {
    id: string;
    text: string;
    time?: string;
    side: string;
    avatarSource?: ImageSourcePropType;
    attachmentUrl?: string | null;
    isEdited?: boolean;
    isDeleted?: boolean;
    onLongPress?: () => void;
};

type MessageBubbleProps = ChatMessage;

export function MessageBubble({
    text,
    time,
    side,
    avatarSource,
    attachmentUrl,
    isEdited,
    isDeleted,
    onLongPress,
}: MessageBubbleProps) {
    const { width: screenWidth } = useWindowDimensions();

    const isLeft = side === 'left';
    const displayText = isDeleted ? 'Tin nhắn đã bị xóa' : text;
    const maxBubbleWidth = screenWidth * 0.85 - 32 - (isLeft ? 36 : 0);

    return (
        <View className={`gap-1.5 ${isLeft ? 'items-start' : 'items-end'}`}>
            <View className={`flex-row gap-2 ${isLeft ? 'self-start' : 'self-end'}`}>
                {isLeft && avatarSource && (
                    <Image
                        source={avatarSource}
                        className="w-7 h-7 rounded-full"
                        resizeMode="cover"
                    />
                )}

                <Pressable onLongPress={onLongPress} delayLongPress={500}>
                    {isLeft ? (
                        <View
                            style={{ maxWidth: maxBubbleWidth }}
                            className={`py-2.5 px-3 rounded-2xl border border-primary bg-background gap-2 ${isDeleted ? 'opacity-60' : ''}`}
                        >
                            {attachmentUrl && !isDeleted && (
                                <Image
                                    source={{ uri: attachmentUrl }}
                                    className="w-55 h-40 rounded-xl"
                                    resizeMode="cover"
                                />
                            )}
                            {displayText ? (
                                <Text
                                    className={`${isDeleted ? 'text-muted-foreground italic' : 'text-foreground'} text-base leading-5`}
                                >
                                    {displayText}
                                </Text>
                            ) : null}
                        </View>
                    ) : (
                        <LinearGradient
                            colors={isDeleted ? ['#9ca3af', '#6b7280'] : ['#7C3BED', '#F471B7']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{
                                maxWidth: maxBubbleWidth,
                                borderRadius: 16,
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                opacity: isDeleted ? 0.6 : 1,
                            }}
                        >
                            <View className="gap-2">
                                {attachmentUrl && !isDeleted && (
                                    <Image
                                        source={{ uri: attachmentUrl }}
                                        className="w-55 h-40 rounded-xl"
                                        resizeMode="cover"
                                    />
                                )}
                                {displayText ? (
                                    <Text
                                        className={`text-white text-base leading-5 ${isDeleted ? 'italic' : ''}`}
                                    >
                                        {displayText}
                                    </Text>
                                ) : null}
                            </View>
                        </LinearGradient>
                    )}
                </Pressable>
            </View>

            {/* Time + Edited indicator */}
            {(time || (isEdited && !isDeleted)) && (
                <View className="flex-row gap-2 items-center opacity-70 -mt-1">
                    {time && <Text className="text-muted-foreground text-xs">{time}</Text>}
                    {isEdited && !isDeleted && (
                        <Text className="text-muted-foreground text-xs italic">Đã chỉnh sửa</Text>
                    )}
                </View>
            )}
        </View>
    );
}
