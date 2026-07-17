import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

/**
 * Side-effect module — phải import ở đầu app/_layout.tsx, RNFirebase yêu cầu đăng ký
 * handler trước khi app khởi động xong.
 *
 * Body để trống là cố ý: message có khối `notification` thì OS tự hiện banner.
 */
setBackgroundMessageHandler(getMessaging(getApp()), async (message) => {
    console.warn('[FCM] background message:', message?.messageId);
});
