# 03 — Nhắn tin realtime (Messaging)

> Feature **duy nhất** không lấy React Query làm nguồn sự thật. Nguồn sự thật là Zustand,
> socket đẩy thẳng vào store.

## 0. Bản đồ file

| File                                                                                                                                       | Vai trò                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| [shared/infrastructure/socket/socketService.ts](../../shared/infrastructure/socket/socketService.ts)                                       | Singleton Socket.IO, 11 sự kiện             |
| [shared/presentation/providers/SocketProvider.tsx](../../shared/presentation/providers/SocketProvider.tsx)                                 | Vòng đời socket theo auth + AppState        |
| [features/messaging/presentation/store/messagingStore.ts](../../features/messaging/presentation/store/messagingStore.ts)                   | Nguồn sự thật (452 dòng, chuẩn hoá theo id) |
| [features/messaging/presentation/hooks/useConversationMessages.ts](../../features/messaging/presentation/hooks/useConversationMessages.ts) | Toàn bộ data + realtime của 1 hội thoại     |
| [features/messaging/domain/utils/messageContent.ts](../../features/messaging/domain/utils/messageContent.ts)                               | Giao thức `JOB_REF`, preview, attachment    |
| [features/messaging/data/datasources/messagingRemoteDataSource.ts](../../features/messaging/data/datasources/messagingRemoteDataSource.ts) | 13 endpoint REST                            |
| [features/messaging/presentation/screens/NotificationsScreen.tsx](../../features/messaging/presentation/screens/NotificationsScreen.tsx)   | Danh sách hội thoại (tab "Thông báo")       |

---

## A. Kiến trúc

1. **[KT]** Vì sao messaging dùng **Zustand** làm nguồn sự thật thay vì React Query như mọi feature khác? Bảo vệ lựa chọn này.
    - `↳` Comment ở `useConversationMessages.ts:14-21`: socket đẩy tin/typing/online vào store; nếu vừa React Query vừa store thì có **hai cache tranh nhau**.

2. **[KT]** Nhưng `useMessagingApi.ts` vẫn có đầy đủ hook React Query và được dùng ở nơi khác. Vậy có đúng là "hai cơ chế state cho cùng một domain" không? Bạn hợp nhất thế nào?

3. **[SÂU]** `socketService` (shared/infrastructure) **import trực tiếp** `useMessagingStore` (features/messaging/presentation). Đây là dependency ngược. Vì sao đặt socket ở `shared` mà không đặt trong `features/messaging`?

4. **[KT]** `messagingStore` dùng cấu trúc chuẩn hoá `Record<id, T>` (`messagesById`). Lợi ích so với mảng lồng? Cho ví dụ thao tác nào nhanh hơn hẳn.
    - `↳` `message:read` chỉ có `messageId` → tra ngược `conversationId` bằng `store.messagesById[messageId]?.conversationId` (`socketService.ts:186`).

5. **[SÂU]** `onlineUsers` là `Set` — mutable, còn Zustand so sánh **tham chiếu**. Bạn có tạo `Set` mới mỗi lần cập nhật không? Nếu không thì component sẽ **không re-render**. Chỉ chỗ code chứng minh.

6. **[KT]** `NotificationsScreen` **gọi `messagingRepository` trực tiếp trong component**, trong khi màn phòng chat đã gom hết vào `useConversationMessages`. Vì sao chưa sửa nốt?

---

## B. Luồng đi

### B1. Vòng đời socket

7. **[LUỒNG]** Ai sở hữu vòng đời socket và nó connect/disconnect theo điều kiện nào?
    - `↳` `SocketProvider` mount một lần ở `app/_layout.tsx`; effect phụ thuộc `userId` + `accessToken` (primitive, không phải object user để tránh reconnect thừa).

