import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Send } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { AuthButton } from './AuthButton';

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
    onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
    isLoading?: boolean;
}

export function ForgotPasswordForm({ onSubmit, isLoading }: ForgotPasswordFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    return (
        <View className="items-center gap-3 w-full">
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                    <FormInput
                        label="Email"
                        placeholder="user@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={value}
                        onChangeText={onChange}
                        error={errors.email?.message}
                        icon={Mail}
                    />
                )}
            />

            <AuthButton
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
                leftIcon={Send}
            >
                {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </AuthButton>
        </View>
    );
}
