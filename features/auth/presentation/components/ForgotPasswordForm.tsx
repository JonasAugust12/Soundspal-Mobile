import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Send } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { AuthButton } from './AuthButton';
import {
    AUTH_FORGOT_PASSWORD_UI,
    AUTH_LOGIN_UI,
    AUTH_REGISTER_UI,
    AuthLoadingLabel,
} from '@/features/auth/domain/constants/authMessages';
import { AuthValidationMessage } from '@/features/auth/domain/constants/authValidation';

const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, AuthValidationMessage.EmailRequired)
        .email(AuthValidationMessage.EmailInvalid),
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
                        label={AUTH_REGISTER_UI.emailLabel}
                        placeholder={AUTH_LOGIN_UI.identifierPlaceholder}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={value}
                        onChangeText={onChange}
                        error={errors.email?.message}
                        icon={Mail}
                    />
                )}
            />

            <AuthButton onPress={handleSubmit(onSubmit)} isLoading={isLoading} leftIcon={Send}>
                {isLoading ? AuthLoadingLabel.Sending : AUTH_FORGOT_PASSWORD_UI.sendCode}
            </AuthButton>
        </View>
    );
}
