# 04 — Push notification (Firebase Cloud Messaging)

> Feature nhỏ nhất về dòng code (~760 dòng, **hơn nửa là test**) nhưng nhiều bẫy nền tảng nhất.

## 0. Bản đồ file

| File                                                                                                                                                         | Vai trò                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| [features/notifications/presentation/hooks/useDevicePayload.ts](../../features/notifications/presentation/hooks/useDevicePayload.ts)                         | Xin quyền + lấy FCM token (có timeout 5s) |
| [features/notifications/presentation/hooks/usePushNotifications.ts](../../features/notifications/presentation/hooks/usePushNotifications.ts)                 | 3 listener: foreground / tap / cold start |
| [features/notifications/presentation/hooks/usePushTokenSync.ts](../../features/notifications/presentation/hooks/usePushTokenSync.ts)                         | Đồng bộ token khi FCM xoay vòng           |
| [features/notifications/presentation/handlers/registerBackgroundHandler.ts](../../features/notifications/presentation/handlers/registerBackgroundHandler.ts) | Side-effect module, thân rỗng cố ý        |
| [features/notifications/domain/utils/resolvePushRoute.ts](../../features/notifications/domain/utils/resolvePushRoute.ts)                                     | Suy route từ payload (39 dòng, có test)   |
| [features/notifications/data/deviceInfo.ts](../../features/notifications/data/deviceInfo.ts)                                                                 | `device_id` UUID lưu MMKV                 |
| [features/notifications/data/datasources/notificationRemoteDataSource.ts](../../features/notifications/data/datasources/notificationRemoteDataSource.ts)     | `POST /auth/device-token`                 |

> ⚠️ Đừng nhầm: tab `(tabs)/notifications` **không** thuộc feature này — nó là
> `features/messaging/.../NotificationsScreen.tsx`, tức **danh sách chat**.

---

## A. Kiến trúc

1. **[KT]** Feature này có tỉ lệ test cao nhất dự án (403/759 dòng là test). Vì sao ở đây lại test kỹ mà chỗ khác thì không? Điều đó nói gì về tiêu chí chọn chỗ để test?

2. **[KT]** `registerBackgroundHandler.ts` là **side-effect module** — import bằng `import '...'` không lấy giá trị. Vì sao phải import ở **đầu** `app/_layout.tsx`? Nếu import xuống dưới thì lỗi gì?
    - `↳` RNFirebase yêu cầu handler được đăng ký **trước khi app khởi động xong**, nếu không message ở background/killed không có handler.

3. **[KT]** Thân `setBackgroundMessageHandler` **để trống** (chỉ log). Vì sao vẫn phải khai? Xoá luôn thì sao?
    - `↳` Message có khối `notification` thì OS tự hiện banner — không cần code. Nhưng RNFirebase **cảnh báo/lỗi** nếu không có handler đăng ký cho data message.

4. **[KT]** `usePushNotifications()` phải gọi **đúng một lần** ở `app/_layout.tsx`. Điều gì xảy ra nếu gọi ở nhiều màn?
    - `↳` Listener là global → đăng ký nhiều lần sẽ nhân bản (một push mở nhiều route).

5. **[KT]** `resolvePushRoute` nằm ở `domain/utils` và là hàm thuần, có test riêng. Đây là ví dụ đúng nhất dự án về giá trị của tầng domain — giải thích vì sao.

---

## B. Luồng đi

### B1. Đăng ký thiết bị

6. **[LUỒNG]** FCM token được gửi lên backend ở **mấy thời điểm**?
    - `↳` (a) khi đăng nhập thường và Google Sign-In — đính vào body login/`mobile-oauth` qua `getDevicePayload()`; (b) khi FCM xoay token — `usePushTokenSync` gọi `POST /auth/device-token`.

7. **[LUỒNG]** `getDevicePayload()` trả về đúng 3 field. Kể tên và nguồn của từng field.
    - `↳` `device_id` (UUID sinh tay, lưu MMKV), `fcm_token` (có thể `null`), `platform` (`IOS`/`ANDROID`/`WEB`).

8. **[SÂU]** Vì sao bọc `requestAndGetToken()` trong `withTimeout(..., 5000, null)`?
    - `↳` Native call có thể treo; không được chặn luồng đăng nhập. Thiếu token vẫn cho login.

9. **[SÂU]** Hệ quả của timeout đó: mạng chậm hơn 5 giây ⇒ đăng nhập xong **không nhận push cho tới lần đăng nhập sau**. Vì sao không retry ngầm sau khi vào app? Thiết kế cách vá.

