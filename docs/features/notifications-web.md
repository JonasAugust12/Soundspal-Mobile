# Feature: Push Notification cho WEB (FCM Web Push)

> Tài liệu **các việc cần làm** để người dùng đăng nhập trên **web** cũng đăng ký FCM token và
> nhận được push — giống mobile đang chạy.
> Viết để **cả người mới lẫn AI agent khác** tiếp nối được: có path file (3 repo), contract dữ liệu,
> checklist, code mẫu và các bẫy đã biết.
>
> Tài liệu anh em: [`notifications.md`](./notifications.md) — luồng push cho **mobile** (đã chạy xong).

## 0. Bối cảnh 3 repo

| Repo           | Vai trò                             | Ghi chú                                                 |
| -------------- | ----------------------------------- | ------------------------------------------------------- |
| `TL-Mobile`    | App mobile (Expo + RN) — ✅ đã chạy | Dùng làm **khuôn mẫu** cho web                          |
| `DATN-Backend` | Microservices (Go + .NET)           | **Gần như không cần sửa** (xem §5)                      |
| Web FE         | Next.js/React (repo riêng)          | **Toàn bộ việc nằm ở đây** — chưa có ở máy dev hiện tại |

Trong tài liệu: path `features/`, `app/` là của **TL-Mobile**; path `user-service/`,
`notification-service/`, `job-post-service/` là của **DATN-Backend**.

---

## 1. Kết luận quan trọng nhất trước khi bắt tay

**Backend ĐÃ hỗ trợ WEB sẵn — không cần sửa gì cho happy path.**

```go
// user-service/internal/application/dto/auth_dto.go:40-46
type LoginRequest struct {
    Identifier string  `json:"identifier" binding:"required"`
    Password   string  `json:"password" binding:"required"`
    DeviceId   string  `json:"device_id" binding:"omitempty"`
    FcmToken   *string `json:"fcm_token" binding:"omitempty"`
    Platform   string  `json:"platform" binding:"omitempty"` // 'ANDROID', 'IOS', 'WEB'  ← có WEB
}
```

Lý do backend không cần biết client là web hay mobile:

- `platform` **không** có validate `oneof` → `'WEB'` đi qua bình thường.
- `RedisDeviceLifecycleConsumer` upsert device theo `(user_id, device_id)` — không quan tâm nguồn token.
- `FcmService` gửi `Message { Token, Notification, Data }` — **với FCM, token web và token Android là như nhau**.
- `RedisPushNotificationConsumer` lấy **toàn bộ** active device của user rồi gửi từng cái
  (`GetDeviceRegistrationsByUserIdAsync`) → user có cả web lẫn mobile thì **cả hai cùng nhận**.

---

## 2. Trạng thái tổng quan

| Chặng                                        | Phía                   | Trạng thái                   |
| -------------------------------------------- | ---------------------- | ---------------------------- |
| Đăng ký Web app trong Firebase project       | Firebase               | ⏳ Cần làm (§3)              |
| Tạo VAPID key (Web Push certificate)         | Firebase               | ⏳ Cần làm (§3)              |
| Bật Cloud Messaging API                      | Firebase               | ✅ Đã bật                    |
| Nhận `device_id`/`fcm_token`/`platform=WEB`  | `user-service`         | ✅ Có sẵn                    |
| Ghi `DeviceRegistration` vào DB              | `notification-service` | ✅ Có sẵn                    |
| Đọc device + gọi FCM gửi                     | `notification-service` | ✅ Có sẵn                    |
| Endpoint cập nhật token `/auth/device-token` | `user-service`         | ✅ Có sẵn                    |
| Lấy token + đính vào login                   | **Web FE**             | ⏳ **Cần làm (§4)**          |
| Service worker + hiện notification           | **Web FE**             | ⏳ **Cần làm (§4)**          |
| Điều hướng khi click                         | **Web FE**             | ⏳ **Cần làm (§4)**          |
| Sửa LOGOUT tắt-mọi-thiết-bị                  | `notification-service` | 🔴 **Cần quyết định (§6.1)** |

---

## 3. Điều kiện tiên quyết — Firebase Console (chặn mọi thứ, làm trước)

Project Firebase: **`talentlink-22clc`** · `messagingSenderId`: **`195779068090`**
(Đã xác nhận từ log gửi thành công: `projects/talentlink-22clc/messages/0:1784199566...`)

