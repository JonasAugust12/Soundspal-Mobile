import { renderHook } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import { useToast } from '@/hooks/useToast';

jest.mock('react-native-toast-message');

describe('useToast', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return toast functions', () => {
        const { result } = renderHook(() => useToast());
        expect(result.current.showSuccess).toBeDefined();
        expect(result.current.showError).toBeDefined();
        expect(result.current.showInfo).toBeDefined();
    });

    describe('showSuccess', () => {
        it('should call Toast.show with success type', () => {
            const { result } = renderHook(() => useToast());
            result.current.showSuccess('Success Title', 'Success message');

            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Success Title',
                text2: 'Success message',
                position: 'top',
                visibilityTime: 3000,
            });
        });
    });

    describe('showError', () => {
        it('should call Toast.show with error type', () => {
            const { result } = renderHook(() => useToast());
            result.current.showError('Error Title', 'Error message');

            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Error Title',
                text2: 'Error message',
                position: 'top',
                visibilityTime: 4000,
            });
        });
    });

    describe('showInfo', () => {
        it('should call Toast.show with info type', () => {
            const { result } = renderHook(() => useToast());
            result.current.showInfo('Info Title', 'Info message');

            expect(Toast.show).toHaveBeenCalledWith({
                type: 'info',
                text1: 'Info Title',
                text2: 'Info message',
                position: 'top',
                visibilityTime: 3000,
            });
        });
    });
});
