import { Platform, type ViewStyle } from 'react-native';

/** Subtle card elevation — pair with a light border for a clean, natural look. */
export const cardShadow: ViewStyle = Platform.select({
    ios: {
        shadowColor: '#1F2937',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    android: {
        elevation: 1,
    },
    default: {},
}) as ViewStyle;

/** Slightly raised surfaces (search bars, tab pills). */
export const raisedShadow: ViewStyle = Platform.select({
    ios: {
        shadowColor: '#1F2937',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    android: {
        elevation: 2,
    },
    default: {},
}) as ViewStyle;

/** Floating elements (bottom tab bar). */
export const floatingShadow: ViewStyle = Platform.select({
    ios: {
        shadowColor: '#1F2937',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
    },
    android: {
        elevation: 3,
    },
    default: {},
}) as ViewStyle;

/** Accent FAB / primary CTA buttons. */
export const accentFabShadow: ViewStyle = Platform.select({
    ios: {
        shadowColor: '#7A3EFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 6,
    },
    android: {
        elevation: 4,
    },
    default: {},
}) as ViewStyle;