- [ ] **Đăng ký Web app**: Console → Project settings → General → Your apps → **Add app → Web**.
      Hiện project **chỉ có client Android** (`google-services.json`), chưa có web app.
      → Lấy về object `firebaseConfig` (`apiKey`, `authDomain`, `projectId`, `messagingSenderId`, `appId`).
- [ ] **Tạo VAPID key**: Console → Project settings → **Cloud Messaging** → _Web Push certificates_
      → **Generate key pair** → copy "Key pair" (chuỗi `B...`).

> ⚠️ Web app **phải nằm cùng project `talentlink-22clc`** với backend đang gửi. Khác project =
> token không hợp lệ, FCM trả `SenderId mismatch`.

Biến môi trường web nên đặt:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=talentlink-22clc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=talentlink-22clc
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=195779068090
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=B...
```

---

## 4. Việc phía WEB FE (~90% khối lượng)

### 4.0 Cài đặt

- [ ] `npm i firebase`

### 4.1 Khởi tạo Firebase — `lib/firebase.ts`

- [ ] `initializeApp(firebaseConfig)` + export `getMessaging()`
- [ ] **Guard `isSupported()`** — Safari cũ / private mode / SSR không có `window` sẽ ném lỗi

```ts
import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const app = initializeApp(firebaseConfig);

export async function getMessagingSafe() {
    if (typeof window === 'undefined') return null; // SSR
    if (!(await isSupported())) return null; // Safari cũ / private mode
    return getMessaging(app);
}
```

### 4.2 `device_id` ổn định theo browser — mirror `features/notifications/data/deviceInfo.ts`

- [ ] Sinh UUID v4 lần đầu, lưu **localStorage** key `device_id`, các lần sau đọc lại

```ts
const DEVICE_ID_KEY = 'device_id';

export function getOrCreateDeviceId(): string {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID(); // cần secure context (HTTPS/localhost)
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
}
```

> ⚠️ **Mỗi browser một `device_id` riêng.** DB có unique index `(user_id, device_id)`. Nếu web và
> mobile vô tình dùng chung `device_id`, consumer sẽ coi là "đổi user trên cùng thiết bị" và
> **deactivate bản ghi cũ** → mất push bên kia.

### 4.3 Service worker — `public/firebase-messaging-sw.js` (BẮT BUỘC, đặt ở ROOT)

- [ ] Tạo file tại **root** của public (`/firebase-messaging-sw.js`) — scope phải là `/`
- [ ] Xử lý `notificationclick` để điều hướng

```js
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    /* firebaseConfig — hardcode, SW không đọc được env */
});
const messaging = firebase.messaging();

// ⚠️ Backend LUÔN gửi kèm khối `notification` (FcmService.cs) → SDK TỰ hiện notification.
// KHÔNG gọi showNotification() ở đây, nếu không sẽ bị HIỆN 2 LẦN.
// messaging.onBackgroundMessage(...) chỉ dùng nếu cần xử lý thêm (vd badge).

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    // Tuỳ version SDK, data có thể nằm ở event.notification.data hoặc data.FCM_MSG.data
    const raw = event.notification.data ?? {};
    const data = raw.FCM_MSG?.data ?? raw;
    const url = resolveWebRoute(data); // xem §4.6
    if (url) event.waitUntil(clients.openWindow(url));
});
```

> ⚠️ **Bẫy "hiện 2 lần"**: message có `notification` block thì FCM web SDK tự hiện. Nếu bạn _cũng_
> gọi `self.registration.showNotification()` trong `onBackgroundMessage` → **2 thông báo**.
> Hành vi chính xác khác nhau theo version SDK → **verify khi implement**.

### 4.4 Xin quyền + lấy token — mirror `features/notifications/presentation/hooks/useDevicePayload.ts`

- [ ] Gọi `Notification.requestPermission()` **thật sự**
- [ ] Timeout 5s để **không chặn login**
- [ ] Trả `fcm_token: null` khi bị từ chối — vẫn cho login bình thường

```ts
type DevicePayload = { device_id: string; fcm_token: string | null; platform: 'WEB' };