8. **[LUỒNG]** **Vì sao chủ động ngắt socket khi app xuống nền?** Đây là quyết định đắt giá — giải thích ràng buộc hai chiều với backend.
    - `↳` `SocketProvider.tsx:47-50`: messaging-service chỉ push cho người **offline**. Socket còn sống = coi là online = **không gửi push**. Không ngắt thì người dùng không bao giờ nhận thông báo tin nhắn.

9. **[SÂU]** Hệ quả: mỗi lần chuyển foreground/background là một vòng handshake + auth. Người dùng chuyển app 50 lần/ngày = 50 handshake. Chi phí pin/băng thông đã đo chưa? Có cách nào rẻ hơn (ví dụ backend dùng `last_seen` thay vì trạng thái socket)?

10. **[SÂU]** Nếu backend đổi cách xác định "offline", app có phải sửa không? Hợp đồng này được ghi ở đâu ngoài comment trong code?

### B2. Mở một hội thoại

11. **[LUỒNG]** Kể tuần tự những gì `useConversationMessages` làm khi `conversationId` đổi.
    - `↳` (1) `GET /conversations/{id}`; (2) `fetchMessages()` — hiện cache ngay nhưng **luôn** gọi lại API; (3) `setActiveConversation` + `socketService.joinConversation` + `clearUnread` + `POST .../read`; cleanup: `leaveConversation` + `stopTyping`.

12. **[SÂU]** Vì sao **luôn** gọi lại API dù đã có cache?
    - `↳` Comment `useConversationMessages.ts:81-88`: socket bị ngắt lúc app ở nền nên tin nhắn đến trong khoảng đó **không** về qua socket. Chỉ đọc cache thì mở chat từ push sẽ không thấy chính tin vừa được báo.

13. **[LUỒNG]** Có thêm listener `AppState` gọi lại `fetchMessages()` khi quay lại foreground. Vì sao cần cả hai (mount + AppState)?

14. **[SÂU]** `joinConversation()` chỉ `console.warn` rồi return nếu socket chưa connect. Người dùng mở phòng lúc mạng chậm thì sao? Có retry không? Thiết kế cách vá.

### B3. Gửi tin nhắn

15. **[LUỒNG]** Kể luồng gửi một tin nhắn văn bản.
    - `↳` `POST /messages` → **chờ response** → `addMessage(conversationId, sent)`.

16. **[BIZ]** **Không có optimistic UI**. Trên mạng 3G người dùng chờ bao lâu mới thấy tin mình gửi? Vì sao chưa làm, và làm thì phải xử lý gì (id tạm, trạng thái sending/failed, dedupe khi socket đẩy về)?

17. **[LUỒNG]** Gửi tệp đính kèm đi mấy bước?
    - `↳` 2 bước: `POST /storage/upload` (multipart) lấy `url` → `POST /messages` với `attachmentUrl` + `attachmentType` suy từ MIME.

18. **[SÂU]** Đính kèm chat dùng **axios** (`apiClient.post` với `Content-Type: multipart/form-data` đặt tay) — chính đường mà `multipartUpload.ts` cảnh báo là gửi body rỗng trên RN. Đã gặp lỗi chưa? Vì sao chưa chuyển sang `postMultipartWithFetch`?

---

## C. Business logic

19. **[BIZ]** Giải thích giao thức `:::JOB_REF:{json}:::\n<text>`. Nó giải quyết bài toán gì?
    - `↳` `messageContent.ts:17` — nhúng thẻ job vào tin nhắn đầu tiên của hội thoại khởi nguồn từ một tin tuyển dụng, để người nhận thấy card giàu thông tin.

20. **[SÂU]** Vì sao **nhúng JSON vào trường `content`** thay vì dùng `message_type` + `metadata` riêng? Nếu người dùng gõ tay đúng chuỗi đó thì sao? Nếu `title` chứa `:::` thì sao?

21. **[BIZ]** Giao thức JOB_REF **dùng chung với bản web** — "sửa một bên phải sửa cả hai". Hợp đồng này được version hoá ở đâu? Nếu web đổi format trước, app cũ hiển thị gì?

