import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RotateCcw, Save } from 'lucide-react-native';

const basicInfoSchema = z.object({
    display_name: z.string().min(1, 'Tên nghệ danh là bắt buộc'),
    brief_bio: z.string().optional(),
    detail_bio: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
    defaultValues?: Partial<BasicInfoFormData>;
    onSubmit: (data: BasicInfoFormData) => Promise<void>;
    isLoading?: boolean;
}

export function BasicInfoForm({ defaultValues, onSubmit, isLoading }: BasicInfoFormProps) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<BasicInfoFormData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            display_name: defaultValues?.display_name || '',
            brief_bio: defaultValues?.brief_bio || '',
            detail_bio: defaultValues?.detail_bio || '',
            city: defaultValues?.city || '',
            country: defaultValues?.country || '',
        },
    });

    const handleFormSubmit = async (data: BasicInfoFormData) => {
        try {
            await onSubmit(data);
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    return (
        <View className="gap-4">
            {/* Display Name */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Tên nghệ danh *</Text>
                <Controller
                    control={control}
                    name="display_name"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Nhập tên, nghệ danh"
                            value={value}
                            onChangeText={onChange}
                            className={`px-4 py-3 bg-secondary rounded-xl text-foreground ${errors.display_name ? 'border border-red-500' : ''}`}
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
                {errors.display_name && (
                    <Text className="text-xs text-red-500">{errors.display_name.message}</Text>
                )}
            </View>

            {/* Brief Bio */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Giới thiệu ngắn</Text>
                <Controller
                    control={control}
                    name="brief_bio"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Viết vài dòng giới thiệu ngắn gọn"
                            value={value}
                            onChangeText={onChange}
                            multiline
                            numberOfLines={3}
                            className="px-4 py-3 bg-secondary rounded-xl text-foreground min-h-[80px]"
                            placeholderTextColor="#71717a"
                            textAlignVertical="top"
                        />
                    )}
                />
            </View>

            {/* Detail Bio */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Giới thiệu chi tiết</Text>
                <Controller
                    control={control}
                    name="detail_bio"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Viết giới thiệu chi tiết về bản thân"
                            value={value}
                            onChangeText={onChange}
                            multiline
                            numberOfLines={5}
                            className="px-4 py-3 bg-secondary rounded-xl text-foreground min-h-[120px]"
                            placeholderTextColor="#71717a"
                            textAlignVertical="top"
                        />
                    )}
                />
            </View>

            {/* City */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Thành phố</Text>
                <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Thành phố của bạn"
                            value={value}
                            onChangeText={onChange}
                            className="px-4 py-3 bg-secondary rounded-xl text-foreground"
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
            </View>

            {/* Country */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Quốc gia</Text>
                <Controller
                    control={control}
                    name="country"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Quốc gia của bạn"
                            value={value}
                            onChangeText={onChange}
                            className="px-4 py-3 bg-secondary rounded-xl text-foreground"
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-2">
                <Pressable
                    onPress={() => reset(defaultValues)}
                    disabled={!isDirty}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-border ${!isDirty ? 'opacity-50' : ''}`}
                >
                    <RotateCcw size={18} color="#71717a" />
                    <Text className="text-foreground font-medium">Đặt lại</Text>
                </Pressable>
                <Pressable
                    onPress={handleSubmit(handleFormSubmit)}
                    disabled={isLoading || !isDirty}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-primary ${isLoading || !isDirty ? 'opacity-50' : ''}`}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Save size={18} color="#ffffff" />
                    )}
                    <Text className="text-white font-medium">{isLoading ? 'Đang lưu...' : 'Lưu'}</Text>
                </Pressable>
            </View>
        </View>
    );
}