// Copy pattern withTimeout từ useDevicePayload.ts:12 của mobile.
async function requestAndGetToken(): Promise<string | null> {
    try {
        const messaging = await getMessagingSafe();
        if (!messaging) return null;

        // ⚠️ BÀI HỌC TỪ BUG MOBILE: phải xin quyền THẬT, đừng giả định đã có.
        // Chưa cấp quyền thì FCM vẫn giao message nhưng browser LẶNG LẼ không hiện gì.
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return null;

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
            serviceWorkerRegistration: registration,
        });
        return token || null;
    } catch {
        return null;
    }
}

export async function getWebDevicePayload(): Promise<DevicePayload> {
    const fcm_token = await withTimeout(requestAndGetToken(), 5000, null);
    return { device_id: getOrCreateDeviceId(), fcm_token, platform: 'WEB' };
}
```

> 📌 **Đây chính là phiên bản web của con bug `POST_NOTIFICATIONS` vừa fix ở mobile**: mọi lớp đều
> báo "thành công" (có token, BE gửi OK, message tới nơi) nhưng **không hiện gì** vì quyền chưa được
> cấp. Đừng lặp lại.

### 4.5 Đính token vào login

- [ ] **Login thường** → `POST /auth/login` (đã hỗ trợ sẵn, không cần sửa BE)
      Mirror: `features/auth/presentation/screens/LoginScreen.tsx:44-50`

```ts
const device = await getWebDevicePayload();
await login({
    identifier,
    password,
    device_id: device.device_id,
    platform: device.platform, // 'WEB'
    ...(device.fcm_token ? { fcm_token: device.fcm_token } : {}),
});
```

- [ ] **Google OAuth trên web** → dùng `POST /auth/device-token` **sau khi** login xong

```go
// user-service/internal/application/dto/auth_dto.go:6-16
type OauthRequest struct {          // ← /auth/oauth  (WEB): KHÔNG có device fields
    Code, CodeVerifier string
}
type MobileOauthRequest struct {    // ← /auth/mobile-oauth: CÓ đủ 3 field
    Code, DeviceId, FcmToken, Platform
}
```

→ Web OAuth không đính token được. **Không cần sửa backend** — gọi tiếp:

```
POST /api/v1/auth/device-token
Authorization: Bearer <access_token>
{ "device_id": "...", "fcm_token": "...", "platform": "WEB" }
```

Endpoint đã đăng ký ở `user-service/internal/api/v1/routes/routes.go:77`, phát `TOKEN_REFRESH`
→ cùng consumer upsert device.

### 4.6 Route mapping riêng cho web ⚠️ KHÔNG tái dùng `resolvePushRoute` của mobile

`features/notifications/domain/utils/resolvePushRoute.ts` sinh route **expo-router**
(`/(jobs)/applicants?id=...`) — vô nghĩa với web. Web tự map từ data trung lập:

```ts
export function resolveWebRoute(data: Record<string, string>): string | null {
    switch (data.type) {
        case 'new_application': // gửi tới chủ job
            return data.job_id ? `/jobs/${data.job_id}/applicants` : null;
        case 'application_status_changed': // gửi tới ứng viên
            return '/my-applications';
        default:
            return null;
    }
}
```

> ⚠️ `messaging-service` có gửi sẵn `data.route = "/(messages)/${conversationId}"` — **là route
> mobile**. Web phải **bỏ qua** field `route`, đừng dùng trực tiếp (xem §6.3).

### 4.7 Foreground — `onMessage` → toast in-app

- [ ] Mirror `features/notifications/presentation/hooks/usePushNotifications.ts:35`
- [ ] Tab đang mở thì browser **không** hiện banner → phải tự hiện toast

### 4.8 Đồng bộ token khi xoay vòng

- [ ] Web SDK **không có** `onTokenRefresh` như mobile. Cách làm: mỗi lần load app (khi đã đăng nhập)
      gọi `getToken()`, so với giá trị lưu ở localStorage; **khác** thì `POST /auth/device-token`.
      Tham chiếu: `features/notifications/presentation/hooks/usePushTokenSync.ts`

---

## 5. Việc phía BACKEND

**Happy path: 0 dòng code.** Chỉ cần quyết định các mục ở §6.

---

## 6. Rủi ro & quyết định (đọc ra từ source backend)

### 6.1 🔴 LOGOUT tắt TẤT CẢ thiết bị — nghiêm trọng nhất khi có web

```csharp
// notification-service/.../Messaging/Consumers/RedisDeviceLifecycleConsumer.cs:308,321
// "A LOGOUT event signs the user out from every device, not just the..."
await repo.DeactivateAllByUserIdAsync(evt.user_id);
```

→ User **đăng xuất trên web sẽ giết luôn push của điện thoại** (và ngược lại).

**Quyết định cần đưa ra:** giữ nguyên (logout = thoát mọi nơi) hay sửa thành chỉ deactivate đúng
`device_id` đang logout? Nếu sửa: `DeactivateByUserAndDeviceAsync(user_id, device_id)` và
`user-service` phải gửi kèm `device_id` trong event LOGOUT.

### 6.2 🟠 Giới hạn `fcm_token` 256 ký tự — thất bại IM LẶNG

```csharp
// RedisDeviceLifecycleConsumer.cs:210,244-248
private const int FcmTokenMaxLength = 256;
if (evt.fcm_token.Length > FcmTokenMaxLength) { /* Skip + log warning, KHÔNG ghi DB */ }
```

Cột DB cũng là `varchar(256)`. Token Android thật đo được **142 ký tự**; token web thường ~150–200
→ nhiều khả năng OK, nhưng **phải đo token web thật** ngay khi có.
Nếu vượt: nới **cả** cột `varchar(256)` **lẫn** hằng số → nếu không sẽ bị bỏ qua âm thầm, rất khó debug.

### 6.3 🟠 `data.route` của messaging-service là route mobile

`messaging-service/src/gateway/chat.gateway.ts` gửi `route: "/(messages)/${conversationId}"`.
Nên đổi backend gửi **dữ liệu trung lập** (`type` + id) rồi mỗi client tự map — đúng như
`job-post-service` đang làm. Trước mắt web cứ bỏ qua `route`.

### 6.4 🟡 Giới hạn nền tảng web

- **HTTPS bắt buộc** (đã có; `localhost` được miễn).
- **Safari/iOS**: chỉ chạy khi user **cài site dạng PWA** (iOS 16.4+).
- Service worker phải ở **root scope** (`/firebase-messaging-sw.js`).

---

## 7. Contract dữ liệu (tham chiếu nhanh)

**Request login (web → user-service)** — 3 field push là optional:

```
device_id: string        // UUID ổn định/browser, lưu localStorage key "device_id"
fcm_token: string        // FCM web registration token (từ getToken + vapidKey)
platform:  "WEB"
```

**Endpoints:**
| Method + path | Có device fields? | Dùng cho |
| ------------- | ----------------- | -------- |
| `POST /auth/login` | ✅ có sẵn | Web login thường |
| `POST /auth/oauth` | ❌ không | Web Google OAuth → phải gọi thêm `/auth/device-token` |
| `POST /auth/mobile-oauth` | ✅ có sẵn | Mobile OAuth |
| `POST /auth/device-token` | ✅ (Bearer JWT) | Cập nhật token / sau OAuth web |

**Data payload push (job-post-service phát):**

```jsonc
// Gửi tới CHỦ JOB khi có người ứng tuyển
{ "type": "new_application", "job_id": "..." }
// Gửi tới ỨNG VIÊN khi đơn được duyệt/từ chối
{ "type": "application_status_changed", "submission_id": "...", "job_id": "...", "new_status": "..." }
```

---

## 8. Test plan

1. Web: login → **popup xin quyền hiện ra** → Allow.
2. DB: `SELECT * FROM device_registrations WHERE platform='WEB';` → phải có **1 dòng mới** đúng user.
   _(DB `notification_db` trên container `notification-db`)_
3. Đo độ dài token web: nếu **> 256** → dính §6.2, phải xử lý trước.
4. Ẩn/đóng tab web → từ tài khoản khác apply vào job của user này.
5. Web hiện notification (qua service worker) → **click → mở đúng trang** (§4.6).
6. Tab đang mở → thấy **toast** in-app (không có banner) — đúng thiết kế.
7. User có **cả web lẫn mobile** → **cả hai cùng nhận** (consumer loop qua mọi active device).
8. Logout trên web → kiểm tra mobile **còn nhận được không** → xác minh §6.1.

**Debug nhanh khi không thấy gì** (theo đúng thứ tự đường ống):

```
notification-service log: "Processing NotificationRequestedEvent for user X"  → event tới chưa
notification-service log: "Successfully sent FCM message: projects/talentlink-22clc/..."  → FCM nhận chưa
notification-service log: "No active devices registered for user X"  → device chưa đăng ký
Browser DevTools → Application → Service Workers  → SW sống chưa
Browser → Notification permission  → đã cấp chưa   ← thủ phạm hay gặp nhất
```

---

## 9. Bản đồ file

**Web FE (cần tạo)**

```
lib/firebase.ts                     ← init + isSupported guard
lib/deviceId.ts                     ← getOrCreateDeviceId (localStorage)
lib/fcm.ts                          ← getWebDevicePayload (permission + getToken + timeout)
lib/resolveWebRoute.ts              ← map data.type → URL web
public/firebase-messaging-sw.js     ← service worker (ROOT scope)
<login flow>                        ← đính device payload vào POST /auth/login
<app shell>                         ← onMessage → toast; sync token
```

**Mobile (khuôn mẫu để đối chiếu — TL-Mobile)**

```
features/notifications/data/deviceInfo.ts                          ← device_id
features/notifications/presentation/hooks/useDevicePayload.ts      ← permission + getToken + timeout
features/notifications/presentation/hooks/usePushNotifications.ts  ← foreground + tap
features/notifications/presentation/hooks/usePushTokenSync.ts      ← token refresh
features/notifications/domain/utils/resolvePushRoute.ts            ← ⚠️ route MOBILE, đừng copy
features/auth/presentation/screens/LoginScreen.tsx:44-50           ← đính vào login
```

**Backend (chỉ để tham chiếu — không cần sửa)**

```
user-service/internal/application/dto/auth_dto.go:40-46            ← LoginRequest có WEB ✅
user-service/internal/api/v1/routes/routes.go:77                   ← POST /auth/device-token ✅
notification-service/.../Consumers/RedisDeviceLifecycleConsumer.cs ← upsert device (§6.1, §6.2)
notification-service/.../Consumers/RedisPushNotificationConsumer.cs← loop mọi device → gửi FCM
notification-service/.../Notifications/FcmService.cs               ← Message{Token, Notification, Data}
job-post-service/.../services/submission/service.go:203            ← phát new_application
job-post-service/.../services/review/service.go:149                ← phát application_status_changed
```

---

## 10. Thứ tự về đích

1. **Firebase Console**: đăng ký Web app + tạo VAPID key (§3) — _chặn mọi thứ_.
2. **Web**: `device_id` + `getWebDevicePayload()` + đính vào `/auth/login` (§4.2, §4.4, §4.5).
3. **Verify sớm**: login web → thấy dòng `platform='WEB'` trong `device_registrations` + **đo độ dài token** (§8 bước 2-3).
4. **Web**: service worker + route mapping + toast foreground (§4.3, §4.6, §4.7).
5. **Test** đầy đủ (§8).
6. **Quyết định** §6.1 (LOGOUT) và §6.3 (route của messaging-service).

---

## Phụ lục — Bài học từ lần debug mobile (đừng lặp lại)

Luồng push mobile từng "im lặng" vì **4 lỗi độc lập**, mỗi lỗi đều khiến mọi lớp _trông như_ thành công:

| #   | Lỗi                                                                                                   | Dấu hiệu                                                                  |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Bảng `device_registrations` chưa tạo (migration chưa chạy)                                            | Login OK, `has_token=True`, nhưng consumer ném `42P01`                    |
| 2   | Thiếu `firebase.json` trong container                                                                 | `Failed to initialize Firebase: Could not find file '/app/firebase.json'` |
| 3   | **Redis DB lệch**: job-post-service phát vào **db 2**, notification-service đọc **db 0**              | Apply thành công, stream db2 có event, db0 rỗng → không ai tiêu thụ       |
| 4   | **Android không xin `POST_NOTIFICATIONS`** (RNFirebase `requestPermission()` là no-op trả AUTHORIZED) | FCM báo gửi thành công, máy nhận được message, **nhưng không hiện gì**    |

**Bài học chung:** khâu _hiển thị_ là nơi thất bại âm thầm nhất — mọi log đều xanh mà user không thấy
gì. Với web, nghi phạm số 1 luôn là **notification permission** và **service worker**.
