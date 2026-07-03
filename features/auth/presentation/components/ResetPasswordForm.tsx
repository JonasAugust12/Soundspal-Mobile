import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldCheck, RotateCcw } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { AuthButton } from './AuthButton';
import {
    AUTH_LOGIN_UI,
    AUTH_REGISTER_UI,
    AUTH_RESET_PASSWORD_UI,
    AuthLoadingLabel,
} from '@/features/auth/domain/constants/authMessages';
import { AuthValidationMessage } from '@/features/auth/domain/constants/authValidation';

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, AuthValidationMessage.PasswordMin)
            .regex(/[A-Z]/, AuthValidationMessage.PasswordUppercase)
            .regex(/[0-9]/, AuthValidationMessage.PasswordDigit),
        confirmPassword: z.string().min(1, AuthValidationMessage.PasswordConfirmRequired),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: AuthValidationMessage.PasswordConfirmMismatch,
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
                        label={AUTH_RESET_PASSWORD_UI.newPasswordLabel}
                        placeholder={AUTH_LOGIN_UI.passwordPlaceholder}
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
                        label={AUTH_REGISTER_UI.confirmPasswordLabel}
                        placeholder={AUTH_LOGIN_UI.passwordPlaceholder}
                        secureTextEntry
                        value={value}
                        onChangeText={onChange}
                        error={errors.confirmPassword?.message}
                        icon={ShieldCheck}
                    />
                )}
            />

            <AuthButton onPress={handleSubmit(onSubmit)} isLoading={isLoading} leftIcon={RotateCcw}>
                {isLoading
                    ? AuthLoadingLabel.ResettingPassword
                    : AUTH_RESET_PASSWORD_UI.resetButton}
            </AuthButton>
        </View>
    );
}
