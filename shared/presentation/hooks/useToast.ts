import Toast from 'react-native-toast-message';

export const useToast = () => {
    const showSuccess = (title: string, message: string) => {
        Toast.show({
            type: 'success',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 3000,
        });
    };

    const showError = (title: string, message: string) => {
        Toast.show({
            type: 'error',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
        });
    };

    const showInfo = (title: string, message: string) => {
        Toast.show({
            type: 'info',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 3000,
        });
    };

    return { showSuccess, showError, showInfo };
};
