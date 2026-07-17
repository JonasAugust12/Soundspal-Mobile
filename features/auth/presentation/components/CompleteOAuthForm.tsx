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
import {
    AUTH_OAUTH_UI,
    AUTH_REGISTER_UI,
    AUTH_USER_ROLES,
    AuthLoadingLabel,
} from '@/features/auth/domain/constants/authMessages';
import { AuthValidationMessage } from '@/features/auth/domain/constants/authValidation';

const USER_ROLES = [
    { label: AUTH_USER_ROLES[0].label, value: AUTH_USER_ROLES[0].value, icon: Disc2 },
    { label: AUTH_USER_ROLES[1].label, value: AUTH_USER_ROLES[1].value, icon: MicVocal },
    { label: AUTH_USER_ROLES[2].label, value: AUTH_USER_ROLES[2].value, icon: Building2 },
];

const completeOAuthSchema = z.object({
    username: z
        .string()
        .min(1, AuthValidationMessage.UsernameRequired)
        .min(3, AuthValidationMessage.UsernameMin)
        .max(20, AuthValidationMessage.UsernameMax)
        .regex(/^[a-zA-Z0-9_]+$/, AuthValidationMessage.UsernameFormat),
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
                        label={AUTH_REGISTER_UI.usernameLabel}
                        placeholder={AUTH_OAUTH_UI.usernamePlaceholder}
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
                        label={AUTH_OAUTH_UI.roleLabel}
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
                    {isLoading ? AuthLoadingLabel.CompletingOAuth : AUTH_OAUTH_UI.completeButton}
                </AuthButton>
            </View>
        </View>
    );
}