10. **[BIZ]** `device_id` sinh bằng `Math.random()` theo template UUID v4 thủ công, lưu MMKV. Rủi ro đụng độ thực tế? Vì sao không dùng thư viện UUID hoặc device id của hệ điều hành?

11. **[BIZ]** Gỡ app rồi cài lại ⇒ MMKV mất ⇒ `device_id` mới ⇒ bản ghi cũ ở backend thành **rác**. Ai dọn? Có endpoint huỷ đăng ký không?

### B2. Nhận thông báo

12. **[LUỒNG]** Có **4 trạng thái app** khi push đến. Kể tên và cho biết ai xử lý từng trạng thái.
    - `↳` (1) foreground → `onMessage` → app tự hiện Toast (OS **không** hiện banner); (2) background → OS hiện banner, `setBackgroundMessageHandler` chạy nền; (3) tap khi app ở background → `onNotificationOpenedApp`; (4) tap khi app **đã bị kill** → `getInitialNotification()`.

13. **[SÂU]** Vì sao trạng thái (4) cần API riêng thay vì dùng chung `onNotificationOpenedApp`?
    - `↳` Listener chưa tồn tại lúc sự kiện xảy ra; Firebase giữ lại message khởi tạo để hỏi một lần.

14. **[SÂU]** **Race condition**: `getInitialNotification()` gọi `router.push()` còn `useProtectedRoute` có thể `router.replace()` về login. Cái nào chạy trước? App bị kill + chưa đăng nhập + bấm push thì kết cục ra sao?
    - `↳` Đây là câu hỏi thật khó — `redirectStore` có cơ chế `returnTo` nhưng nó chỉ được set khi guard chặn, không phải khi push chen ngang. Cần kiểm chứng thực tế.

### B3. Điều hướng từ push

15. **[LUỒNG]** `resolvePushRoute` quyết định theo thứ tự ưu tiên nào?
    - `↳` (1) `type` + id → route cứng; (2) nếu chỉ có `conversationId` → route chat; (3) fallback `route`/`path` trong payload.

16. **[BIZ]** Ba giá trị `type` được xử lý là gì và map sang route nào?
    - `↳` `new_application` → `/(jobs)/applicants?id=<jobId>`; `application_status_changed` → `/(jobs)/my-applications`; `new_message` → `/(messages)/detailMessage?conversationId=<id>`.

17. **[SÂU]** Hàm `pick()` phải nhận **cả `job_id` lẫn `jobId`**, **cả `conversation_id` lẫn `conversationId`**. Vì sao?
    - `↳` job-post-service gửi snake_case, messaging-service gửi camelCase — hai service, hai quy ước.

18. **[SÂU]** messaging-service **không gửi `type`** và gửi `route: "/(messages)/<id>"` — **route đó không tồn tại trong app**. Vì sao `route`/`path` bị hạ xuống làm fallback cuối cùng thay vì ưu tiên?
    - `↳` Comment `resolvePushRoute.ts:15-18` nói thẳng: tin backend thì điều hướng sai. Đây là bằng chứng hợp đồng chưa được thống nhất.

19. **[SÂU]** Ai chịu trách nhiệm về hợp đồng payload này? App đang gánh nợ của backend — bạn đề xuất quy trình gì để không lặp lại?

---

## C. Business logic

20. **[BIZ]** Push chỉ được gửi cho người **offline** (xác định bằng socket còn sống). Người dùng đang mở app nhưng ở màn khác — họ có được báo không? Cơ chế nào?
    - `↳` Không có push; chỉ có `incrementUnread()` trong `messagingStore` khi socket đẩy `message:new` và `activeConversationId` khác.

21. **[BIZ]** Đây là lý do `SocketProvider` **chủ động ngắt socket khi app xuống nền**. Giải thích ràng buộc hai chiều và điều gì hỏng nếu một bên đổi.

22. **[BIZ]** **Không có notification channel riêng** cho Android. Hệ quả: không phân biệt mức ưu tiên tin nhắn vs tin tuyển dụng, người dùng không tắt riêng từng loại được. Kế hoạch?

23. **[BIZ]** **Không có lịch sử thông báo trong app** — vuốt đi là mất. Yêu cầu nghiệp vụ hay thiếu sót? (Lưu ý câu hỏi bẫy: tab "Thông báo" thực chất là danh sách chat.)

