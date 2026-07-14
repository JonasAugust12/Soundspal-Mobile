import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

/**
 * Handler chạy khi app ở background/killed và nhận message.
 * Đây là side-effect module: import ở đầu app/_layout.tsx để đăng ký sớm.
 *
 * Lưu ý: message có sẵn khối `notification` (title/body) thì OS TỰ hiện banner —
 * handler này chỉ để xử lý thêm (vd đồng bộ badge) nếu cần.
 */
setBackgroundMessageHandler(getMessaging(getApp()), async (message) => {
    console.warn('[FCM] background message:', message?.messageId);
});
