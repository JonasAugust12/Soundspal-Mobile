# Feature: Push Notification (FCM)

**Code nằm ở:** `features/notifications/`
**Wire vào:** `app/_layout.tsx`, `features/auth/` (đính token lúc login)

---

## Push notification là gì? (đọc phần này trước)

Khác với gọi API thường (app hỏi — server trả), **push là server chủ động gõ cửa máy** kể cả khi app đang đóng. Backend không nối trực tiếp tới điện thoại được → phải đi qua **FCM/APNs** (cổng của Google/Apple) làm trung gian.

Có **2 pha**:

1. **Đăng ký thiết bị** (lúc login): app xin quyền → lấy `fcm_token` từ Firebase → gửi kèm login → backend lưu `userId ↔ token`.
2. **Gửi thông báo**: có sự kiện → backend gửi `{token, title, body}` cho FCM → FCM đẩy về máy → user bấm → mở màn.

---

## Mobile đã làm gì (feature này)

| File                                                 | Việc                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| `data/deviceInfo.ts`                                 | Tạo/lưu `device_id` (MMKV), suy ra `platform`                    |
| `presentation/hooks/useDevicePayload.ts`             | Xin quyền + lấy FCM token (có timeout, không chặn login)         |
| `presentation/hooks/usePushNotifications.ts`         | Foreground → toast; bấm thông báo → điều hướng theo `data.route` |
| `presentation/hooks/usePushTokenSync.ts`             | `onTokenRefresh` → đẩy token mới lên backend                     |
| `presentation/handlers/registerBackgroundHandler.ts` | Handler khi app background/killed                                |
| `data/datasources/notificationRemoteDataSource.ts`   | Gọi endpoint cập nhật token                                      |

Token được đính vào request **login** và **mobile-oauth** (xem `LoginScreen.tsx`, `useGoogleSignIn.ts`). Backend `user-service` đã nhận sẵn 3 field `device_id`, `fcm_token`, `platform`.

Foreground dùng luôn `react-native-toast-message` sẵn có → **không cần cài thêm** notifee. Background/killed thì OS tự hiện banner (backend gửi kèm khối `notification`).

---

## ⚠️ Còn THIẾU — phải lấy trước khi chạy được

### 1. File cấu hình Firebase (bắt buộc)

App sẽ **không build** nếu thiếu 2 file này ở thư mục gốc project:

- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

**Cách lấy:**

1. Vào [Firebase Console](https://console.firebase.google.com) → tạo project (hoặc dùng project đã có của team).
2. Add app **Android**: nhập package name **`com.jonasaugust12.talent_link`** (đúng như `app.json`) → tải `google-services.json`.
3. Add app **iOS**: nhập bundle ID **`com.jonasaugust12.talentlink`** (đã set trong `app.json` — đổi nếu team dùng ID khác) → tải `GoogleService-Info.plist`.
4. Bỏ 2 file vào thư mục gốc `TL-Mobile/`. (Đã trỏ đường dẫn sẵn trong `app.json`.)
5. Trong Firebase Console → Project Settings → Cloud Messaging: bật **Cloud Messaging API**. iOS cần upload **APNs key** (`.p8`) từ Apple Developer.

> 2 file này chứa khóa cấu hình riêng → nên thêm vào `.gitignore`, không commit công khai.

### 2. Backend phải hoàn thiện (nếu không, gửi token cũng vô ích)

- **Consumer ghi `DeviceRegistration`** từ stream `user-device-lifecycle` (notification-service hiện chưa nối) — nút thắt chính.
- **Endpoint `POST /auth/device-token`** để cập nhật token khi xoay vòng (dùng cho `usePushTokenSync`) — hiện chưa có, lời gọi sẽ 404 và bị nuốt lặng.

---

## Build & chạy

Đã thêm native module (`@react-native-firebase/*`) → **phải rebuild dev client**, không chạy được trên build cũ:

```bash
npx expo prebuild --clean       # sinh lại native project
eas build --profile development  # hoặc: npx expo run:android / run:ios
```

Sau đó cài bản build mới lên máy thật (FCM không chạy trên simulator iOS).

---

## Test nhanh

1. Login → kiểm tra bảng `DeviceRegistrations` phía backend có 1 dòng (device_id, fcm_token).
2. Gửi thử 1 push từ Firebase Console → Cloud Messaging → "Send test message", dán FCM token.
3. App foreground: thấy toast. App background: thấy banner OS. Bấm vào → mở màn theo `data.route`.
