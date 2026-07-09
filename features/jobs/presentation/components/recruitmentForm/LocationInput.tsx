import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { GradientFocusOutline } from './GradientFocusOutline';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface LocationInputProps {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
}

export function LocationInput({
    value,
    onChangeText,
    placeholder = 'Ví dụ: Quận 3, TP. Hồ Chí Minh',
}: LocationInputProps) {
    const [focused, setFocused] = useState(false);

    return (
        <GradientFocusOutline focused={focused}>
            <View style={styles.container}>
                <View style={styles.iconWrap}>
                    <MapPin size={18} color={RECRUITMENT_FORM_COLORS.textSubtle} />
                </View>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={RECRUITMENT_FORM_COLORS.textSubtle}
                    style={styles.input}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onEndEditing={() => setFocused(false)}
                />
            </View>
        </GradientFocusOutline>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        minHeight: 50,
    },
    iconWrap: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: RECRUITMENT_FORM_COLORS.text,
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
});
