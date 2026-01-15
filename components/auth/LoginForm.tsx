import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { AuthButton } from './AuthButton';

const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, 'Email hoặc username là bắt buộc')
        .refine(
            (val) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
                return emailRegex.test(val) || usernameRegex.test(val);
            },
            { message: 'Email hoặc username không hợp lệ' },
        ),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onSubmit: (data: LoginFormData) => Promise<void>;
    isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });

    return (
        <View className="items-center gap-3 w-full">
            <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, value } }) => (
                    <FormInput
                        label="Email hoặc Username"
                        placeholder="user@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={value}
                        onChangeText={onChange}
                        error={errors.identifier?.message}
                        icon={Mail}
                    />
                )}
            />

            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                    <FormInput
                        label="Mật khẩu"
                        placeholder="••••••••"
                        secureTextEntry
                        value={value}
                        onChangeText={onChange}
                        error={errors.password?.message}
                        icon={Lock}
                    />
                )}
            />

            <AuthButton onPress={handleSubmit(onSubmit)} isLoading={isLoading} leftIcon={LogIn}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </AuthButton>
        </View>
    );
}
