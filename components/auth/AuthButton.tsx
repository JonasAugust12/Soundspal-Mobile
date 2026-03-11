import React from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    ActivityIndicator,
    StyleProp,
    ViewStyle,
} from 'react-native';

interface AuthButtonProps {
    variant?: 'primary' | 'outlined';
    onPress?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    leftIcon?: React.ComponentType<{ size?: number; color?: string }>;
    isLoading?: boolean;
    style?: StyleProp<ViewStyle>;
    className?: string;
}

export function AuthButton({
    variant = 'primary',
    children,
    onPress,
    disabled,
    leftIcon: LeftIcon,
    isLoading,
    style,
    className: extraClassName,
}: AuthButtonProps) {
    const isPrimary = variant === 'primary';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            style={style}
            className={`
                w-full py-4 px-6 rounded-xl flex-row items-center justify-center
                ${isPrimary ? 'bg-purple-600' : 'bg-transparent border-2 border-purple-600'}
                ${disabled || isLoading ? 'opacity-50' : 'opacity-100'}
                ${extraClassName || ''}
            `}
            activeOpacity={0.7}
        >
            {isLoading ? (
                <ActivityIndicator color={isPrimary ? '#fff' : '#9333ea'} />
            ) : (
                <>
                    {LeftIcon && (
                        <View className="mr-2">
                            <LeftIcon size={20} color={isPrimary ? '#fff' : '#9333ea'} />
                        </View>
                    )}
                    <Text
                        className={`font-semibold text-base ${
                            isPrimary ? 'text-white' : 'text-purple-600'
                        }`}
                    >
                        {children}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}
