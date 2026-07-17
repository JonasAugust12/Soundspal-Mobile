import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User,
    AtSign,
    Mail,
    Lock,
    ShieldCheck,
    UserPlus,
    Disc2,
    MicVocal,
    Building2,
} from 'lucide-react-native';
import { FormInput } from './FormInput';
import { SelectInput } from './SelectInput';
import { AuthButton } from './AuthButton';
import type { UserRole } from '@/features/auth/domain/entities/auth.type';
import {
    AUTH_COMMON,
    AUTH_LOGIN_UI,
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

const registerSchema = z
    .object({
        display_name: z.string().min(1, AuthValidationMessage.DisplayNameRequired),
        username: z
            .string()
            .min(3, AuthValidationMessage.UsernameMin)
            .max(20, AuthValidationMessage.UsernameMax)
            .regex(/^[a-zA-Z0-9_]+$/, AuthValidationMessage.UsernameFormat),
        email: z.string().email(AuthValidationMessage.EmailInvalid),
        password: z
            .string()
            .min(6, AuthValidationMessage.PasswordMin)
            .regex(/[A-Z]/, AuthValidationMessage.PasswordUppercase)
            .regex(/[0-9]/, AuthValidationMessage.PasswordDigit),
        confirmPassword: z.string().min(1, AuthValidationMessage.PasswordConfirmRequired),
        role: z.enum(['producer', 'singer', 'venue'] as const),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: AuthValidationMessage.PasswordConfirmMismatch,
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
                        label={AUTH_REGISTER_UI.displayNameLabel}
                        placeholder={AUTH_REGISTER_UI.displayNamePlaceholder}
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
                        label={AUTH_REGISTER_UI.usernameLabel}
                        placeholder={AUTH_REGISTER_UI.usernamePlaceholder}
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

            <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                    <SelectInput
                        label={AUTH_REGISTER_UI.roleLabel}
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

            <View className="mt-2 w-full">
                <AuthButton
                    onPress={handleSubmit(onSubmit)}
                    isLoading={isLoading}
                    leftIcon={UserPlus}
                >
                    {isLoading ? AuthLoadingLabel.Registering : AUTH_COMMON.register}
                </AuthButton>
            </View>
        </View>
    );
}
