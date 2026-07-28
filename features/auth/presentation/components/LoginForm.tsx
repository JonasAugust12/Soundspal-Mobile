import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { AuthButton } from './AuthButton';
import {
    AUTH_COMMON,
    AUTH_LOGIN_UI,
    AuthLoadingLabel,
} from '@/features/auth/domain/constants/authMessages';
import { AuthValidationMessage } from '@/features/auth/domain/constants/authValidation';

const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, AuthValidationMessage.IdentifierRequired)
        .refine(
            (val) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                // Backend cho phép dấu chấm và gạch ngang trong username (vd
                // "newjeans.hybe.venue"), nên form đăng nhập phải nhận đúng bộ ký tự đó —
                // chặn ở client là khoá luôn tài khoản hợp lệ ra ngoài.
                const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
                return emailRegex.test(val) || usernameRegex.test(val);
            },
            { message: AuthValidationMessage.IdentifierInvalid },
        ),
    password: z.string().min(6, AuthValidationMessage.PasswordMin),
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
                        label={AUTH_LOGIN_UI.identifierLabel}
                        placeholder={AUTH_LOGIN_UI.identifierPlaceholder}
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
                        label={AUTH_LOGIN_UI.passwordLabel}
                        placeholder={AUTH_LOGIN_UI.passwordPlaceholder}
                        secureTextEntry
                        value={value}
                        onChangeText={onChange}
                        error={errors.password?.message}
                        icon={Lock}
                    />
                )}
            />

            <AuthButton onPress={handleSubmit(onSubmit)} isLoading={isLoading} leftIcon={LogIn}>
                {isLoading ? AuthLoadingLabel.LoggingIn : AUTH_COMMON.login}
            </AuthButton>
        </View>
    );
}
