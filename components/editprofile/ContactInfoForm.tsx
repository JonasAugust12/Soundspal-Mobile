import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RotateCcw, Save } from 'lucide-react-native';

const contactInfoSchema = z.object({
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone_number: z.string().optional(),
});

export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;

interface ContactInfoFormProps {
    defaultValues?: Partial<ContactInfoFormData>;
    onSubmit: (data: ContactInfoFormData) => Promise<void>;
    isLoading?: boolean;
}

export function ContactInfoForm({ defaultValues, onSubmit, isLoading }: ContactInfoFormProps) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ContactInfoFormData>({
        resolver: zodResolver(contactInfoSchema),
        defaultValues: {
            email: defaultValues?.email || '',
            phone_number: defaultValues?.phone_number || '',
        },
    });

    const handleFormSubmit = async (data: ContactInfoFormData) => {
        try {
            await onSubmit(data);
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    return (
        <View className="gap-6">
            {/* Email */}
            <View className="gap-2">
                <Text className="text-sm font-bold text-foreground">Email</Text>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="email@example.com"
                            value={value}
                            onChangeText={onChange}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className={`px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base ${errors.email ? 'border border-red-500' : 'border border-transparent focus:border-primary'
                                }`}
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
                {errors.email && (
                    <Text className="text-xs font-medium text-red-500 ml-1">{errors.email.message}</Text>
                )}
            </View>

            {/* Phone Number */}
            <View className="gap-2">
                <Text className="text-sm font-bold text-foreground">Số điện thoại</Text>
                <Controller
                    control={control}
                    name="phone_number"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="0912345678"
                            value={value}
                            onChangeText={onChange}
                            keyboardType="phone-pad"
                            className="px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl text-foreground text-base border border-transparent focus:border-primary"
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
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
