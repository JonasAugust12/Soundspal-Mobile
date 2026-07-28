import { Platform, StyleSheet } from 'react-native';

/** Bóng đổ dùng chung cho các thẻ của màn Premium (NativeWind không lo phần shadow). */
export const premiumStyles = StyleSheet.create({
    iconButton: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 5,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    heroCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.24,
                shadowRadius: 18,
            },
            android: {
                elevation: 9,
            },
        }),
    },
    heroGradient: {
        padding: 22,
    },
    sectionCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            },
            android: {
                elevation: 1,
            },
        }),
    },
});
