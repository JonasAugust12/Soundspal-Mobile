import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { PRIMARY_GRADIENT, RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';
import { JOB_TYPE_OPTIONS } from './recruitmentFormConstants';

const CARD_BORDER_WIDTH = 2;
const CARD_RADIUS = 14;
const CARD_INNER_RADIUS = CARD_RADIUS - CARD_BORDER_WIDTH;

interface ArtistTypePickerProps {
    value: string;
    onChange: (value: string) => void;
}

function ArtistTypeCardContent({
    isActive,
    label,
    Icon,
}: {
    isActive: boolean;
    label: string;
    Icon: (typeof JOB_TYPE_OPTIONS)[number]['Icon'];
}) {
    return (
        <>
            {isActive ? (
                <LinearGradient
                    colors={[...PRIMARY_GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.checkmark}
                >
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                </LinearGradient>
            ) : null}

            <View
                style={[
                    styles.iconCircle,
                    isActive ? styles.iconCircleActive : styles.iconCircleInactive,
                ]}
            >
                <Icon
                    size={22}
                    color={
                        isActive
                            ? RECRUITMENT_FORM_COLORS.primary
                            : RECRUITMENT_FORM_COLORS.textSubtle
                    }
                />
            </View>

            <Text
                style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
            >
                {label}
            </Text>
        </>
    );
}

export function ArtistTypePicker({ value, onChange }: ArtistTypePickerProps) {
    return (
        <View style={styles.row}>
            {JOB_TYPE_OPTIONS.map((option) => {
                const isActive = value === option.value;

                return (
                    <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        onPress={() => onChange(option.value)}
                        style={({ pressed }) => [styles.cardSlot, pressed && styles.cardPressed]}
                    >
                        {isActive ? (
                            <LinearGradient
                                colors={[...PRIMARY_GRADIENT]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBorder}
                            >
                                <View style={[styles.card, styles.cardActive]}>
                                    <ArtistTypeCardContent
                                        isActive
                                        label={option.label}
                                        Icon={option.Icon}
                                    />
                                </View>
                            </LinearGradient>
                        ) : (
                            <View style={[styles.card, styles.cardInactive]}>
                                <ArtistTypeCardContent
                                    isActive={false}
                                    label={option.label}
                                    Icon={option.Icon}
                                />
                            </View>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    cardSlot: {
        flex: 1,
        minWidth: 0,
    },
    gradientBorder: {
        borderRadius: CARD_RADIUS,
        padding: CARD_BORDER_WIDTH,
    },
    card: {
        aspectRatio: 1,
        borderRadius: CARD_INNER_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        paddingTop: 10,
        paddingBottom: 8,
        overflow: 'hidden',
    },
    cardActive: {
        backgroundColor: RECRUITMENT_FORM_COLORS.primaryMuted,
    },
    cardInactive: {
        backgroundColor: RECRUITMENT_FORM_COLORS.inactive,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
        borderRadius: CARD_RADIUS,
    },
    cardPressed: {
        opacity: 0.88,
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    iconCircleActive: {
        backgroundColor: '#FFFFFF',
    },
    iconCircleInactive: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 14,
        width: '100%',
    },
    labelActive: {
        color: RECRUITMENT_FORM_COLORS.primaryDark,
    },
    labelInactive: {
        color: RECRUITMENT_FORM_COLORS.textMuted,
    },
});