22. **[BIZ]** `getConversationPreview()` xử lý mấy trường hợp và theo thứ tự ưu tiên nào?
    - `↳` deleted → JOB_REF → attachment (image/video/audio/file) → content → "Chưa có tin nhắn".

23. **[BIZ]** Trạng thái "đã xem" tính thế nào?
    - `↳` `isMessageSeenBy()` — kiểm tra `userId` có trong mảng `readBy` không.

24. **[BIZ]** Sự kiện `message:read` đến ở **hai dạng payload khác nhau** tuỳ nguồn. Mô tả cả hai và cách app chuẩn hoá.
    - `↳` Gateway gửi `{messageId, userId}`; REST gửi `{messageId, readerId, conversationId}`. App làm `payload.readerId ?? payload.userId` và tra ngược `conversationId` từ store.

25. **[SÂU]** Vì sao app phải chuẩn hoá thay vì backend thống nhất? Ai sở hữu hợp đồng sự kiện này?

26. **[BIZ]** Mọi hội thoại tạo mới đều đặt `name: 'TL-MESS'`. Chuỗi này là gì? Vì sao còn tên cũ "TL" khi sản phẩm đã đổi tên Soundspal?

27. **[BIZ]** `isGroup` có trong type nhưng **không có UI chat nhóm**. Giữ để làm gì?

28. **[BIZ]** Typing indicator: timeout 3 giây (`TYPING_TIMEOUT_MS`). Cơ chế debounce hoạt động ra sao và vì sao cần cả `startTyping` lẫn `stopTyping`?

---

## D. Bên thứ ba — Socket.IO

29. **[3RD]** Token được gửi ở **cả 3 chỗ**: `auth`, `query`, `extraHeaders`. Vì sao? Rủi ro khi token nằm trong **query string** là gì?
    - `↳` Query string bị ghi vào access log của nginx/proxy → token rò rỉ vào log.

30. **[3RD]** `extraHeaders` chỉ có tác dụng với transport **polling**, không dùng được cho WebSocket thuần. Bạn có biết điều đó không? Vậy nó tồn tại để làm gì?

31. **[SÂU]** Socket dùng `accessToken` tại thời điểm connect và **không bao giờ cập nhật khi token được refresh**. Sau khi token hết hạn, chuyện gì xảy ra theo trình tự?
    - `↳` Server đá ra (`io server disconnect`) → `handleDisconnect()` → `disconnect()` + `connect()` lại. Nếu store chưa kịp refresh thì dùng lại token cũ → vòng lặp.

32. **[SÂU]** Cờ `hasAttemptedTokenRefresh` được **khai báo và reset ở 3 nơi nhưng không bao giờ gán `true`**. Điều kiện `!this.hasAttemptedTokenRefresh` luôn đúng. Hệ quả là gì?

33. **[SÂU]** `this.isConnecting = false` được đặt **ngay sau khi gọi `io()`** (dòng 66), không phải sau khi `connect` thành công. Guard chống kết nối trùng còn tác dụng không?

34. **[SÂU]** Có **hai cơ chế reconnect chồng nhau**: `reconnectionAttempts: 5` của Socket.IO **và** backoff thủ công 5 lần trong `handleConnectionError`. Tổng cộng bao nhiêu lần thử? Có tạo storm không?

35. **[SÂU]** Sau 5 lần thất bại, `hasReachedMaxAttempts = true` và **ngừng hẳn cho tới khi khởi động lại app**. Người dùng mất mạng 1 phút rồi có lại — app im lặng mãi mãi. Vì sao không lắng nghe `NetInfo` để reset? (Lưu ý: `AppState` chuyển sang `active` **có** gọi lại `connect()`, nhưng `connect()` return `null` ngay vì cờ này.)

36. **[3RD]** `users:online` đã wire ở client nhưng **backend chưa gửi**. Lúc mới vào app, trạng thái online hiển thị sai trong bao lâu? Có fallback nào không?

