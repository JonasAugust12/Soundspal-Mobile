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
        <View className="gap-4">
            {/* Email */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Email</Text>
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
                            className={`px-4 py-3 bg-secondary rounded-xl text-foreground ${errors.email ? 'border border-red-500' : ''}`}
                            placeholderTextColor="#71717a"
                        />
                    )}
                />
                {errors.email && (
                    <Text className="text-xs text-red-500">{errors.email.message}</Text>
                )}
            </View>

            {/* Phone Number */}
            <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Số điện thoại</Text>
                <Controller
                    control={control}
                    name="phone_number"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="0912345678"
                            value={value}
                            onChangeText={onChange}
                            keyboardType="phone-pad"
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
