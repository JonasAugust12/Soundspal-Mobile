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
        <View className="gap-6">
            {/* Display Name */}
            <View className="gap-2">
                <Text className="text-sm font-bold text-foreground">Tên nghệ danh *</Text>
                <Controller
                    control={control}
                    name="display_name"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Nhập tên, nghệ danh"
                            value={value}
                            onChangeText={onChange}
                            className={`px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base ${errors.display_name ? 'border border-red-500' : 'border border-transparent focus:border-primary'
                                }`}
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
                {errors.display_name && (
                    <Text className="text-xs font-medium text-red-500 ml-1">{errors.display_name.message}</Text>
                )}
            </View>

            {/* Brief Bio */}
            <View className="gap-2">
                <Text className="text-sm font-bold text-foreground">Giới thiệu ngắn</Text>
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
                            className="px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base min-h-[100px] border border-transparent focus:border-primary"
                            placeholderTextColor="#71717a"
                            textAlignVertical="top"
                        />
                    )}
                />
            </View>

            {/* Detail Bio */}
            <View className="gap-2">
                <Text className="text-sm font-bold text-foreground">Giới thiệu chi tiết</Text>
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
                            className="px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base min-h-[160px] border border-transparent focus:border-primary"
                            placeholderTextColor="#71717a"
                            textAlignVertical="top"
                        />
                    )}
                />
            </View>

            <View className="flex-row gap-4">
                {/* City */}
                <View className="flex-1 gap-2">
                    <Text className="text-sm font-bold text-foreground">Thành phố</Text>
                    <Controller
                        control={control}
                        name="city"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                placeholder="Thành phố"
                                value={value}
                                onChangeText={onChange}
                                className="px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base border border-transparent focus:border-primary"
                                placeholderTextColor="#71717a"
                            />
                        )}
                    />
                </View>

                {/* Country */}
                <View className="flex-1 gap-2">
                    <Text className="text-sm font-bold text-foreground">Quốc gia</Text>
                    <Controller
                        control={control}
                        name="country"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                placeholder="Quốc gia"
                                value={value}
                                onChangeText={onChange}
                                className="px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base border border-transparent focus:border-primary"
                                placeholderTextColor="#71717a"
                            />
                        )}
                    />
                </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
                <Pressable
                    onPress={() => reset(defaultValues)}
                    disabled={!isDirty}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl border border-border bg-white dark:bg-gray-900 ${!isDirty ? 'opacity-50' : 'active:bg-gray-50 dark:active:bg-gray-800'}`}
                >
                    <RotateCcw size={18} color="#71717a" />
                    <Text className="text-foreground font-bold">Đặt lại</Text>
                </Pressable>
                <Pressable
                    onPress={handleSubmit(handleFormSubmit)}
                    disabled={isLoading || !isDirty}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl bg-purple-600 ${isLoading || !isDirty ? 'opacity-50' : 'active:bg-purple-700'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Save size={18} color="#ffffff" />
                    )}
                    <Text className="text-white font-bold">{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
                </Pressable>
            </View>
        </View>
    );
}
