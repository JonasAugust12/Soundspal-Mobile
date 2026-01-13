import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RotateCcw, Save, Link, Camera, Video } from 'lucide-react-native';

const socialLinksSchema = z.object({
    facebook_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
    instagram_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
    youtube_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

export type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

interface SocialLinksFormProps {
    defaultValues?: Partial<SocialLinksFormData>;
    onSubmit: (data: SocialLinksFormData) => Promise<void>;
    isLoading?: boolean;
}

export function SocialLinksForm({ defaultValues, onSubmit, isLoading }: SocialLinksFormProps) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<SocialLinksFormData>({
        resolver: zodResolver(socialLinksSchema),
        defaultValues: {
            facebook_url: defaultValues?.facebook_url || '',
            instagram_url: defaultValues?.instagram_url || '',
            youtube_url: defaultValues?.youtube_url || '',
        },
    });

    const handleFormSubmit = async (data: SocialLinksFormData) => {
        try {
            await onSubmit(data);
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    return (
        <View className="gap-6">
            {/* Facebook */}
            <View className="gap-2">
                <View className="flex-row items-center gap-2">
                    <Link size={18} color="#1877f2" />
                    <Text className="text-sm font-bold text-foreground">Facebook</Text>
                </View>
                <Controller
                    control={control}
                    name="facebook_url"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="https://facebook.com/username"
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="none"
                            className={`px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base ${errors.facebook_url ? 'border border-red-500' : 'border border-transparent focus:border-primary'
                                }`}
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
                {errors.facebook_url && (
                    <Text className="text-xs font-medium text-red-500 ml-1">{errors.facebook_url.message}</Text>
                )}
            </View>

            {/* Instagram */}
            <View className="gap-2">
                <View className="flex-row items-center gap-2">
                    <Camera size={18} color="#e4405f" />
                    <Text className="text-sm font-bold text-foreground">Instagram</Text>
                </View>
                <Controller
                    control={control}
                    name="instagram_url"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="https://instagram.com/username"
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="none"
                            className={`px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base ${errors.instagram_url ? 'border border-red-500' : 'border border-transparent focus:border-primary'
                                }`}
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
                {errors.instagram_url && (
                    <Text className="text-xs font-medium text-red-500 ml-1">{errors.instagram_url.message}</Text>
                )}
            </View>

            {/* YouTube */}
            <View className="gap-2">
                <View className="flex-row items-center gap-2">
                    <Video size={18} color="#ff0000" />
                    <Text className="text-sm font-bold text-foreground">YouTube</Text>
                </View>
                <Controller
                    control={control}
                    name="youtube_url"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="https://youtube.com/@channel"
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="none"
                            className={`px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base ${errors.youtube_url ? 'border border-red-500' : 'border border-transparent focus:border-primary'
                                }`}
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
                {errors.youtube_url && (
                    <Text className="text-xs font-medium text-red-500 ml-1">{errors.youtube_url.message}</Text>
                )}
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
                        <Save size={18} color="#ffffff" strokeWidth={2.5} />
                    )}
                    <Text className="text-white font-bold">{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
                </Pressable>
            </View>
        </View>
    );
}
