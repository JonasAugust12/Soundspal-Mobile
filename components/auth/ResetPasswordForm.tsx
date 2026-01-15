import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldCheck, RotateCcw } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { AuthButton } from './AuthButton';

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, 'M ật khẩu phải có ít nhất 6 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
            .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
    onSubmit: (data: ResetPasswordFormData) => Promise<void>;
    isLoading?: boolean;
}

export function ResetPasswordForm({ onSubmit, isLoading }: ResetPasswordFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    return (
        <View className="items-center gap-3 w-full">
            <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, value } }) => (
                    <FormInput
                        label="Mật khẩu mới"
                        placeholder="••••••••"
                        secureTextEntry
                        value={value}
                        onChangeText={onChange}
                        error={errors.newPassword?.message}
                        icon={Lock}
                    />
                )}
            />

            <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                    <FormInput
                        label="Xác nhận mật khẩu"
                        placeholder="••••••••"
                        secureTextEntry
                        value={value}
                        onChangeText={onChange}
                        error={errors.confirmPassword?.message}
                        icon={ShieldCheck}
                    />
                )}
            />

            <AuthButton onPress={handleSubmit(onSubmit)} isLoading={isLoading} leftIcon={RotateCcw}>
                {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </AuthButton>
        </View>
    );
}
