import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, AtSign, Mail, UserCircle2, Lock, ShieldCheck, UserPlus } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { SelectInput } from './SelectInput';
import { AuthButton } from './AuthButton';
import type { UserRole } from '@/types/auth.type';

const USER_ROLES = [
    { label: 'Producer', value: 'producer' },
    { label: 'Singer', value: 'singer' },
    { label: 'Venue', value: 'venue' },
];

const registerSchema = z
    .object({
        display_name: z.string().min(1, 'Tên hiển thị là bắt buộc'),
        username: z
            .string()
            .min(3, 'Username phải có ít nhất 3 ký tự')
            .max(20, 'Username không được quá 20 ký tự')
            .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới'),
        email: z.string().email('Email không hợp lệ'),
        password: z
            .string()
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
            .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
        role: z.enum(['producer', 'singer', 'venue'] as const),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    onSubmit: (data: RegisterFormData) => Promise<void>;
    isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            display_name: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'producer',
        },
    });

    return (
        <View className="items-center gap-3 w-full">
            <Controller
                control={control}
                name="display_name"
                render={({ field: { onChange, value } }) => (
                    <FormInput
                        label="Tên hiển thị"
                        placeholder="Nguyễn Văn A"
                        value={value}
                        onChangeText={onChange}
                        error={errors.display_name?.message}
                        icon={User}
                    />
                )}
            />

            <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                    <FormInput
                        label="Username"
                        placeholder="nguyenvana"
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

            <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                    <SelectInput
                        label="Vai trò"
                        options={USER_ROLES}
                        value={value}
                        onValueChange={(val: string) => onChange(val as UserRole)}
                        error={errors.role?.message}
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

            <View className="mt-2 w-full">
                <AuthButton
                    onPress={handleSubmit(onSubmit)}
                    isLoading={isLoading}
                    leftIcon={UserPlus}
                >
                    {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                </AuthButton>
            </View>
        </View>
    );
}