24. **[BIZ]** `logout()` **không gọi API huỷ device token**. Trên máy dùng chung: người A đăng xuất, người B đăng nhập — người A vẫn nhận push của mình trên máy đó. Đây là lỗ hổng riêng tư — hướng vá?

---

## D. Bên thứ ba — Firebase

25. **[3RD]** Giải thích **bẫy `requestPermission()`** của RNFirebase trên Android. Vì sao code phải tự gọi `PermissionsAndroid`?
    - `↳` Comment `useDevicePayload.ts:15-22`: hàm đó được đánh dấu `@platform ios` và chỉ `return Promise.resolve(AUTHORIZED)` — **không hỏi user**. Trên Android 13+ quyền `POST_NOTIFICATIONS` mặc định bị từ chối: FCM vẫn giao message (background handler vẫn chạy) nhưng **OS lặng lẽ không hiện banner**.

26. **[SÂU]** Bạn phát hiện ra bẫy đó bằng cách nào? (Câu hỏi kiểm tra quy trình debug, không phải kiến thức thuộc lòng.)

27. **[3RD]** Vì sao dưới Android 13 (`Platform.Version < 33`) thì `return true` luôn?
    - `↳` Quyền thông báo được cấp sẵn lúc cài đặt, không có runtime permission.

28. **[3RD]** `google-services.json` bị gitignore, CI ghi lại từ **secret base64**. Ai có quyền truy cập secret đó? Có rotate không? Người rời dự án thì xử lý sao?

29. **[3RD]** Firebase project của FCM (`talentlink-22clc`) **khác** project của Google Sign-In (`talent-link-480717`). Vì sao? Rủi ro quản trị khi hai thứ nằm ở hai nơi?

30. **[3RD]** Firebase service account JSON (backend dùng để gửi push) — ai giữ, lưu ở đâu, có secret manager không?

31. **[3RD]** **iOS chưa cấu hình**: chưa có APNs key trên Firebase, `app.json` chỉ có `ios: { supportsTablet: true }`, không có `NSUserNotificationsUsageDescription`. Vậy push trên iOS **đã từng chạy chưa**?

32. **[SÂU]** `onTokenRefresh` là cơ chế duy nhất đồng bộ token sau đăng nhập. Nếu token xoay lúc app **không chạy**, app biết được không? Có nên gọi `getToken()` + đồng bộ mỗi lần mở app không?

---

## E. Đào sâu

33. **[SÂU]** Deep link từ push: app bị kill + người dùng **chưa đăng nhập** ⇒ `router.push('/(messages)/detailMessage')` sẽ bị guard đá về login. Sau khi đăng nhập có quay lại đúng màn không?
    - `↳` `redirectStore` chỉ được set trong `useProtectedRoute` khi chặn route thuộc nhóm `returnTo`-eligible — `(messages)` **có** trong danh sách đó. Nhưng thứ tự chạy giữa `getInitialNotification` và guard cần kiểm chứng thực tế.

34. **[SÂU]** Thiết kế test cho `resolvePushRoute`: liệt kê các case bạn sẽ viết. So sánh với test đang có ở `__tests__/resolvePushRoute.test.ts` (140 dòng).

35. **[SÂU]** Nếu phải hỗ trợ thông báo có **hình ảnh** và **nút hành động** (trả lời nhanh), kiến trúc hiện tại phải đổi gì?

36. **[SÂU]** Đo lường: bạn biết bao nhiêu % push được mở không? Có analytics không? Nếu không thì bạn tối ưu nội dung push dựa vào gì?

---

## F. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                      | Hướng trả lời                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| iOS chưa từng cấu hình APNs                 | Nêu rõ phạm vi đồ án là Android; liệt kê đủ việc cần làm cho iOS                   |
| `logout()` không huỷ device token           | Lỗ hổng riêng tư thật, cần endpoint `DELETE /auth/device-token`                    |
| Timeout 5s có thể bỏ lỡ token, không retry  | Thừa nhận; hướng vá: đồng bộ lại token ở lần mở app kế tiếp                        |
| Không có notification channel               | Thừa nhận; Android 8+ nên có ít nhất 2 channel (chat / tuyển dụng)                 |
| Backend gửi `route` không tồn tại trong app | Chỉ ra rằng app đã phòng thủ đúng (hạ xuống fallback), nhưng hợp đồng cần chốt lại |
| `device_id` mồ côi sau khi gỡ app           | Thừa nhận; backend nên TTL bản ghi device token                                    |
