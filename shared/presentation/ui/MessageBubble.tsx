import React from 'react';
import {
    View,
    Text,
    Image,
    Pressable,
    Linking,
    useWindowDimensions,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, MapPin, DollarSign, Clock, FileText, Play, Music } from 'lucide-react-native';
import {
    parseJobReference,
    getJobTypeLabel,
    type JobRefData,
    type MessageAttachmentType,
} from '@/features/messaging/domain/utils/messageContent';

export type ChatMessage = {
    id: string;
    text: string;
    time?: string;
    side: string;
    avatarSource?: ImageSourcePropType;
    attachmentUrl?: string | null;
    attachmentType?: MessageAttachmentType | null;
    isEdited?: boolean;
    isDeleted?: boolean;
    onLongPress?: () => void;
};

type MessageBubbleProps = ChatMessage;

// ── Job reference card (mirrors web MessageThread job card widget) ────────────
function JobRefCard({ data }: { data: JobRefData }) {
    const chips: { icon: typeof MapPin; text: string }[] = [];
    if (data.location) chips.push({ icon: MapPin, text: String(data.location) });
    if (data.budget !== undefined && data.budget !== null && data.budget !== '')
        chips.push({ icon: DollarSign, text: String(data.budget) });
    if (data.type) chips.push({ icon: Clock, text: getJobTypeLabel(data.type) });

    return (
        <View
            className="rounded-2xl border border-primary/30 bg-background p-3 gap-2"
            style={{ maxWidth: 300 }}
        >
            <View className="flex-row items-center gap-1.5">
                <Briefcase size={12} color="#7C3BED" />
                <Text className="text-[11px] font-bold text-primary uppercase tracking-wide">
                    Đơn ứng tuyển
                </Text>
            </View>

            {!!data.title && (
                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                    {data.title}
                </Text>
            )}
            {!!data.companyName && (
                <Text className="text-sm text-muted-foreground">{data.companyName}</Text>
            )}
            {!!data.description && (
                <Text className="text-sm text-foreground/80 italic" numberOfLines={2}>
                    “{data.description}”
                </Text>
            )}

            {chips.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5">
                    {chips.map((chip, idx) => {
                        const Icon = chip.icon;
                        return (
                            <View
                                key={idx}
                                className="flex-row items-center gap-1 bg-secondary px-2 py-1 rounded-md"
                            >
                                <Icon size={11} color="#6b7280" />
                                <Text className="text-[11px] text-muted-foreground font-medium">
                                    {chip.text}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

// ── Non-image attachment chip (video / audio / file) ──────────────────────────
function AttachmentChip({
    url,
    type,
    isRight,
}: {
    url: string;
    type: MessageAttachmentType;
    isRight: boolean;
}) {
    const Icon = type === 'video' ? Play : type === 'audio' ? Music : FileText;
    const label = type === 'video' ? 'Video' : type === 'audio' ? 'Âm thanh' : 'Tệp đính kèm';
    const filename = url.split('/').pop();

    return (
        <Pressable
            onPress={() => Linking.openURL(url)}
            className={`flex-row items-center gap-2 rounded-xl px-3 py-2 ${
                isRight ? 'bg-white/20' : 'bg-secondary'
            }`}
        >
            <Icon size={18} color={isRight ? '#ffffff' : '#7C3BED'} />
            <View className="max-w-[180px]">
                <Text
                    className={`text-sm font-medium ${isRight ? 'text-white' : 'text-foreground'}`}
                >
                    {label}
                </Text>
                {!!filename && (
                    <Text
                        className={`text-[11px] ${isRight ? 'text-white/70' : 'text-muted-foreground'}`}
                        numberOfLines={1}
                    >
                        {filename}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

function Attachment({
    url,
    type,
    isRight,
}: {
    url: string;
    type: MessageAttachmentType | null | undefined;
    isRight: boolean;
}) {
    if (type === 'image' || !type) {
        return <Image source={{ uri: url }} className="w-55 h-40 rounded-xl" resizeMode="cover" />;
    }
    return <AttachmentChip url={url} type={type} isRight={isRight} />;
}

export function MessageBubble({
    text,
    time,
    side,
    avatarSource,
    attachmentUrl,
    attachmentType,
    isEdited,
    isDeleted,
    onLongPress,
}: MessageBubbleProps) {
    const { width: screenWidth } = useWindowDimensions();

    const isLeft = side === 'left';
    const jobRef = !isDeleted ? parseJobReference(text) : null;
    const displayText = isDeleted ? 'Tin nhắn đã bị xóa' : jobRef ? jobRef.userText : text;
    const hasAttachment = !!attachmentUrl && !isDeleted;
    const hasBubble = !!displayText || hasAttachment;
    const maxBubbleWidth = screenWidth * 0.85 - 32 - (isLeft ? 36 : 0);

    const messageBody = hasBubble ? (
        isLeft ? (
            <View
                style={{ maxWidth: maxBubbleWidth }}
                className={`py-2.5 px-3 rounded-2xl border border-primary bg-background gap-2 ${isDeleted ? 'opacity-60' : ''}`}
            >
                {hasAttachment && (
                    <Attachment url={attachmentUrl!} type={attachmentType} isRight={false} />
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
                    {hasAttachment && (
                        <Attachment url={attachmentUrl!} type={attachmentType} isRight={true} />
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
        )
    ) : null;

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
                    <View className={`gap-1.5 ${isLeft ? 'items-start' : 'items-end'}`}>
                        {jobRef && <JobRefCard data={jobRef.jobData} />}
                        {messageBody}
                    </View>
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