37. **[3RD]** Sự kiện socket **không có schema validation** (không Zod). Backend đổi tên trường thì app crash hay im lặng sai? Kiểm chứng bằng gì?

38. **[3RD]** Không có **acknowledgement / ordering / dedupe**. Socket đẩy trùng `message:new` sau reconnect thì tin nhắn có nhân đôi không? Chỉ chỗ trong `messagingStore` xử lý (hoặc không xử lý).

39. **[SÂU]** Vì sao chọn Socket.IO thay vì WebSocket thuần / SSE / MQTT? Đánh đổi: overhead giao thức, fallback polling, yêu cầu sticky session ở load balancer.

40. **[3RD]** Yêu cầu hạ tầng production: nginx phải `proxy_set_header Upgrade`, LB phải sticky session hoặc dùng redis-adapter. Bạn đã **kiểm chứng** môi trường thật đáp ứng chưa, hay chỉ ghi trong tài liệu?

41. **[3RD]** `setQueryClient()` lưu `queryClient` vào service nhưng **biến đó không được dùng ở đâu**. Code chết — dự định ban đầu là gì?

---

## E. Đào sâu

42. **[SÂU]** **Không có phân trang tin nhắn** — `GET /messages/conversation/{id}` tải toàn bộ. Phòng 10 000 tin thì sao? `prependMessages()` đã có sẵn trong store nhưng chưa dùng — vì sao?

43. **[SÂU]** Tìm kiếm hội thoại lọc **phía client** ⇒ chỉ tìm trong danh sách đã tải. Danh sách hội thoại có phân trang không (`GET /conversations` không nhận param)?

44. **[SÂU]** Giới hạn 10 MB kiểm tra ở client. Server có kiểm tra không? Có quét virus/nội dung không?

45. **[SÂU]** File upload lên `/storage/upload` trả về URL. URL đó có **public** không? Người ngoài đoán được URL có xem được tin nhắn riêng tư không? Đây là câu hỏi bảo mật quan trọng — bạn kiểm chứng bằng cách nào?

46. **[SÂU]** **Không có mã hoá đầu-cuối**. Với app có chat riêng tư, bạn nói gì nếu hội đồng hỏi về quyền riêng tư tin nhắn? Chi phí thật để thêm E2EE là bao nhiêu?

47. **[SÂU]** `socketService` log ra `Socket ID`, `senderId`, `conversationId` của **mọi** tin nhắn, không guard `__DEV__`. Vi phạm quyền riêng tư ở mức nào?

48. **[SÂU]** Nếu socket đẩy `message:new` vào Zustand nhưng `useGetConversations` (React Query) vẫn giữ bản cũ, hai màn hình hiển thị khác nhau. Đã xử lý chưa? Bằng cách nào?

---

## F. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                                   | Hướng trả lời                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `hasAttemptedTokenRefresh` không bao giờ được set `true` | Bug thật, thừa nhận thẳng, nêu 1 dòng sửa                                |
| `isConnecting` reset quá sớm                             | Guard gần như vô tác dụng; nêu cách sửa (reset trong callback `connect`) |
| Sau 5 lần fail thì im lặng vĩnh viễn                     | Nêu `NetInfo` làm tín hiệu reset — chi phí sửa nhỏ, tác động lớn         |
| Không phân trang tin nhắn                                | `prependMessages()` đã sẵn sàng; chỉ thiếu endpoint cursor từ backend    |
| Không optimistic UI                                      | Thừa nhận là trải nghiệm kém trên mạng chậm; nêu 3 việc phải làm         |
| JOB_REF nhúng JSON trong `content`                       | Thừa nhận là giao thức yếu, nhưng phải tương thích web đang chạy         |
| Socket không cập nhật token sau refresh                  | Điểm yếu thiết kế thật; cách vá là reconnect trong `setCredentials`      |
