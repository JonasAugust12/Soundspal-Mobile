import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import {
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification,
} from '@react-native-firebase/messaging';
import { usePushNotifications } from '@/features/notifications/presentation/hooks/usePushNotifications';

const push = jest.fn();

// Lấy callback mà hook đăng ký cho một listener đã mock.
function lastCallback(fn: unknown): (msg: unknown) => unknown {
    const calls = (fn as jest.Mock).mock.calls;
    return calls[calls.length - 1][1];
}

describe('usePushNotifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push });
        (getInitialNotification as jest.Mock).mockResolvedValue(null);
    });

    it('foreground: hiện toast với title/body của thông báo', async () => {
        renderHook(() => usePushNotifications());

        const onMessageCb = lastCallback(onMessage);
        await act(async () => {
            await onMessageCb({
                notification: { title: 'Ứng tuyển mới!', body: 'A vừa ứng tuyển' },
                data: { type: 'new_application', job_id: 'job-1' },
            });
        });

        expect(Toast.show).toHaveBeenCalledWith(
            expect.objectContaining({ text1: 'Ứng tuyển mới!', text2: 'A vừa ứng tuyển' }),
        );
    });

    it('foreground: fallback title khi payload thiếu notification block', async () => {
        renderHook(() => usePushNotifications());

        const onMessageCb = lastCallback(onMessage);
        await act(async () => {
            await onMessageCb({ data: {} });
        });

        expect(Toast.show).toHaveBeenCalledWith(
            expect.objectContaining({ text1: 'Thông báo mới' }),
        );
    });

    it('bấm thông báo (background) new_application → mở màn ứng viên của job', () => {
        renderHook(() => usePushNotifications());

        const openedCb = lastCallback(onNotificationOpenedApp);
        act(() => {
            openedCb({ data: { type: 'new_application', job_id: 'job-77' } });
        });

        expect(push).toHaveBeenCalledWith('/(jobs)/applicants?id=job-77');
    });

    it('bấm thông báo (background) application_status_changed → mở "Đơn của tôi"', () => {
        renderHook(() => usePushNotifications());

        const openedCb = lastCallback(onNotificationOpenedApp);
        act(() => {
            openedCb({
                data: { type: 'application_status_changed', job_id: 'j', submission_id: 's' },
            });
        });

        expect(push).toHaveBeenCalledWith('/(jobs)/my-applications');
    });

    it('không điều hướng khi payload không suy ra được route', () => {
        renderHook(() => usePushNotifications());

        const openedCb = lastCallback(onNotificationOpenedApp);
        act(() => {
            openedCb({ data: { type: 'unknown' } });
        });

        expect(push).not.toHaveBeenCalled();
    });

    it('mở app từ trạng thái killed do bấm thông báo → điều hướng theo payload', async () => {
        (getInitialNotification as jest.Mock).mockResolvedValue({
            data: { type: 'application_status_changed' },
        });

        renderHook(() => usePushNotifications());

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/(jobs)/my-applications');
        });
    });
});
