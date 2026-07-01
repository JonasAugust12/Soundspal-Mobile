import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AtSign, CheckCircle2, Disc2, MicVocal, Building2 } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { SelectInput } from './SelectInput';
import { AuthButton } from './AuthButton';
import type { UserRole } from '@/features/auth/domain/entities/auth.type';

const USER_ROLES = [
    { label: 'Producer', value: 'producer', icon: Disc2 },
    { label: 'Singer', value: 'singer', icon: MicVocal },
    { label: 'Venue', value: 'venue', icon: Building2 },
];

const completeOAuthSchema = z.object({
    username: z
        .string()
        .min(1, 'Vui lòng nhập username')
        .min(3, 'Username phải có ít nhất 3 ký tự')
        .max(20, 'Username không được quá 20 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới'),
    role: z.enum(['producer', 'singer', 'venue'] as const),
});

export type CompleteOAuthFormData = z.infer<typeof completeOAuthSchema>;

interface CompleteOAuthFormProps {
    onSubmit: (data: CompleteOAuthFormData) => void;
    isLoading: boolean;
}

export function CompleteOAuthForm({ onSubmit, isLoading }: CompleteOAuthFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CompleteOAuthFormData>({
        resolver: zodResolver(completeOAuthSchema),
        defaultValues: {
            username: '',
            role: 'producer',
        },
    });

    return (
        <View className="w-full gap-3">
            <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                    <FormInput
                        label="Username"
                        placeholder="vd: nguyenvana_music"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                        error={errors.username?.message}
                        icon={AtSign}
                    />
                )}
            />

            <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                    <SelectInput
                        label="Bạn là"
                        options={USER_ROLES}
                        onValueChange={(val) => onChange(val as UserRole)}
                        value={value}
                        error={errors.role?.message}
                    />
                )}
            />

            <View className="mt-4">
                <AuthButton
                    onPress={handleSubmit(onSubmit)}
                    isLoading={isLoading}
                    leftIcon={CheckCircle2}
                >
                    {isLoading ? 'Đang hoàn tất...' : 'Hoàn tất đăng ký'}
                </AuthButton>
            </View>
        </View>
    );
}
