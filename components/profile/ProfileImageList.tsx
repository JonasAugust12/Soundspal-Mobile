import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';

type ImageItem = { id: string; cover: any };

type Props = {
    title?: string;
    data?: ImageItem[];
    onPressSeeAll?: () => void;
};

export function ProfileImageList({ title = 'Ảnh', data = [], onPressSeeAll }: Props) {
    const items = React.useMemo(() => data.slice(0, 8), [data]);

    return (
        <View className="gap-3">
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <Text className="text-base font-bold text-foreground">{title}</Text>
                <Pressable onPress={onPressSeeAll}>
                    <Text className="text-sm text-primary">Xem tất cả</Text>
                </Pressable>
            </View>

            {/* Image Grid */}
            <View className="border border-border rounded-2xl p-2 bg-card shadow-lg">
                {items.length > 0 ? (
                    <View className="flex-row flex-wrap">
                        {items.map((item) => (
                            <View key={item.id} className="w-1/4 p-1">
                                <View className="aspect-square rounded-lg overflow-hidden">
                                    <Image
                                        source={item.cover}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="p-8 items-center">
                        <Text className="text-sm text-muted-foreground">Chưa có ảnh portfolio</Text>
                    </View>
                )}
            </View>
        </View>
    );
}
